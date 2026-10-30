import { formatNumber } from "@/lib/format";
import { printHtml } from "@/lib/print-html";
import type {
  TransportAssignmentRecord,
  TransportRouteRecord,
  TransportVehicleRecord,
} from "@/lib/mock/transport";

function escapePdf(s: string): string {
  return s
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfText(
  x: number,
  y: number,
  text: string,
  font: "F1" | "F2" = "F1",
  size = 9,
  rgb: [number, number, number] = [0.08, 0.12, 0.2]
): string {
  return `BT /${font} ${size} Tf ${rgb[0]} ${rgb[1]} ${rgb[2]} rg ${x} ${y} Td (${escapePdf(
    text
  )}) Tj ET\n`;
}

function pdfRect(
  x: number,
  y: number,
  w: number,
  h: number,
  rgb: [number, number, number]
): string {
  return `${rgb[0]} ${rgb[1]} ${rgb[2]} rg ${x} ${y} ${w} ${h} re f\n`;
}

function buildMultiPagePdf(streams: string[], width = 842, height = 595): Blob {
  const objects: string[] = [];
  const pageCount = streams.length;
  const firstPageObj = 5;

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const kids = Array.from(
    { length: pageCount },
    (_, i) => `${firstPageObj + i * 2} 0 R`
  ).join(" ");
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`
  );
  objects.push(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n"
  );

  streams.forEach((stream, idx) => {
    const pageObjNum = firstPageObj + idx * 2;
    const contentObjNum = pageObjNum + 1;
    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function exportTransportRoutesPdf(
  routes: TransportRouteRecord[],
  vehicles: TransportVehicleRecord[],
  assignments: TransportAssignmentRecord[]
) {
  let s = "";
  s += pdfRect(0, 535, 842, 60, [0.035, 0.114, 0.243]);
  s += pdfText(
    36,
    566,
    "OPUS SCHOOL MANAGEMENT SYSTEM - TRANSPORT ROUTES REGISTER",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    36,
    548,
    `Total Routes: ${routes.length}   |   Total Fleet Vehicles: ${vehicles.length}   |   Assigned Students: ${assignments.length}`,
    "F1",
    9,
    [0.82, 0.88, 0.96]
  );

  const tableTop = 500;
  s += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  s += pdfText(46, tableTop + 7, "CODE", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(130, tableTop + 7, "ROUTE NAME", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(430, tableTop + 7, "ASSIGNED VEHICLE", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(590, tableTop + 7, "STUDENTS", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(690, tableTop + 7, "MONTHLY FARE", "F2", 8.5, [0.1, 0.18, 0.32]);

  routes.slice(0, 18).forEach((r, idx) => {
    const y = tableTop - (idx + 1) * 22;
    if (idx % 2 === 1) {
      s += pdfRect(36, y, 770, 22, [0.975, 0.98, 0.99]);
    }
    const assignedVeh =
      vehicles
        .filter((v) => v.routeId === r.id || v.routeName === r.routeName)
        .map((v) => v.vehicleNo)
        .join(", ") || "-";
    const studentCount = assignments.filter(
      (a) => a.routeId === r.id || a.routeName === r.routeName
    ).length;

    s += pdfText(46, y + 7, r.routeCode, "F2", 8.5);
    s += pdfText(130, y + 7, r.routeName.slice(0, 48), "F1", 8.5);
    s += pdfText(430, y + 7, assignedVeh, "F1", 8.5);
    s += pdfText(590, y + 7, `${studentCount} Students`, "F1", 8.5);
    s += pdfText(690, y + 7, `Rs ${formatNumber(r.monthlyFare)}`, "F2", 8.5);
  });

  const blob = buildMultiPagePdf([s]);
  triggerDownload(blob, "transport-routes-register.pdf");
}

export function exportTransportVehiclesPdf(vehicles: TransportVehicleRecord[]) {
  let s = "";
  s += pdfRect(0, 535, 842, 60, [0.035, 0.114, 0.243]);
  s += pdfText(
    36,
    566,
    "OPUS SCHOOL MANAGEMENT SYSTEM - TRANSPORT VEHICLES REGISTER",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    36,
    548,
    `Total Vehicles: ${vehicles.length}   |   Total Capacity: ${vehicles.reduce(
      (sum, v) => sum + v.capacity,
      0
    )} Seats`,
    "F1",
    9,
    [0.82, 0.88, 0.96]
  );

  const tableTop = 500;
  s += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  s += pdfText(46, tableTop + 7, "VEHICLE NO", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(155, tableTop + 7, "MODEL", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(325, tableTop + 7, "DRIVER NAME", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(490, tableTop + 7, "CAPACITY", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(575, tableTop + 7, "ASSIGNED ROUTE", "F2", 8.5, [0.1, 0.18, 0.32]);

  vehicles.slice(0, 18).forEach((v, idx) => {
    const y = tableTop - (idx + 1) * 22;
    if (idx % 2 === 1) {
      s += pdfRect(36, y, 770, 22, [0.975, 0.98, 0.99]);
    }
    const driverDisplay = v.driverPhone
      ? `${v.driverName} (${v.driverPhone})`
      : v.driverName || "-";
    s += pdfText(46, y + 7, v.vehicleNo, "F2", 8.5);
    s += pdfText(155, y + 7, v.model.slice(0, 28), "F1", 8.5);
    s += pdfText(325, y + 7, driverDisplay.slice(0, 28), "F1", 8.5);
    s += pdfText(490, y + 7, `${v.capacity} Seats`, "F2", 8.5);
    s += pdfText(575, y + 7, (v.routeName || "-").slice(0, 36), "F1", 8.5);
  });

  const blob = buildMultiPagePdf([s]);
  triggerDownload(blob, "transport-vehicles-register.pdf");
}

export function exportVehicleStudentsPdf(
  vehicle: TransportVehicleRecord,
  students: TransportAssignmentRecord[]
) {
  let s = "";
  const printedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const totalMonthlyFare = students.reduce((sum, st) => sum + st.monthlyFare, 0);
  const availableSeats = Math.max(0, vehicle.capacity - students.length);
  const driverLabel = vehicle.driverPhone
    ? `${vehicle.driverName} (${vehicle.driverPhone})`
    : vehicle.driverName || "Not Assigned";

  // Navy Header Banner
  s += pdfRect(0, 525, 842, 70, [0.035, 0.114, 0.243]);
  s += pdfText(
    36,
    566,
    `OPUS SCHOOL MANAGEMENT SYSTEM - VEHICLE STUDENT MANIFEST`,
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    36,
    548,
    `Vehicle: ${vehicle.vehicleNo} (${vehicle.model})   |   Code: ${vehicle.vehicleCode}   |   Driver: ${driverLabel}`,
    "F2",
    9.5,
    [0.9, 0.94, 1]
  );
  s += pdfText(
    36,
    533,
    `Route: ${vehicle.routeName || "Unassigned"}   |   Occupancy: ${students.length}/${vehicle.capacity} Seats (${availableSeats} Free)   |   Date: ${printedDate}`,
    "F1",
    8.5,
    [0.78, 0.85, 0.95]
  );

  // KPI Summary Strip
  const stripY = 482;
  s += pdfRect(36, stripY, 770, 30, [0.95, 0.97, 0.99]);
  s += pdfText(48, stripY + 17, "VEHICLE & MODEL:", "F2", 7.5, [0.38, 0.45, 0.55]);
  s += pdfText(48, stripY + 6, `${vehicle.vehicleNo} - ${vehicle.model}`, "F2", 9, [0.035, 0.114, 0.243]);

  s += pdfText(245, stripY + 17, "ASSIGNED DRIVER:", "F2", 7.5, [0.38, 0.45, 0.55]);
  s += pdfText(245, stripY + 6, driverLabel.slice(0, 32), "F2", 9, [0.035, 0.114, 0.243]);

  s += pdfText(455, stripY + 17, "BOARDING STUDENTS:", "F2", 7.5, [0.38, 0.45, 0.55]);
  s += pdfText(455, stripY + 6, `${students.length} of ${vehicle.capacity} Seats`, "F2", 9, [0.035, 0.114, 0.243]);

  s += pdfText(635, stripY + 17, "TOTAL MONTHLY FARE:", "F2", 7.5, [0.38, 0.45, 0.55]);
  s += pdfText(635, stripY + 6, `Rs ${formatNumber(totalMonthlyFare)}`, "F2", 9, [0.04, 0.47, 0.34]);

  // Student Table Header
  const tableTop = 444;
  s += pdfRect(36, tableTop, 770, 22, [0.035, 0.114, 0.243]);
  s += pdfText(46, tableTop + 7, "S.NO", "F2", 8.5, [1, 1, 1]);
  s += pdfText(90, tableTop + 7, "ROLL NO", "F2", 8.5, [1, 1, 1]);
  s += pdfText(175, tableTop + 7, "STUDENT NAME", "F2", 8.5, [1, 1, 1]);
  s += pdfText(355, tableTop + 7, "CLASS / SECTION", "F2", 8.5, [1, 1, 1]);
  s += pdfText(470, tableTop + 7, "BOARDING STOP", "F2", 8.5, [1, 1, 1]);
  s += pdfText(690, tableTop + 7, "MONTHLY FARE", "F2", 8.5, [1, 1, 1]);

  if (students.length === 0) {
    const emptyY = tableTop - 30;
    s += pdfRect(36, emptyY, 770, 28, [0.98, 0.98, 0.99]);
    s += pdfText(
      270,
      emptyY + 10,
      "No students are currently assigned to this vehicle's route.",
      "F1",
      9,
      [0.4, 0.45, 0.52]
    );
  } else {
    students.slice(0, 16).forEach((st, idx) => {
      const y = tableTop - (idx + 1) * 22;
      if (idx % 2 === 1) {
        s += pdfRect(36, y, 770, 22, [0.97, 0.98, 0.995]);
      }
      s += pdfText(48, y + 7, String(idx + 1).padStart(2, "0"), "F2", 8.5);
      s += pdfText(90, y + 7, st.studentRollNo, "F2", 8.5, [0.035, 0.114, 0.243]);
      s += pdfText(175, y + 7, st.studentName.slice(0, 30), "F2", 8.5);
      s += pdfText(355, y + 7, st.className, "F1", 8.5);
      s += pdfText(470, y + 7, st.boardingStop.slice(0, 34), "F1", 8.5);
      s += pdfText(690, y + 7, `Rs ${formatNumber(st.monthlyFare)}`, "F2", 8.5);
    });
  }

  // Footer Signatures
  s += pdfRect(36, 48, 770, 0.8, [0.82, 0.86, 0.91]);
  s += pdfText(
    36,
    32,
    `Driver Signature: ${vehicle.driverName || "____________________"}`,
    "F1",
    8.5,
    [0.35, 0.42, 0.52]
  );
  s += pdfText(
    330,
    32,
    "Transport Supervisor: ____________________",
    "F1",
    8.5,
    [0.35, 0.42, 0.52]
  );
  s += pdfText(
    610,
    32,
    "Principal / Admin Stamp: ____________________",
    "F1",
    8.5,
    [0.35, 0.42, 0.52]
  );

  const blob = buildMultiPagePdf([s]);
  const safeVehNo = vehicle.vehicleNo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  triggerDownload(blob, `vehicle-${safeVehNo}-students-manifest.pdf`);
}

export function exportRouteStudentsPdf(
  route: TransportRouteRecord,
  vehicles: TransportVehicleRecord[],
  students: TransportAssignmentRecord[]
) {
  let s = "";
  const printedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const matchedVehicles = vehicles.filter(
    (v) => v.routeId === route.id || v.routeName === route.routeName
  );
  const totalMonthlyFare = students.reduce((sum, st) => sum + st.monthlyFare, 0);
  const vehiclesLabel =
    matchedVehicles.map((v) => `${v.vehicleNo} (${v.model})`).join(", ") || "No vehicle assigned";
  const driversLabel =
    matchedVehicles
      .map((v) => (v.driverPhone ? `${v.driverName} (${v.driverPhone})` : v.driverName))
      .filter(Boolean)
      .join(", ") || "No driver assigned";

  // Navy Header Banner
  s += pdfRect(0, 525, 842, 70, [0.035, 0.114, 0.243]);
  s += pdfText(
    36,
    566,
    "OPUS SCHOOL MANAGEMENT SYSTEM - ROUTE PASSENGER MANIFEST",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    36,
    548,
    `Route: ${route.routeName} (${route.routeCode})   |   Fare: Rs ${formatNumber(route.monthlyFare)}/mo`,
    "F2",
    9.5,
    [0.9, 0.94, 1]
  );
  s += pdfText(
    36,
    534,
    `Assigned Vehicles: ${vehiclesLabel}   |   Driver: ${driversLabel}`,
    "F1",
    8.5,
    [0.82, 0.88, 0.96]
  );

  // KPI Summary Strip
  s += pdfRect(36, 478, 770, 36, [0.94, 0.96, 0.99]);
  s += pdfText(48, 498, "ROUTE & CODE", "F1", 7.5, [0.38, 0.44, 0.54]);
  s += pdfText(48, 485, `${route.routeCode} - ${route.routeName}`.slice(0, 34), "F2", 8.5, [0.035, 0.114, 0.243]);

  s += pdfText(260, 498, "ASSIGNED VEHICLE & DRIVER", "F1", 7.5, [0.38, 0.44, 0.54]);
  s += pdfText(260, 485, `${vehiclesLabel}`.slice(0, 36), "F2", 8.5, [0.035, 0.114, 0.243]);

  s += pdfText(520, 498, "BOARDING STUDENTS", "F1", 7.5, [0.38, 0.44, 0.54]);
  s += pdfText(520, 485, `${students.length} Registered Students`, "F2", 8.5, [0.1, 0.45, 0.25]);

  s += pdfText(670, 498, "TOTAL MONTHLY FARE", "F1", 7.5, [0.38, 0.44, 0.54]);
  s += pdfText(670, 485, `Rs ${formatNumber(totalMonthlyFare)}`, "F2", 8.5, [0.035, 0.114, 0.243]);

  // Students Table Header
  const tableTop = 445;
  s += pdfRect(36, tableTop, 770, 22, [0.035, 0.114, 0.243]);
  s += pdfText(48, tableTop + 7, "S.NO", "F2", 8, [1, 1, 1]);
  s += pdfText(90, tableTop + 7, "ROLL NO", "F2", 8, [1, 1, 1]);
  s += pdfText(180, tableTop + 7, "STUDENT NAME", "F2", 8, [1, 1, 1]);
  s += pdfText(370, tableTop + 7, "CLASS / SECTION", "F2", 8, [1, 1, 1]);
  s += pdfText(510, tableTop + 7, "BOARDING STOP", "F2", 8, [1, 1, 1]);
  s += pdfText(690, tableTop + 7, "MONTHLY FARE", "F2", 8, [1, 1, 1]);

  if (students.length === 0) {
    s += pdfRect(36, tableTop - 24, 770, 24, [0.98, 0.98, 0.99]);
    s += pdfText(
      48,
      tableTop - 15,
      "No students are currently assigned to this transport route.",
      "F1",
      8.5,
      [0.5, 0.5, 0.5]
    );
  } else {
    students.slice(0, 16).forEach((st, idx) => {
      const y = tableTop - (idx + 1) * 22;
      if (idx % 2 === 1) {
        s += pdfRect(36, y, 770, 22, [0.97, 0.98, 0.99]);
      }
      s += pdfText(48, y + 7, String(idx + 1).padStart(2, "0"), "F1", 8);
      s += pdfText(90, y + 7, st.studentRollNo, "F2", 8);
      s += pdfText(180, y + 7, st.studentName.slice(0, 28), "F2", 8);
      s += pdfText(370, y + 7, st.className, "F1", 8);
      s += pdfText(510, y + 7, st.boardingStop.slice(0, 28), "F1", 8);
      s += pdfText(690, y + 7, `Rs ${formatNumber(st.monthlyFare)}`, "F2", 8);
    });
  }

  // Footer Signatures
  s += pdfText(36, 45, `System Generated Route Manifest  |  Exported: ${printedDate}`, "F1", 8, [0.45, 0.5, 0.6]);
  s += pdfText(480, 45, "Transport Supervisor Signature: _______________________", "F1", 8, [0.35, 0.4, 0.5]);

  const safeCode = route.routeCode.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const blob = buildMultiPagePdf([s]);
  triggerDownload(blob, `route-${safeCode}-students-manifest.pdf`);
}

export function exportTransportAssignmentsPdf(
  assignments: TransportAssignmentRecord[],
  vehicles?: TransportVehicleRecord[]
) {
  let s = "";
  s += pdfRect(0, 535, 842, 60, [0.035, 0.114, 0.243]);
  s += pdfText(
    36,
    566,
    "OPUS SCHOOL MANAGEMENT SYSTEM - STUDENT TRANSPORT ASSIGNMENTS",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    36,
    548,
    `Total Assigned Students: ${assignments.length}   |   Generated: ${new Date().toLocaleDateString(
      "en-GB"
    )}`,
    "F1",
    9,
    [0.82, 0.88, 0.96]
  );

  const tableTop = 500;
  s += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  s += pdfText(46, tableTop + 7, "STUDENT NAME & ROLL", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(210, tableTop + 7, "CLASS", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(285, tableTop + 7, "ROUTE", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(435, tableTop + 7, "BUS NAME", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(560, tableTop + 7, "DRIVER", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(660, tableTop + 7, "BOARDING STOP", "F2", 8.5, [0.1, 0.18, 0.32]);
  s += pdfText(750, tableTop + 7, "FARE", "F2", 8.5, [0.1, 0.18, 0.32]);

  assignments.slice(0, 18).forEach((a, idx) => {
    const y = tableTop - (idx + 1) * 22;
    if (idx % 2 === 1) {
      s += pdfRect(36, y, 770, 22, [0.975, 0.98, 0.99]);
    }
    const matchedVehicle = vehicles?.find(
      (v) =>
        (a.routeId && v.routeId === a.routeId) ||
        (a.routeName && v.routeName === a.routeName)
    );
    const bus = a.busName || matchedVehicle?.model || "-";
    const driver = a.driverName || matchedVehicle?.driverName || "-";

    s += pdfText(46, y + 7, `${a.studentName} (${a.studentRollNo})`.slice(0, 26), "F2", 8.5);
    s += pdfText(210, y + 7, a.className, "F1", 8.5);
    s += pdfText(285, y + 7, a.routeName.slice(0, 22), "F1", 8.5);
    s += pdfText(435, y + 7, bus.slice(0, 20), "F1", 8.5);
    s += pdfText(560, y + 7, driver.slice(0, 16), "F1", 8.5);
    s += pdfText(660, y + 7, a.boardingStop.slice(0, 15), "F1", 8.5);
    s += pdfText(750, y + 7, `Rs ${formatNumber(a.monthlyFare)}`, "F2", 8.5);
  });

  const blob = buildMultiPagePdf([s]);
  triggerDownload(blob, "transport-assignments-register.pdf");
}

export function exportStudentTransportCardPdf(
  assignment: TransportAssignmentRecord,
  vehicle?: TransportVehicleRecord
) {
  let s = "";
  const printedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const busModel = assignment.busName || vehicle?.model || "Standard School Bus";
  const vehicleNo = assignment.vehicleNo || vehicle?.vehicleNo || "Transport Fleet";
  const driverName = assignment.driverName || vehicle?.driverName || "Assigned Driver";
  const driverPhone = assignment.driverPhone || vehicle?.driverPhone || "—";

  // Navy Header Banner
  s += pdfRect(0, 525, 842, 70, [0.035, 0.114, 0.243]);
  s += pdfText(
    36,
    566,
    "OPUS SCHOOL MANAGEMENT SYSTEM - STUDENT TRANSPORT PASS",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    36,
    548,
    `Student: ${assignment.studentName}   |   Roll No: ${assignment.studentRollNo}   |   Class: ${assignment.className}`,
    "F2",
    9.5,
    [0.9, 0.94, 1]
  );
  s += pdfText(
    36,
    534,
    "Academic Year 2026-27   |   Valid Transport Authorization Pass",
    "F1",
    8.5,
    [0.82, 0.88, 0.96]
  );

  // Pass Card Box
  s += pdfRect(36, 305, 770, 200, [0.96, 0.97, 0.99]);
  s += pdfRect(36, 475, 770, 30, [0.1, 0.2, 0.35]);
  s += pdfText(48, 488, "STUDENT COMMUTER IDENTIFICATION DETAILS", "F2", 9, [1, 1, 1]);

  // Row 1
  s += pdfText(52, 450, "Student Name:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(150, 450, assignment.studentName, "F2", 9.5, [0.035, 0.114, 0.243]);

  s += pdfText(440, 450, "Roll Number:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(530, 450, assignment.studentRollNo, "F2", 9.5, [0.035, 0.114, 0.243]);

  // Row 2
  s += pdfText(52, 418, "Class / Grade:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(150, 418, assignment.className, "F2", 9, [0.035, 0.114, 0.243]);

  s += pdfText(440, 418, "Transport Route:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(530, 418, assignment.routeName, "F2", 9, [0.035, 0.114, 0.243]);

  // Row 3
  s += pdfText(52, 386, "Boarding Stop:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(150, 386, assignment.boardingStop, "F2", 9, [0.035, 0.114, 0.243]);

  s += pdfText(440, 386, "Monthly Fare:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(530, 386, `Rs ${formatNumber(assignment.monthlyFare)} / Month`, "F2", 9, [0.035, 0.114, 0.243]);

  // Row 4
  s += pdfText(52, 354, "Assigned Bus:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(150, 354, `${busModel} (${vehicleNo})`, "F2", 9, [0.035, 0.114, 0.243]);

  s += pdfText(440, 354, "Bus Driver & Contact:", "F1", 8.5, [0.38, 0.44, 0.54]);
  s += pdfText(530, 354, `${driverName} ${driverPhone !== "—" ? `(${driverPhone})` : ""}`, "F2", 9, [0.035, 0.114, 0.243]);

  // Instructions & Terms
  s += pdfRect(36, 155, 770, 135, [0.98, 0.98, 0.99]);
  s += pdfText(48, 268, "IMPORTANT TRANSPORT RULES & PASS TERMS:", "F2", 8.5, [0.035, 0.114, 0.243]);
  s += pdfText(48, 250, "1. Students must carry this transport pass while boarding the school vehicle daily.", "F1", 8, [0.3, 0.35, 0.45]);
  s += pdfText(48, 234, "2. Boarding and drop-off is strictly allowed only at the assigned stop specified on this pass.", "F1", 8, [0.3, 0.35, 0.45]);
  s += pdfText(48, 218, "3. In case of emergency or route delay, contact the transport desk or the assigned driver directly.", "F1", 8, [0.3, 0.35, 0.45]);
  s += pdfText(48, 202, "4. Transport fee must be cleared along with monthly tuition fees before the 10th of every month.", "F1", 8, [0.3, 0.35, 0.45]);
  s += pdfText(48, 186, "5. Report any changes in home address or contact details to the Administration Office promptly.", "F1", 8, [0.3, 0.35, 0.45]);

  // Footer Signatures
  s += pdfText(36, 45, `Transport ID: ${assignment.assignmentCode}  |  Printed: ${printedDate}`, "F1", 8, [0.45, 0.5, 0.6]);
  s += pdfText(320, 45, "Student / Guardian Signature: ________________", "F1", 8, [0.35, 0.4, 0.5]);
  s += pdfText(580, 45, "Admin Transport Seal: ________________", "F1", 8, [0.35, 0.4, 0.5]);

  const safeRoll = assignment.studentRollNo.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const blob = buildMultiPagePdf([s]);
  triggerDownload(blob, `student-transport-pass-${safeRoll}.pdf`);
}

export function printTransportOverview(
  routes: TransportRouteRecord[],
  vehicles: TransportVehicleRecord[],
  assignments: TransportAssignmentRecord[]
): boolean {
  const routeRows = routes
    .map(
      (r) => `
      <tr>
        <td style="text-align:center;font-family:monospace;font-weight:700;">${r.routeCode}</td>
        <td style="font-weight:600;">${r.routeName}</td>
        <td style="text-align:center;font-family:monospace;font-weight:700;">Rs ${formatNumber(
          r.monthlyFare
        )}</td>
      </tr>`
    )
    .join("");

  const vehicleRows = vehicles
    .map(
      (v) => `
      <tr>
        <td style="text-align:center;font-family:monospace;font-weight:700;">${v.vehicleNo}</td>
        <td style="font-weight:600;">${v.model}</td>
        <td><strong>${v.driverName || "—"}</strong>${v.driverPhone ? `<br/><span style="color:#64748b;font-size:11px;font-family:monospace;">${v.driverPhone}</span>` : ""}</td>
        <td style="text-align:center;font-family:monospace;">${v.capacity}</td>
        <td>${v.routeName || "—"}</td>
      </tr>`
    )
    .join("");

  const assignmentRows = assignments
    .map((a) => {
      const v = vehicles.find(
        (veh) =>
          (a.routeId && veh.routeId === a.routeId) ||
          (a.routeName && veh.routeName === a.routeName)
      );
      const bus = a.busName || v?.model || "—";
      const plate = a.vehicleNo || v?.vehicleNo;
      const driver = a.driverName || v?.driverName || "—";
      const phone = a.driverPhone || v?.driverPhone;

      return `
      <tr>
        <td style="font-weight:600;">${a.studentName} <span style="color:#64748b;font-size:11px;">(${a.studentRollNo} &bull; ${a.className})</span></td>
        <td>${a.routeName}</td>
        <td><strong>${bus}</strong>${plate ? `<br/><span style="color:#64748b;font-size:11px;font-family:monospace;">${plate}</span>` : ""}</td>
        <td><strong>${driver}</strong>${phone ? `<br/><span style="color:#64748b;font-size:11px;font-family:monospace;">${phone}</span>` : ""}</td>
        <td>${a.boardingStop}</td>
        <td style="text-align:center;font-family:monospace;font-weight:700;">Rs ${formatNumber(
          a.monthlyFare
        )}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Transport Register — Opus SMS</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 28px; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #091d3e; }
    h2 { font-size: 13px; margin: 22px 0 8px; color: #091d3e; text-transform: uppercase; letter-spacing: 0.05em; }
    p { font-size: 12px; color: #64748b; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; }
    th { background: #091d3e; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>School Transport Management Register</h1>
  <p>Routes: ${routes.length} &bull; Vehicles: ${vehicles.length} &bull; Student Assignments: ${assignments.length}</p>

  <h2>1. Transport Routes</h2>
  <table>
    <thead><tr><th style="text-align:center;width:110px;">Code</th><th>Route Name</th><th style="text-align:center;width:150px;">Monthly Fare</th></tr></thead>
    <tbody>${routeRows}</tbody>
  </table>

  <h2>2. Fleet Vehicles</h2>
  <table>
    <thead><tr><th style="text-align:center;width:120px;">Vehicle No</th><th>Model</th><th>Driver</th><th style="text-align:center;width:95px;">Capacity</th><th>Route</th></tr></thead>
    <tbody>${vehicleRows}</tbody>
  </table>

  <h2>3. Transport Assignments</h2>
  <table>
    <thead><tr><th>Student Name</th><th>Route</th><th>Bus Name</th><th>Driver</th><th>Boarding Stop</th><th style="text-align:center;width:120px;">Monthly Fare</th></tr></thead>
    <tbody>${assignmentRows}</tbody>
  </table>
</body>
</html>`;

  return printHtml(html);
}
