import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { printHtml } from "@/lib/print-html";
import type {
  HostelAllocationRecord,
  HostelAttendanceRecord,
  HostelBuildingRecord,
  HostelMessPlanRecord,
  HostelRoomRecord,
  HostelVisitorRecord,
  HostelWardenRecord,
} from "@/lib/mock/hostel";

/* ───────────────────────── Shared PDF helpers ───────────────────────── */

function escapePdf(value: string): string {
  return value
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

function buildMultiPagePdf(
  streams: string[],
  width = 842,
  height = 595
): Blob {
  const objects: string[] = [];
  const pageCount = streams.length;
  const firstPageObj = 5;

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const kids = Array.from(
    { length: pageCount },
    (_, index) => `${firstPageObj + index * 2} 0 R`
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

  streams.forEach((stream, index) => {
    const pageObjNum = firstPageObj + index * 2;
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
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function printedDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function header(title: string, subtitle: string): string {
  let stream = "";
  stream += pdfRect(0, 525, 842, 70, [0.035, 0.114, 0.243]);
  stream += pdfText(36, 566, title, "F2", 13, [1, 1, 1]);
  stream += pdfText(36, 548, subtitle, "F1", 9, [0.82, 0.88, 0.96]);
  return stream;
}

function footer(label: string): string {
  let stream = "";
  stream += pdfRect(36, 44, 770, 0.8, [0.82, 0.86, 0.91]);
  stream += pdfText(36, 28, label, "F1", 8, [0.45, 0.5, 0.6]);
  stream += pdfText(
    560,
    28,
    "Principal / Admin Stamp: ____________________",
    "F1",
    8,
    [0.35, 0.4, 0.5]
  );
  return stream;
}

function occupancyForBuilding(
  buildingId: string,
  rooms: HostelRoomRecord[],
  allocations: HostelAllocationRecord[]
) {
  const buildingRooms = rooms.filter((room) => room.buildingId === buildingId);
  const usable = buildingRooms
    .filter((room) => !room.maintenance)
    .reduce((sum, room) => sum + room.capacity, 0);
  const occupied = allocations.filter(
    (allocation) =>
      allocation.status === "Active" && allocation.buildingId === buildingId
  ).length;
  return {
    rooms: buildingRooms.length,
    usable,
    occupied,
    percent: usable > 0 ? Math.round((occupied / usable) * 100) : 0,
  };
}

/* ───────────────────────── Register exports ───────────────────────── */

export function exportBuildingsPdf(
  buildings: HostelBuildingRecord[],
  rooms: HostelRoomRecord[],
  allocations: HostelAllocationRecord[],
  wardens: HostelWardenRecord[]
) {
  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL BUILDINGS REGISTER",
    `Total Buildings: ${buildings.length}   |   Rooms: ${rooms.length}   |   Active Residents: ${
      allocations.filter((a) => a.status === "Active").length
    }   |   Generated: ${printedDate()}`
  );

  const tableTop = 496;
  stream += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  stream += pdfText(46, tableTop + 7, "CODE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(105, tableTop + 7, "BUILDING NAME", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(330, tableTop + 7, "TYPE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(390, tableTop + 7, "CAMPUS", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(525, tableTop + 7, "ROOMS / BEDS", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(625, tableTop + 7, "OCCUPANCY", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(715, tableTop + 7, "CHIEF WARDEN", "F2", 8.5, [0.1, 0.18, 0.32]);

  buildings.slice(0, 18).forEach((building, index) => {
    const y = tableTop - (index + 1) * 26;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 26, [0.975, 0.98, 0.99]);
    }
    const stats = occupancyForBuilding(building.id, rooms, allocations);
    const chief =
      wardens.find(
        (warden) =>
          warden.buildingId === building.id &&
          warden.role === "Chief Warden"
      ) ?? wardens.find((warden) => warden.buildingId === building.id);

    stream += pdfText(46, y + 9, building.code, "F2", 8.5);
    stream += pdfText(105, y + 9, building.name.slice(0, 40), "F2", 8.5);
    stream += pdfText(330, y + 9, building.type, "F1", 8.5);
    stream += pdfText(390, y + 9, building.campus.slice(0, 24), "F1", 8.5);
    stream += pdfText(525, y + 9, `${stats.rooms} / ${stats.usable}`, "F1", 8.5);
    stream += pdfText(
      625,
      y + 9,
      `${stats.occupied} (${stats.percent}%)`,
      "F2",
      8.5
    );
    stream += pdfText(715, y + 9, (chief?.name ?? "Unassigned").slice(0, 18), "F1", 8.5);
  });

  stream += footer(
    "System generated hostel buildings register  |  Opus School Management System"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-buildings-register.pdf");
}

export function exportRoomsPdf(
  rooms: HostelRoomRecord[],
  allocations: HostelAllocationRecord[]
) {
  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL ROOM INVENTORY",
    `Total Rooms: ${rooms.length}   |   Total Beds: ${formatNumber(
      rooms.reduce((sum, room) => sum + room.capacity, 0)
    )}   |   Occupied Beds: ${
      allocations.filter((a) => a.status === "Active").length
    }   |   Generated: ${printedDate()}`
  );

  const tableTop = 496;
  stream += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  stream += pdfText(46, tableTop + 7, "ROOM", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(120, tableTop + 7, "BUILDING", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(345, tableTop + 7, "FLOOR", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(400, tableTop + 7, "TYPE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(475, tableTop + 7, "BEDS", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(545, tableTop + 7, "OCCUPANCY", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(650, tableTop + 7, "MONTHLY FEE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(745, tableTop + 7, "STATUS", "F2", 8.5, [0.1, 0.18, 0.32]);

  rooms.slice(0, 18).forEach((room, index) => {
    const y = tableTop - (index + 1) * 24;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 24, [0.975, 0.98, 0.99]);
    }
    const occupied = allocations.filter(
      (allocation) =>
        allocation.status === "Active" && allocation.roomId === room.id
    ).length;
    const status = room.maintenance
      ? "Maintenance"
      : occupied >= room.capacity
      ? "Full"
      : "Available";

    stream += pdfText(46, y + 8, room.roomNo, "F2", 8.5);
    stream += pdfText(120, y + 8, room.buildingName.slice(0, 38), "F1", 8.5);
    stream += pdfText(345, y + 8, String(room.floor), "F1", 8.5);
    stream += pdfText(400, y + 8, room.roomType, "F1", 8.5);
    stream += pdfText(475, y + 8, String(room.capacity), "F2", 8.5);
    stream += pdfText(545, y + 8, `${occupied} / ${room.capacity}`, "F2", 8.5);
    stream += pdfText(650, y + 8, formatCurrency(room.monthlyFee), "F1", 8.5);
    stream += pdfText(745, y + 8, status, "F1", 8.5);
  });

  stream += footer(
    "System generated hostel room inventory  |  Opus School Management System"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-room-inventory.pdf");
}

export function exportResidentsPdf(
  allocations: HostelAllocationRecord[],
  messPlans: HostelMessPlanRecord[]
) {
  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL RESIDENTS REGISTER",
    `Active Residents: ${
      allocations.filter((a) => a.status === "Active").length
    }   |   Waitlisted: ${
      allocations.filter((a) => a.status === "Waitlisted").length
    }   |   Generated: ${printedDate()}`
  );

  const tableTop = 496;
  stream += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  stream += pdfText(46, tableTop + 7, "ALLOCATION", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(120, tableTop + 7, "STUDENT NAME", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(300, tableTop + 7, "CLASS", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(380, tableTop + 7, "BUILDING / ROOM", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(545, tableTop + 7, "MESS PLAN", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(700, tableTop + 7, "FEE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(745, tableTop + 7, "STATUS", "F2", 8.5, [0.1, 0.18, 0.32]);

  allocations.slice(0, 18).forEach((allocation, index) => {
    const y = tableTop - (index + 1) * 24;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 24, [0.975, 0.98, 0.99]);
    }
    const plan = messPlans.find((item) => item.id === allocation.messPlanId);
    const roomLabel = allocation.roomNo
      ? `${allocation.buildingName.split(" ")[0]} / ${allocation.roomNo} - ${allocation.bedNo}`
      : "Not allocated";

    stream += pdfText(46, y + 8, allocation.allocationCode, "F2", 8.5);
    stream += pdfText(120, y + 8, allocation.studentName.slice(0, 28), "F2", 8.5);
    stream += pdfText(300, y + 8, allocation.className, "F1", 8.5);
    stream += pdfText(380, y + 8, roomLabel.slice(0, 30), "F1", 8.5);
    stream += pdfText(545, y + 8, (plan?.planCode ?? "—").slice(0, 18), "F1", 8.5);
    stream += pdfText(
      700,
      y + 8,
      allocation.monthlyFee > 0 ? formatCurrency(allocation.monthlyFee) : "—",
      "F1",
      8.5
    );
    stream += pdfText(745, y + 8, allocation.status, "F1", 8.5);
  });

  stream += footer(
    "System generated hostel residents register  |  Opus School Management System"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-residents-register.pdf");
}

export function exportWardensPdf(wardens: HostelWardenRecord[]) {
  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL WARDEN ROSTER",
    `Total Wardens: ${wardens.length}   |   On Duty: ${
      wardens.filter((warden) => warden.status === "On Duty").length
    }   |   Generated: ${printedDate()}`
  );

  const tableTop = 496;
  stream += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  stream += pdfText(46, tableTop + 7, "CODE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(115, tableTop + 7, "WARDEN NAME", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(310, tableTop + 7, "ROLE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(420, tableTop + 7, "BUILDING", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(600, tableTop + 7, "SHIFT", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(660, tableTop + 7, "CONTACT", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(750, tableTop + 7, "STATUS", "F2", 8.5, [0.1, 0.18, 0.32]);

  wardens.forEach((warden, index) => {
    const y = tableTop - (index + 1) * 26;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 26, [0.975, 0.98, 0.99]);
    }
    stream += pdfText(46, y + 9, warden.wardenCode, "F2", 8.5);
    stream += pdfText(115, y + 9, warden.name.slice(0, 30), "F2", 8.5);
    stream += pdfText(310, y + 9, warden.role, "F1", 8.5);
    stream += pdfText(420, y + 9, warden.buildingName.slice(0, 28), "F1", 8.5);
    stream += pdfText(600, y + 9, warden.shift, "F1", 8.5);
    stream += pdfText(660, y + 9, warden.phone, "F1", 8.5);
    stream += pdfText(750, y + 9, warden.status, "F1", 8.5);
  });

  stream += footer(
    "System generated hostel warden roster  |  Opus School Management System"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-warden-roster.pdf");
}

export function exportMessPdf(
  messPlans: HostelMessPlanRecord[],
  allocations: HostelAllocationRecord[]
) {
  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL MESS REGISTER",
    `Mess Plans: ${messPlans.length}   |   Subscribed Residents: ${
      allocations.filter(
        (allocation) =>
          allocation.status === "Active" && Boolean(allocation.messPlanId)
      ).length
    }   |   Generated: ${printedDate()}`
  );

  const tableTop = 480;
  stream += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  stream += pdfText(46, tableTop + 7, "CODE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(115, tableTop + 7, "MESS PLAN", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(355, tableTop + 7, "VENDOR", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(490, tableTop + 7, "MEALS", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(610, tableTop + 7, "SUBSCRIBERS", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(695, tableTop + 7, "RATE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(760, tableTop + 7, "STATUS", "F2", 8.5, [0.1, 0.18, 0.32]);

  messPlans.forEach((plan, index) => {
    const y = tableTop - (index + 1) * 32;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 32, [0.975, 0.98, 0.99]);
    }
    const subscribers = allocations.filter(
      (allocation) =>
        allocation.status === "Active" && allocation.messPlanId === plan.id
    ).length;

    stream += pdfText(46, y + 12, plan.planCode, "F2", 8.5);
    stream += pdfText(115, y + 12, plan.planName.slice(0, 40), "F2", 8.5);
    stream += pdfText(355, y + 12, plan.vendor.slice(0, 24), "F1", 8.5);
    stream += pdfText(490, y + 12, plan.meals.length + " meals / day", "F1", 8.5);
    stream += pdfText(610, y + 12, `${subscribers} residents`, "F2", 8.5);
    stream += pdfText(695, y + 12, formatCurrency(plan.monthlyRate), "F1", 8.5);
    stream += pdfText(760, y + 12, plan.status, "F1", 8.5);
    stream += pdfText(
      115,
      y + 4,
      `Serving: ${plan.buildingName}  |  ${plan.serviceDays} service days / month`,
      "F1",
      7.5,
      [0.45, 0.5, 0.6]
    );
  });

  stream += footer(
    "System generated hostel mess register  |  Opus School Management System"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-mess-register.pdf");
}

export function exportAttendancePdf(attendance: HostelAttendanceRecord[]) {
  const latestDate = attendance.length
    ? attendance.map((record) => record.date).sort().at(-1) ?? ""
    : "";

  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL ATTENDANCE REGISTER",
    `Date: ${
      latestDate ? formatDate(latestDate) : "—"
    }   |   Records: ${attendance.length}   |   Present: ${
      attendance.filter((record) => record.status === "Present").length
    }   |   Generated: ${printedDate()}`
  );

  const tableTop = 496;
  stream += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  stream += pdfText(46, tableTop + 7, "DATE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(125, tableTop + 7, "STUDENT NAME", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(315, tableTop + 7, "ROLL NO", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(400, tableTop + 7, "BUILDING / ROOM", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(585, tableTop + 7, "STATUS", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(650, tableTop + 7, "CHECK-IN", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(725, tableTop + 7, "REMARKS", "F2", 8.5, [0.1, 0.18, 0.32]);

  attendance.slice(0, 18).forEach((record, index) => {
    const y = tableTop - (index + 1) * 24;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 24, [0.975, 0.98, 0.99]);
    }
    stream += pdfText(46, y + 8, record.date, "F1", 8.5);
    stream += pdfText(125, y + 8, record.studentName.slice(0, 28), "F2", 8.5);
    stream += pdfText(315, y + 8, record.studentRollNo, "F1", 8.5);
    stream += pdfText(
      400,
      y + 8,
      `${record.buildingName.split(" ")[0]} / ${record.roomNo}`.slice(0, 30),
      "F1",
      8.5
    );
    stream += pdfText(585, y + 8, record.status, "F2", 8.5);
    stream += pdfText(650, y + 8, record.checkInTime, "F1", 8.5);
    stream += pdfText(725, y + 8, (record.remarks ?? "—").slice(0, 18), "F1", 8.5);
  });

  stream += footer(
    "System generated hostel attendance register  |  Opus School Management System"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-attendance-register.pdf");
}

export function exportVisitorsPdf(visitors: HostelVisitorRecord[]) {
  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL VISITOR LOG",
    `Visitor Entries: ${visitors.length}   |   Checked In: ${
      visitors.filter((visitor) => visitor.status === "Approved").length
    }   |   Generated: ${printedDate()}`
  );

  const tableTop = 496;
  stream += pdfRect(36, tableTop, 770, 22, [0.93, 0.95, 0.98]);
  stream += pdfText(46, tableTop + 7, "VISITOR", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(205, tableTop + 7, "RESIDENT", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(360, tableTop + 7, "RELATION", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(445, tableTop + 7, "PURPOSE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(635, tableTop + 7, "DATE", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(705, tableTop + 7, "IN / OUT", "F2", 8.5, [0.1, 0.18, 0.32]);
  stream += pdfText(770, tableTop + 7, "STATUS", "F2", 8.5, [0.1, 0.18, 0.32]);

  visitors.slice(0, 18).forEach((visitor, index) => {
    const y = tableTop - (index + 1) * 26;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 26, [0.975, 0.98, 0.99]);
    }
    const inOut = `${visitor.checkInTime} / ${visitor.checkOutTime ?? "—"}`;
    stream += pdfText(46, y + 9, visitor.visitorName.slice(0, 28), "F2", 8.5);
    stream += pdfText(205, y + 9, visitor.residentName.slice(0, 24), "F1", 8.5);
    stream += pdfText(360, y + 9, visitor.relationship, "F1", 8.5);
    stream += pdfText(445, y + 9, visitor.purpose.slice(0, 28), "F1", 8.5);
    stream += pdfText(635, y + 9, visitor.visitDate, "F1", 8.5);
    stream += pdfText(705, y + 9, inOut, "F1", 8.5);
    stream += pdfText(770, y + 9, visitor.status, "F1", 8.5);
  });

  stream += footer(
    "System generated hostel visitor log  |  Opus School Management System"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-visitor-log.pdf");
}

/* ───────────────────────── Focused / card exports ───────────────────────── */

export function exportBuildingRosterPdf(
  building: HostelBuildingRecord,
  rooms: HostelRoomRecord[],
  allocations: HostelAllocationRecord[],
  wardens: HostelWardenRecord[]
) {
  const residents = allocations.filter(
    (allocation) =>
      allocation.buildingId === building.id && allocation.status === "Active"
  );
  const stats = occupancyForBuilding(building.id, rooms, allocations);
  const chief =
    wardens.find(
      (warden) =>
        warden.buildingId === building.id && warden.role === "Chief Warden"
    ) ?? wardens.find((warden) => warden.buildingId === building.id);

  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — BUILDING RESIDENT ROSTER",
    `${building.name} (${building.code})   |   ${building.type} Hostel   |   ${building.campus}`
  );

  stream += pdfRect(36, 470, 770, 34, [0.95, 0.97, 0.99]);
  stream += pdfText(48, 491, "BUILDING DETAIL", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    48,
    478,
    `${building.name} — ${building.floors} floors, established ${building.establishedYear}`,
    "F2",
    8.5,
    [0.035, 0.114, 0.243]
  );
  stream += pdfText(420, 491, "CHIEF WARDEN", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    420,
    478,
    `${chief?.name ?? "Unassigned"}${chief ? ` (${chief.phone})` : ""}`,
    "F2",
    8.5,
    [0.035, 0.114, 0.243]
  );
  stream += pdfText(660, 491, "OCCUPANCY", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    660,
    478,
    `${stats.occupied} / ${stats.usable} beds (${stats.percent}%)`,
    "F2",
    8.5,
    [0.04, 0.47, 0.34]
  );

  const tableTop = 435;
  stream += pdfRect(36, tableTop, 770, 22, [0.035, 0.114, 0.243]);
  stream += pdfText(46, tableTop + 7, "S.NO", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(90, tableTop + 7, "RESIDENT", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(280, tableTop + 7, "ROLL NO", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(370, tableTop + 7, "CLASS", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(460, tableTop + 7, "ROOM", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(540, tableTop + 7, "CHECK-IN", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(650, tableTop + 7, "GUARDIAN", "F2", 8.5, [1, 1, 1]);

  if (residents.length === 0) {
    stream += pdfRect(36, tableTop - 28, 770, 26, [0.98, 0.98, 0.99]);
    stream += pdfText(
      230,
      tableTop - 18,
      "No residents are currently allocated to this building.",
      "F1",
      9,
      [0.4, 0.45, 0.52]
    );
  } else {
    residents.slice(0, 16).forEach((resident, index) => {
      const y = tableTop - (index + 1) * 22;
      if (index % 2 === 1) {
        stream += pdfRect(36, y, 770, 22, [0.97, 0.98, 0.995]);
      }
      stream += pdfText(48, y + 7, String(index + 1).padStart(2, "0"), "F1", 8.5);
      stream += pdfText(90, y + 7, resident.studentName.slice(0, 28), "F2", 8.5);
      stream += pdfText(280, y + 7, resident.studentRollNo, "F1", 8.5);
      stream += pdfText(370, y + 7, resident.className, "F1", 8.5);
      stream += pdfText(
        460,
        y + 7,
        `${resident.roomNo} / ${resident.bedNo}`.slice(0, 16),
        "F1",
        8.5
      );
      stream += pdfText(540, y + 7, resident.checkInDate || "—", "F1", 8.5);
      stream += pdfText(650, y + 7, resident.guardianPhone, "F1", 8.5);
    });
  }

  stream += footer(
    "Building resident roster  |  Warden Signature: ____________________"
  );
  const safeCode = building.code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  triggerDownload(
    buildMultiPagePdf([stream]),
    `hostel-${safeCode}-resident-roster.pdf`
  );
}

export function exportResidentHostelCardPdf(
  allocation: HostelAllocationRecord,
  room?: HostelRoomRecord,
  building?: HostelBuildingRecord,
  messPlan?: HostelMessPlanRecord
) {
  const buildingName = building?.name ?? allocation.buildingName;
  const roomNo = room?.roomNo ?? allocation.roomNo;
  const roomType = room?.roomType ?? allocation.roomType;
  const bedNo = allocation.bedNo || "—";
  const monthlyFee = allocation.monthlyFee || room?.monthlyFee || 0;
  const dateLabel = printedDate();

  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL RESIDENT CARD",
    `Student: ${allocation.studentName}   |   Roll No: ${allocation.studentRollNo}   |   Class: ${allocation.className}`
  );
  stream += pdfText(
    36,
    534,
    "Academic Year 2026-27   |   Valid Hostel Residency & Mess Authorization",
    "F1",
    8.5,
    [0.82, 0.88, 0.96]
  );

  stream += pdfRect(36, 300, 770, 205, [0.96, 0.97, 0.99]);
  stream += pdfRect(36, 475, 770, 30, [0.1, 0.2, 0.35]);
  stream += pdfText(
    48,
    488,
    "RESIDENT ACCOMMODATION & MESS DETAILS",
    "F2",
    9,
    [1, 1, 1]
  );

  stream += pdfText(52, 450, "Resident Name:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(170, 450, allocation.studentName, "F2", 9.5, [0.035, 0.114, 0.243]);
  stream += pdfText(440, 450, "Allocation Code:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(545, 450, allocation.allocationCode, "F2", 9.5, [0.035, 0.114, 0.243]);

  stream += pdfText(52, 418, "Hostel Building:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(170, 418, buildingName, "F2", 9, [0.035, 0.114, 0.243]);
  stream += pdfText(440, 418, "Campus:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(545, 418, building?.campus ?? "—", "F2", 9, [0.035, 0.114, 0.243]);

  stream += pdfText(52, 386, "Room / Bed:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    170,
    386,
    `${roomNo || "—"} · ${roomType || "—"} · ${bedNo}`,
    "F2",
    9,
    [0.035, 0.114, 0.243]
  );
  stream += pdfText(440, 386, "Check-in Date:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    545,
    386,
    allocation.checkInDate ? formatDate(allocation.checkInDate) : "—",
    "F2",
    9,
    [0.035, 0.114, 0.243]
  );

  stream += pdfText(52, 354, "Mess Plan:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    170,
    354,
    messPlan ? `${messPlan.planName} (${messPlan.planCode})` : "Not subscribed",
    "F2",
    9,
    [0.035, 0.114, 0.243]
  );
  stream += pdfText(440, 354, "Monthly Charges:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    545,
    354,
    `${formatCurrency(monthlyFee)} room${messPlan ? ` + ${formatCurrency(messPlan.monthlyRate)} mess` : ""}`,
    "F2",
    9,
    [0.035, 0.114, 0.243]
  );

  stream += pdfText(52, 322, "Guardian Contact:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(170, 322, allocation.guardianPhone, "F2", 9, [0.035, 0.114, 0.243]);
  stream += pdfText(440, 322, "Resident Status:", "F1", 8.5, [0.38, 0.44, 0.54]);
  stream += pdfText(545, 322, allocation.status, "F2", 9, [0.035, 0.114, 0.243]);

  stream += pdfRect(36, 150, 770, 130, [0.98, 0.98, 0.99]);
  stream += pdfText(
    48,
    258,
    "HOSTEL RULES & RESIDENT CARD TERMS:",
    "F2",
    8.5,
    [0.035, 0.114, 0.243]
  );
  const rules = [
    "1. This card must be carried at all times and produced on request by hostel staff.",
    "2. Entry and exit are permitted only through the main gate between 06:00 and 21:30.",
    "3. Overnight leave requires written approval from the warden and guardian consent.",
    "4. Visitors are allowed in designated areas only and must be recorded at the gate.",
    "5. Damage to hostel property is chargeable to the resident's security deposit.",
    "6. Mess timings: Breakfast 07:30, Lunch 13:00, Dinner 19:30 — please arrive on time.",
  ];
  rules.forEach((rule, index) => {
    stream += pdfText(48, 240 - index * 15, rule, "F1", 7.8, [0.3, 0.35, 0.45]);
  });

  stream += pdfText(
    36,
    45,
    `Resident ID: ${allocation.allocationCode}  |  Printed: ${dateLabel}`,
    "F1",
    8,
    [0.45, 0.5, 0.6]
  );
  stream += pdfText(
    300,
    45,
    "Resident / Guardian Signature: ________________",
    "F1",
    8,
    [0.35, 0.4, 0.5]
  );
  stream += pdfText(
    600,
    45,
    "Warden Seal: ________________",
    "F1",
    8,
    [0.35, 0.4, 0.5]
  );

  const safeRoll = allocation.studentRollNo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  triggerDownload(
    buildMultiPagePdf([stream]),
    `hostel-resident-card-${safeRoll}.pdf`
  );
}

/* ───────────────────────── Snapshot / print ───────────────────────── */

export function exportHostelOverviewPdf(
  buildings: HostelBuildingRecord[],
  rooms: HostelRoomRecord[],
  allocations: HostelAllocationRecord[],
  wardens: HostelWardenRecord[],
  messPlans: HostelMessPlanRecord[],
  visitors: HostelVisitorRecord[]
) {
  const active = allocations.filter(
    (allocation) => allocation.status === "Active"
  );
  const usable = rooms
    .filter((room) => !room.maintenance)
    .reduce((sum, room) => sum + room.capacity, 0);
  const occupancy = usable > 0 ? Math.round((active.length / usable) * 100) : 0;
  const messRevenue = active.reduce((sum, allocation) => {
    const plan = messPlans.find((item) => item.id === allocation.messPlanId);
    return sum + (plan?.monthlyRate ?? 0);
  }, 0);

  let stream = header(
    "OPUS SCHOOL MANAGEMENT SYSTEM — HOSTEL MANAGEMENT SNAPSHOT",
    `Buildings: ${buildings.length}   |   Rooms: ${rooms.length}   |   Active Residents: ${
      active.length
    }   |   Occupancy: ${occupancy}%   |   Generated: ${printedDate()}`
  );

  const stripY = 472;
  stream += pdfRect(36, stripY, 770, 38, [0.95, 0.97, 0.99]);
  stream += pdfText(48, stripY + 24, "USABLE BEDS", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(48, stripY + 10, formatNumber(usable), "F2", 11, [0.035, 0.114, 0.243]);
  stream += pdfText(200, stripY + 24, "OCCUPIED BEDS", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(200, stripY + 10, `${active.length} (${occupancy}%)`, "F2", 11, [0.04, 0.47, 0.34]);
  stream += pdfText(350, stripY + 24, "WAITLISTED", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    350,
    stripY + 10,
    String(allocations.filter((a) => a.status === "Waitlisted").length),
    "F2",
    11,
    [0.035, 0.114, 0.243]
  );
  stream += pdfText(470, stripY + 24, "WARDENS ON DUTY", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(
    470,
    stripY + 10,
    `${wardens.filter((warden) => warden.status === "On Duty").length} / ${wardens.length}`,
    "F2",
    11,
    [0.035, 0.114, 0.243]
  );
  stream += pdfText(625, stripY + 24, "MESS REVENUE / MONTH", "F1", 7.5, [0.38, 0.44, 0.54]);
  stream += pdfText(625, stripY + 10, formatCurrency(messRevenue), "F2", 11, [0.035, 0.114, 0.243]);

  const tableTop = 430;
  stream += pdfRect(36, tableTop, 770, 22, [0.035, 0.114, 0.243]);
  stream += pdfText(46, tableTop + 7, "BUILDING", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(250, tableTop + 7, "TYPE", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(305, tableTop + 7, "CAMPUS", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(440, tableTop + 7, "ROOMS", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(510, tableTop + 7, "BEDS", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(580, tableTop + 7, "OCCUPIED", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(660, tableTop + 7, "OCCUPANCY", "F2", 8.5, [1, 1, 1]);
  stream += pdfText(750, tableTop + 7, "WARDEN", "F2", 8.5, [1, 1, 1]);

  buildings.forEach((building, index) => {
    const y = tableTop - (index + 1) * 24;
    if (index % 2 === 1) {
      stream += pdfRect(36, y, 770, 24, [0.975, 0.98, 0.99]);
    }
    const stats = occupancyForBuilding(building.id, rooms, allocations);
    const chief = wardens.find((warden) => warden.buildingId === building.id);

    stream += pdfText(46, y + 8, building.name.slice(0, 32), "F2", 8.5);
    stream += pdfText(250, y + 8, building.type, "F1", 8.5);
    stream += pdfText(305, y + 8, building.campus.slice(0, 20), "F1", 8.5);
    stream += pdfText(440, y + 8, String(stats.rooms), "F1", 8.5);
    stream += pdfText(510, y + 8, String(stats.usable), "F1", 8.5);
    stream += pdfText(580, y + 8, String(stats.occupied), "F1", 8.5);
    stream += pdfText(660, y + 8, `${stats.percent}%`, "F2", 8.5);
    stream += pdfText(750, y + 8, (chief?.name ?? "—").slice(0, 16), "F1", 8.5);
  });

  // Operational notes
  const notesY = 300;
  stream += pdfRect(36, notesY, 770, 62, [0.98, 0.98, 0.99]);
  stream += pdfText(48, notesY + 46, "OPERATIONAL NOTES", "F2", 8.5, [0.035, 0.114, 0.243]);
  stream += pdfText(
    48,
    notesY + 32,
    `• Rooms under maintenance: ${
      rooms.filter((room) => room.maintenance).length
    }   •   Available beds: ${Math.max(0, usable - active.length)}   •   Open visitor passes: ${
      visitors.filter((visitor) => visitor.status === "Approved").length
    }`,
    "F1",
    8,
    [0.35, 0.4, 0.5]
  );
  stream += pdfText(
    48,
    notesY + 18,
    `• Mess plans active: ${messPlans.filter((plan) => plan.status === "Active").length}   •   Mess subscribers: ${
      active.filter((allocation) => Boolean(allocation.messPlanId)).length
    }   •   Sibling module: Student Life / Hostel Management`,
    "F1",
    8,
    [0.35, 0.4, 0.5]
  );

  stream += footer(
    "Hostel management snapshot  |  Opus School Management System — Student Life"
  );
  triggerDownload(buildMultiPagePdf([stream]), "hostel-management-snapshot.pdf");
}

export function printHostelOverview(
  buildings: HostelBuildingRecord[],
  rooms: HostelRoomRecord[],
  allocations: HostelAllocationRecord[],
  wardens: HostelWardenRecord[],
  messPlans: HostelMessPlanRecord[],
  visitors: HostelVisitorRecord[]
): boolean {
  const active = allocations.filter(
    (allocation) => allocation.status === "Active"
  );
  const usable = rooms
    .filter((room) => !room.maintenance)
    .reduce((sum, room) => sum + room.capacity, 0);
  const occupancy = usable > 0 ? Math.round((active.length / usable) * 100) : 0;
  const messRevenue = active.reduce((sum, allocation) => {
    const plan = messPlans.find((item) => item.id === allocation.messPlanId);
    return sum + (plan?.monthlyRate ?? 0);
  }, 0);

  const buildingRows = buildings
    .map((building) => {
      const stats = occupancyForBuilding(building.id, rooms, allocations);
      const chief = wardens.find((warden) => warden.buildingId === building.id);
      return `<tr>
        <td><strong>${building.name}</strong><br/><span style="color:#64748b;font-size:11px;">${building.code} &bull; ${building.campus}</span></td>
        <td>${building.type}</td>
        <td style="text-align:center;font-family:monospace;">${stats.rooms}</td>
        <td style="text-align:center;font-family:monospace;">${stats.usable}</td>
        <td style="text-align:center;font-family:monospace;font-weight:700;">${stats.occupied}</td>
        <td style="text-align:center;font-weight:700;">${stats.percent}%</td>
        <td>${chief?.name ?? "—"}</td>
      </tr>`;
    })
    .join("");

  const residentRows = active
    .slice(0, 20)
    .map(
      (allocation) => `<tr>
        <td><strong>${allocation.studentName}</strong><br/><span style="color:#64748b;font-size:11px;">${allocation.studentRollNo} &bull; ${allocation.className}</span></td>
        <td>${allocation.buildingName}</td>
        <td>${allocation.roomNo} / ${allocation.bedNo}</td>
        <td>${formatDate(allocation.checkInDate)}</td>
        <td style="text-align:right;font-family:monospace;">${formatCurrency(allocation.monthlyFee)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Hostel Management Snapshot — Opus SMS</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 28px; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #091d3e; }
    h2 { font-size: 13px; margin: 22px 0 8px; color: #091d3e; text-transform: uppercase; letter-spacing: 0.05em; }
    p { font-size: 12px; color: #64748b; margin: 0 0 16px; }
    .kpis { display: flex; gap: 10px; margin-bottom: 18px; }
    .kpi { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #f8fafc; }
    .kpi span { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .kpi strong { display: block; margin-top: 3px; font-size: 18px; color: #091d3e; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; }
    th { background: #091d3e; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>Hostel Management Snapshot</h1>
  <p>${buildings.length} buildings &bull; ${rooms.length} rooms &bull; ${
    active.length
  } active residents &bull; ${visitors.filter((visitor) => visitor.status === "Approved").length} open visitor passes</p>

  <div class="kpis">
    <div class="kpi"><span>Usable beds</span><strong>${formatNumber(usable)}</strong></div>
    <div class="kpi"><span>Occupancy</span><strong>${occupancy}%</strong></div>
    <div class="kpi"><span>Waitlisted</span><strong>${allocations.filter((a) => a.status === "Waitlisted").length}</strong></div>
    <div class="kpi"><span>Mess revenue</span><strong>${formatCurrency(messRevenue)}</strong></div>
  </div>

  <h2>1. Building Occupancy</h2>
  <table>
    <thead><tr><th>Building</th><th>Type</th><th style="text-align:center;">Rooms</th><th style="text-align:center;">Beds</th><th style="text-align:center;">Occupied</th><th style="text-align:center;">Occupancy</th><th>Warden</th></tr></thead>
    <tbody>${buildingRows}</tbody>
  </table>

  <h2>2. Active Residents (first 20)</h2>
  <table>
    <thead><tr><th>Resident</th><th>Building</th><th>Room / Bed</th><th>Check-in</th><th style="text-align:right;">Monthly Fee</th></tr></thead>
    <tbody>${residentRows}</tbody>
  </table>
</body>
</html>`;

  return printHtml(html);
}
