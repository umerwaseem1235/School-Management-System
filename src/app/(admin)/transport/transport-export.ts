import type {
  FleetVehicleRecord,
  StudentTransportAllocationRecord,
  TransportDriverRecord,
  TransportRouteRecord,
} from "@/lib/mock/transport";
import { formatCurrency, formatDate } from "@/lib/format";

function sanitizePdfText(input: string): string {
  return input
    .replace(/[—–]/g, "-")
    .replace(/·/g, "|")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function buildMinimalPdf(
  pagesStreams: string[],
  orientation: "portrait" | "landscape" = "portrait"
): Blob {
  const objects: string[] = [];
  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject("");
  const pagesId = addObject("");
  const fontRegularId = addObject(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`
  );
  const fontBoldId = addObject(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`
  );

  const mediaBox =
    orientation === "landscape"
      ? "[0 0 841.89 595.28]"
      : "[0 0 595.28 841.89]";

  const pageIds: number[] = [];

  for (const stream of pagesStreams) {
    const streamBytes = new TextEncoder().encode(stream).length;
    const contentId = addObject(
      `<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream`
    );
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox ${mediaBox} /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${pageIds.length} >>`;

  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let byteOffset = 0;

  const pushChunk = (str: string) => {
    chunks.push(str);
    byteOffset += encoder.encode(str).length;
  };

  pushChunk("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(byteOffset);
    pushChunk(`${i + 1} 0 obj\n${objects[i]}\nendobj\n`);
  }

  const xrefOffset = byteOffset;
  pushChunk(`xref\n0 ${objects.length + 1}\n`);
  pushChunk("0000000000 65535 f \n");
  for (const off of offsets) {
    pushChunk(`${String(off).padStart(10, "0")} 00000 n \n`);
  }

  pushChunk(
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob([chunks.join("")], { type: "application/pdf" });
}

function pdfText(
  x: number,
  y: number,
  text: string,
  font: "F1" | "F2" = "F1",
  size = 9,
  rgb: [number, number, number] = [0.08, 0.12, 0.2]
): string {
  const [r, g, b] = rgb;
  return `BT /${font} ${size} Tf ${r} ${g} ${b} rg ${x} ${y} Td (${sanitizePdfText(
    text
  )}) Tj ET\n`;
}

function pdfRect(
  x: number,
  y: number,
  w: number,
  h: number,
  fillRgb: [number, number, number]
): string {
  const [r, g, b] = fillRgb;
  return `${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f\n`;
}

/* ───────────────────── 1. Bulk Transport Routes PDF ───────────────────── */

export function exportRoutesPdf(routes: TransportRouteRecord[]) {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalRiders = routes.reduce((s, r) => s + r.allocatedStudents, 0);
  let s = "";

  s += pdfRect(28, 526, 785, 46, [0.04, 0.11, 0.24]);
  s += pdfText(
    40,
    558,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    12.5,
    [1, 1, 1]
  );
  s += pdfText(
    40,
    544,
    "Institutional Transport Routes & Timed Stops Schedule",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Active Routes: ${routes.length}  |  Total Enrolled Riders: ${totalRiders} Students`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Route Code" },
    { x: 115, label: "Route Corridor & Stops" },
    { x: 320, label: "Campus & Vehicle" },
    { x: 465, label: "Assigned Driver" },
    { x: 590, label: "Occupancy" },
    { x: 665, label: "Monthly Fee" },
    { x: 745, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  routes.forEach((r, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, r.routeCode, "F2", 8);
    s += pdfText(
      115,
      y,
      `${r.routeName.slice(0, 32)} (${r.stops.length} Stops)`,
      "F1",
      8
    );
    s += pdfText(320, y, `${r.campus} - ${r.vehicleRegNo}`, "F1", 8);
    s += pdfText(465, y, r.driverName.slice(0, 22), "F1", 8);
    s += pdfText(
      590,
      y,
      `${r.allocatedStudents} / ${r.seatCapacity} Seats`,
      "F2",
      8
    );
    s += pdfText(
      665,
      y,
      formatCurrency(r.monthlyRouteFee),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(745, y, r.status, "F2", 8);
    y -= 24;
  });

  s += pdfText(
    34,
    24,
    "Confidential Fleet & Transport Record - EduSphere Super Admin Operations Suite",
    "F1",
    7.5,
    [0.45, 0.5, 0.58]
  );

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Transport-Routes-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 2. Bulk Vehicle Fleet PDF ───────────────────── */

export function exportFleetPdf(vehicles: FleetVehicleRecord[]) {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let s = "";
  s += pdfRect(28, 526, 785, 46, [0.04, 0.11, 0.24]);
  s += pdfText(
    40,
    558,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    12.5,
    [1, 1, 1]
  );
  s += pdfText(
    40,
    544,
    "Institutional Vehicle Fleet, Fitness & Monthly Fuel Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Fleet Vehicles: ${vehicles.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Reg # / Code" },
    { x: 130, label: "Make, Model & Type" },
    { x: 325, label: "Campus & Route" },
    { x: 465, label: "Assigned Driver" },
    { x: 590, label: "Seats" },
    { x: 650, label: "Fuel Spend" },
    { x: 740, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  vehicles.forEach((v, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, `${v.registrationNo}`, "F2", 8);
    s += pdfText(130, y, v.makeModel.slice(0, 34), "F1", 8);
    s += pdfText(325, y, `${v.campus} (${v.assignedRouteCode})`, "F1", 8);
    s += pdfText(465, y, v.assignedDriver.slice(0, 22), "F1", 8);
    s += pdfText(
      590,
      y,
      `${v.occupiedSeats}/${v.seatingCapacity}`,
      "F2",
      8
    );
    s += pdfText(
      650,
      y,
      formatCurrency(v.monthlyFuelCost),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(740, y, v.status, "F2", 8);
    y -= 24;
  });

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Vehicle-Fleet-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 3. Bulk Drivers Roster PDF ───────────────────── */

export function exportDriversPdf(drivers: TransportDriverRecord[]) {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let s = "";
  s += pdfRect(28, 526, 785, 46, [0.04, 0.11, 0.24]);
  s += pdfText(
    40,
    558,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    12.5,
    [1, 1, 1]
  );
  s += pdfText(
    40,
    544,
    "Licensed Institutional Drivers & Conductors Roster",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Drivers: ${drivers.length}  |  100% HTV & Police Verified`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Driver Code" },
    { x: 115, label: "Full Name & CNIC" },
    { x: 295, label: "HTV License #" },
    { x: 435, label: "Campus & Vehicle" },
    { x: 585, label: "Contact Phone" },
    { x: 685, label: "Exp (Yrs)" },
    { x: 745, label: "Duty Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  drivers.forEach((d, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, d.driverCode, "F2", 8);
    s += pdfText(115, y, `${d.fullName} (${d.cnic})`, "F1", 8);
    s += pdfText(295, y, `${d.htvLicenseNo}`, "F2", 8);
    s += pdfText(435, y, `${d.campus} - ${d.assignedVehicleReg}`, "F1", 8);
    s += pdfText(585, y, d.phone, "F1", 8);
    s += pdfText(685, y, `${d.experienceYears} Yrs`, "F2", 8);
    s += pdfText(745, y, d.status, "F2", 8);
    y -= 24;
  });

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Transport-Drivers-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 4. Bulk Student Route Allocations PDF ───────────────────── */

export function exportStudentAllocationsPdf(
  allocations: StudentTransportAllocationRecord[]
) {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let s = "";
  s += pdfRect(28, 526, 785, 46, [0.04, 0.11, 0.24]);
  s += pdfText(
    40,
    558,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    12.5,
    [1, 1, 1]
  );
  s += pdfText(
    40,
    544,
    "Student Transport Pass & Route Allocation Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Allocated Students: ${allocations.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Pass #" },
    { x: 115, label: "Student & Class" },
    { x: 265, label: "Route & Vehicle" },
    { x: 435, label: "Pickup Stop & Time" },
    { x: 615, label: "Seat #" },
    { x: 675, label: "Monthly Fee" },
    { x: 745, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  allocations.forEach((a, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, a.passNo, "F2", 8);
    s += pdfText(
      115,
      y,
      `${a.studentName} (${a.className} #${a.rollNo})`,
      "F1",
      8
    );
    s += pdfText(265, y, `${a.routeCode} (${a.vehicleRegNo})`, "F2", 8);
    s += pdfText(
      435,
      y,
      `${a.pickupStop.slice(0, 22)} (${a.pickupTime})`,
      "F1",
      7.5
    );
    s += pdfText(615, y, a.seatNo, "F2", 8);
    s += pdfText(
      675,
      y,
      formatCurrency(a.monthlyTransportFee),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(745, y, a.status, "F2", 8);
    y -= 24;
  });

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Student-Transport-Allocations-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 5. Single Route Manifest PDF ───────────────────── */

export function exportSingleRouteCardPdf(route: TransportRouteRecord) {
  let s = "";

  s += pdfRect(36, 742, 523, 62, [0.04, 0.11, 0.24]);
  s += pdfText(
    50,
    782,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    50,
    766,
    "Official Route Corridor Manifest & Timed Stops Schedule",
    "F2",
    9.5,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    50,
    752,
    `Route Code: ${route.routeCode}  |  Campus: ${route.campus}  |  Vehicle: ${route.vehicleRegNo}`,
    "F1",
    8,
    [0.75, 0.82, 0.92]
  );

  s += pdfRect(36, 635, 523, 92, [0.96, 0.97, 0.99]);
  s += pdfText(
    48,
    710,
    "ROUTE & CREW ASSIGNMENT",
    "F2",
    9,
    [0.04, 0.11, 0.24]
  );
  s += pdfText(48, 692, `Corridor: ${route.routeName}`, "F2", 9.5);
  s += pdfText(
    48,
    676,
    `Vehicle: ${route.vehicleModel} (${route.vehicleRegNo})  |  GPS: ${route.gpsTrackerId}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    660,
    `Driver: ${route.driverName} (${route.driverPhone})  |  Conductor: ${route.conductorName}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    644,
    `Occupancy: ${route.allocatedStudents} / ${route.seatCapacity} Seats  |  Monthly Fee: ${formatCurrency(
      route.monthlyRouteFee
    )}`,
    "F2",
    8.5,
    [0.02, 0.45, 0.3]
  );

  s += pdfText(
    48,
    605,
    "DESIGNATED PICKUP & DROP-OFF STOPS",
    "F2",
    9,
    [0.04, 0.11, 0.24]
  );

  let y = 582;
  route.stops.forEach((st) => {
    s += pdfText(
      48,
      y,
      `Stop #${st.stopOrder}: ${st.stopName} (${st.landmark})  |  Pickup: ${st.morningPickup}  |  Drop: ${st.afternoonDrop}  |  ${st.studentsCount} Students`,
      "F1",
      8
    );
    y -= 20;
  });

  const blob = buildMinimalPdf([s], "portrait");
  triggerBlobDownload(blob, `Transport-Route-Manifest-${route.routeCode}.pdf`);
}

/* ───────────────────── 6. Print Preview Helpers ───────────────────── */

export function printTransportRoutesRegister(
  routes: TransportRouteRecord[]
): boolean {
  const win = window.open("", "_blank", "width=1080,height=780");
  if (!win) return false;

  const totalSeats = routes.reduce((s, r) => s + r.seatCapacity, 0);
  const totalOccupied = routes.reduce((s, r) => s + r.allocatedStudents, 0);

  const rowsHtml = routes
    .map(
      (r) => `
      <tr>
        <td class="mono bold">${r.routeCode}<br/><span class="muted">${r.campus}</span></td>
        <td><strong>${r.routeName}</strong><br/><span class="muted">${r.stops.length} Timed Stops · ${r.distanceKm} km</span></td>
        <td class="mono">${r.vehicleRegNo}<br/><span class="muted">${r.vehicleModel}</span></td>
        <td>${r.driverName}<br/><span class="muted mono">${r.driverPhone}</span></td>
        <td class="mono center">${r.morningDeparture} → ${r.campusArrival}</td>
        <td class="mono center bold">${r.allocatedStudents} / ${r.seatCapacity}</td>
        <td class="mono right bold emerald">${formatCurrency(r.monthlyRouteFee)}</td>
        <td class="center"><span class="badge">${r.status}</span></td>
      </tr>`
    )
    .join("");

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>EduSphere — Institutional Transport & Fleet Register</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0f172a; padding: 28px; background: #fff; }
    .banner {
      background: #091d3e;
      color: #ffffff;
      padding: 18px 22px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .banner h1 { font-size: 18px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; }
    .banner p { font-size: 12px; color: #cbd5e1; margin-top: 3px; font-weight: 500; }
    .banner .meta { text-align: right; font-size: 11px; color: #e2e8f0; line-height: 1.5; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
    .kpi span { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .kpi strong { display: block; font-size: 15px; color: #091d3e; margin-top: 3px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    th { background: #091d3e; color: #fff; text-align: left; padding: 8px 10px; font-size: 10.5px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tr:nth-child(even) { background: #f8fafc; }
    .mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
    .bold { font-weight: 700; }
    .emerald { color: #047857; }
    .muted { font-size: 10px; color: #64748b; }
    .right { text-align: right; }
    .center { text-align: center; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <div class="banner">
    <div>
      <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
      <p>Institutional Transport Routes, Fleet & Rider Allocation Register — AY 2026–27</p>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</div>
      <div><strong>Active Routes:</strong> ${routes.length} Corridors</div>
      <div><strong>Authority:</strong> Operations & Fleet Control</div>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><span>Active Bus Corridors</span><strong>${routes.length} Routes</strong></div>
    <div class="kpi"><span>Total Fleet Capacity</span><strong>${totalSeats} Seats</strong></div>
    <div class="kpi"><span>Allocated Student Riders</span><strong>${totalOccupied} Students</strong></div>
    <div class="kpi"><span>Fleet Seat Utilization</span><strong>${Math.round(
      (totalOccupied / Math.max(1, totalSeats)) * 100
    )}% Occupied</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Route Code</th>
        <th>Route Corridor & Distance</th>
        <th>Assigned Vehicle</th>
        <th>Driver & Contact</th>
        <th class="center">Morning Schedule</th>
        <th class="center">Seat Load</th>
        <th class="right">Monthly Fee</th>
        <th class="center">Status</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`);
  win.document.close();
  return true;
}
