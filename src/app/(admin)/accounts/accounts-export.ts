import type {
  StudentAccountRecord,
  StaffAccountRecord,
} from "@/lib/mock/accounts";
import { formatDate } from "@/lib/format";
import { printHtml } from "@/lib/print-html";

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

/* ───────────────────── Bulk PDF Exports ───────────────────── */

export function exportStudentAccountsPdf(accounts: StudentAccountRecord[]) {
  const rowsPerPage = 18;
  const totalPages = Math.max(1, Math.ceil(accounts.length / rowsPerPage));
  const streams: string[] = [];
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  for (let p = 0; p < totalPages; p++) {
    const slice = accounts.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
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
      "Student Portal Credentials Register",
      "F2",
      9,
      [0.85, 0.9, 0.98]
    );
    s += pdfText(
      40,
      532,
      `Scope: Multi-Campus System  |  Generated: ${generatedDate}  |  Total Student Accounts: ${accounts.length}  |  Page ${p + 1} of ${totalPages}`,
      "F1",
      7.5,
      [0.82, 0.88, 0.96]
    );

    s += pdfRect(28, 502, 785, 20, [0.93, 0.95, 0.98]);
    s += pdfText(34, 509, "Account #", "F2", 8);
    s += pdfText(120, 509, "Student & Class", "F2", 8);
    s += pdfText(265, 509, "Assigned Student Email", "F2", 8);
    s += pdfText(465, 509, "Assigned Password", "F2", 8);
    s += pdfText(575, 509, "Assigned By Admin", "F2", 8);
    s += pdfText(710, 509, "Campus", "F2", 8);
    s += pdfText(775, 509, "Status", "F2", 8);

    let y = 485;
    slice.forEach((acc, idx) => {
      if (idx % 2 === 1) {
        s += pdfRect(28, y - 5, 785, 20, [0.975, 0.982, 0.992]);
      }
      s += pdfText(34, y, `${acc.accountNo} (#${acc.rollNo})`, "F2", 7.5);
      s += pdfText(
        120,
        y,
        `${acc.studentName.slice(0, 22)} (${acc.className}-${acc.section})`,
        "F1",
        7.5
      );
      s += pdfText(265, y, acc.studentEmail.slice(0, 36), "F1", 7.5);
      s += pdfText(465, y, acc.studentPassword, "F2", 7.5, [0.05, 0.35, 0.2]);
      s += pdfText(575, y, acc.assignedByAdmin.slice(0, 24), "F1", 7.5);
      s += pdfText(710, y, acc.campus.slice(0, 12), "F1", 7.5);
      s += pdfText(775, y, acc.studentPortalStatus, "F2", 7.5);
      y -= 22;
    });

    streams.push(s);
  }

  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(blob, "student-portal-accounts.pdf");
}

export function exportParentAccountsPdf(accounts: StudentAccountRecord[]) {
  const rowsPerPage = 18;
  const totalPages = Math.max(1, Math.ceil(accounts.length / rowsPerPage));
  const streams: string[] = [];
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  for (let p = 0; p < totalPages; p++) {
    const slice = accounts.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
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
      "Parent / Guardian Portal Credentials Register",
      "F2",
      9,
      [0.85, 0.9, 0.98]
    );
    s += pdfText(
      40,
      532,
      `Scope: Multi-Campus System  |  Generated: ${generatedDate}  |  Total Parent Accounts: ${accounts.length}  |  Page ${p + 1} of ${totalPages}`,
      "F1",
      7.5,
      [0.82, 0.88, 0.96]
    );

    s += pdfRect(28, 502, 785, 20, [0.93, 0.95, 0.98]);
    s += pdfText(34, 509, "Account #", "F2", 8);
    s += pdfText(115, 509, "Parent / Guardian", "F2", 8);
    s += pdfText(255, 509, "Ward (Student & Class)", "F2", 8);
    s += pdfText(395, 509, "Assigned Parent Email", "F2", 8);
    s += pdfText(575, 509, "Assigned Password", "F2", 8);
    s += pdfText(685, 509, "Campus", "F2", 8);
    s += pdfText(765, 509, "Status", "F2", 8);

    let y = 485;
    slice.forEach((acc, idx) => {
      if (idx % 2 === 1) {
        s += pdfRect(28, y - 5, 785, 20, [0.975, 0.982, 0.992]);
      }
      const prtNo = acc.accountNo.replace("STD-", "PRT-");
      s += pdfText(34, y, `${prtNo} (#${acc.rollNo})`, "F2", 7.5);
      s += pdfText(
        115,
        y,
        `${acc.guardianName.slice(0, 18)} (${acc.guardianRelation})`,
        "F1",
        7.5
      );
      s += pdfText(
        255,
        y,
        `${acc.studentName.slice(0, 18)} (${acc.className}-${acc.section})`,
        "F1",
        7.5
      );
      s += pdfText(395, y, acc.parentEmail.slice(0, 34), "F1", 7.5);
      s += pdfText(575, y, acc.parentPassword, "F2", 7.5, [0.05, 0.35, 0.2]);
      s += pdfText(685, y, acc.campus.slice(0, 12), "F1", 7.5);
      s += pdfText(765, y, acc.parentPortalStatus, "F2", 7.5);
      y -= 22;
    });

    streams.push(s);
  }

  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(blob, "parent-portal-accounts.pdf");
}

export function exportStaffAccountsPdf(accounts: StaffAccountRecord[]) {
  const rowsPerPage = 18;
  const totalPages = Math.max(1, Math.ceil(accounts.length / rowsPerPage));
  const streams: string[] = [];
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  for (let p = 0; p < totalPages; p++) {
    const slice = accounts.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
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
      "Staff Portal Credentials Register",
      "F2",
      9,
      [0.85, 0.9, 0.98]
    );
    s += pdfText(
      40,
      532,
      `Scope: Multi-Campus System  |  Generated: ${generatedDate}  |  Total Staff Accounts: ${accounts.length}  |  Page ${p + 1} of ${totalPages}`,
      "F1",
      7.5,
      [0.82, 0.88, 0.96]
    );

    s += pdfRect(28, 502, 785, 20, [0.93, 0.95, 0.98]);
    s += pdfText(34, 509, "Account #", "F2", 8);
    s += pdfText(115, 509, "Staff Member", "F2", 8);
    s += pdfText(245, 509, "Designation & Dept", "F2", 8);
    s += pdfText(380, 509, "Assigned Staff Email", "F2", 8);
    s += pdfText(545, 509, "Assigned Password", "F2", 8);
    s += pdfText(640, 509, "Portal Role", "F2", 8);
    s += pdfText(765, 509, "Status", "F2", 8);

    let y = 485;
    slice.forEach((acc, idx) => {
      if (idx % 2 === 1) {
        s += pdfRect(28, y - 5, 785, 20, [0.975, 0.982, 0.992]);
      }
      s += pdfText(34, y, `${acc.accountNo} (${acc.empCode})`, "F2", 7.5);
      s += pdfText(115, y, acc.name.slice(0, 22), "F1", 7.5);
      s += pdfText(
        245,
        y,
        `${acc.designation.slice(0, 14)} | ${acc.department.slice(0, 10)}`,
        "F1",
        7.5
      );
      s += pdfText(380, y, acc.staffEmail.slice(0, 30), "F1", 7.5);
      s += pdfText(545, y, acc.staffPassword, "F2", 7.5, [0.05, 0.35, 0.2]);
      s += pdfText(640, y, acc.portalRole.slice(0, 22), "F1", 7.5);
      s += pdfText(765, y, acc.credentialStatus, "F2", 7.5);
      y -= 22;
    });

    streams.push(s);
  }

  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(blob, "staff-portal-accounts.pdf");
}

/* ───────────────────── Single Account Credential Slips (PDF) ───────────────────── */

export function exportSingleStudentAccountPdf(account: StudentAccountRecord) {
  let s = "";
  s += pdfRect(36, 742, 523, 62, [0.04, 0.11, 0.24]);
  s += pdfText(
    48,
    786,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    48,
    770,
    "Student & Parent Portal Login Credential Slip",
    "F2",
    9.5,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    48,
    754,
    `Account ID: ${account.accountNo}  |  Roll #${account.rollNo}  |  Campus: ${account.campus}`,
    "F1",
    8,
    [0.82, 0.88, 0.96]
  );

  s += pdfText(50, 718, `Student Name: ${account.studentName}`, "F2", 10);
  s += pdfText(
    50,
    702,
    `Class & Section: ${account.className} - ${account.section}  |  Admission #: ${account.admissionNumber}`,
    "F1",
    9
  );
  s += pdfText(
    50,
    686,
    `Assigned By: ${account.assignedByAdmin}  |  Status: ${account.credentialStatus}`,
    "F1",
    9
  );

  s += pdfRect(36, 600, 523, 65, [0.94, 0.97, 0.95]);
  s += pdfText(
    50,
    645,
    "1. STUDENT PORTAL LOGIN CREDENTIALS (Assigned by Student Admin)",
    "F2",
    10,
    [0.04, 0.3, 0.18]
  );
  s += pdfText(
    50,
    627,
    `Student Portal Email:    ${account.studentEmail}`,
    "F2",
    9.5
  );
  s += pdfText(
    50,
    611,
    `Assigned Password:       ${account.studentPassword}`,
    "F2",
    9.5
  );

  s += pdfRect(36, 515, 523, 70, [0.94, 0.96, 0.99]);
  s += pdfText(
    50,
    565,
    `2. PARENT / GUARDIAN PORTAL CREDENTIALS (${account.guardianName} - ${account.guardianRelation})`,
    "F2",
    10,
    [0.05, 0.2, 0.45]
  );
  s += pdfText(
    50,
    547,
    `Parent Portal Email:     ${account.parentEmail}`,
    "F2",
    9.5
  );
  s += pdfText(
    50,
    531,
    `Assigned Password:       ${account.parentPassword}`,
    "F2",
    9.5
  );
  s += pdfText(
    50,
    519,
    `Registered Phone:        ${account.phone}`,
    "F1",
    8.5
  );

  const blob = buildMinimalPdf([s], "portrait");
  triggerBlobDownload(blob, `${account.accountNo}-credentials-slip.pdf`);
}

export function exportSingleStaffAccountPdf(account: StaffAccountRecord) {
  let s = "";
  s += pdfRect(36, 742, 523, 62, [0.04, 0.11, 0.24]);
  s += pdfText(
    48,
    786,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    48,
    770,
    "Staff Portal Login Credential Slip",
    "F2",
    9.5,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    48,
    754,
    `Account ID: ${account.accountNo}  |  Emp Code: ${account.empCode}  |  Campus: ${account.campus}`,
    "F1",
    8,
    [0.82, 0.88, 0.96]
  );

  s += pdfText(50, 718, `Staff Member: ${account.name}`, "F2", 10);
  s += pdfText(
    50,
    702,
    `Designation: ${account.designation}  |  Department: ${account.department} (${account.category})`,
    "F1",
    9
  );
  s += pdfText(
    50,
    686,
    `Assigned By: ${account.assignedByAdmin}  |  Status: ${account.credentialStatus}`,
    "F1",
    9
  );

  s += pdfRect(36, 588, 523, 80, [0.94, 0.97, 0.95]);
  s += pdfText(
    50,
    648,
    "STAFF PORTAL LOGIN CREDENTIALS (Assigned by Staff Admin)",
    "F2",
    10,
    [0.04, 0.3, 0.18]
  );
  s += pdfText(
    50,
    630,
    `Official Staff Email:    ${account.staffEmail}`,
    "F2",
    9.5
  );
  s += pdfText(
    50,
    614,
    `Assigned Password:       ${account.staffPassword}`,
    "F2",
    9.5
  );
  s += pdfText(
    50,
    598,
    `Assigned Portal Role:    ${account.portalRole}`,
    "F1",
    9
  );

  const blob = buildMinimalPdf([s], "portrait");
  triggerBlobDownload(blob, `${account.accountNo}-staff-credentials-slip.pdf`);
}

/* ───────────────────── Print Previews ───────────────────── */

export function printStudentAccountsRegister(
  accounts: StudentAccountRecord[]
): boolean {
  const rowsHtml = accounts
    .map(
      (a) => `
      <tr>
        <td><strong>${a.accountNo}</strong><br/><span class="sub">Roll #${a.rollNo} · ${a.admissionNumber}</span></td>
        <td><strong>${a.studentName}</strong><br/><span class="sub">${a.className}-${a.section} · ${a.campus}</span></td>
        <td class="mono">${a.studentEmail}</td>
        <td class="mono"><span class="pass">${a.studentPassword}</span></td>
        <td>${a.assignedByAdmin}<br/><span class="sub">Last Login: ${a.studentLastLogin}</span></td>
        <td><span class="badge">${a.studentPortalStatus}</span></td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Student Portal Credentials Register - EduSphere</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 24px; color: #0f172a; }
        .banner { background: #091d3e; color: #fff; padding: 14px 18px; border-radius: 6px; margin-bottom: 16px; }
        .banner h1 { font-size: 16px; margin: 0 0 4px; color: #fff; letter-spacing: 0.02em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 4px; }
        .banner p.meta { font-size: 11px; color: #94a3b8; margin: 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; font-weight: 700; color: #091d3e; }
        .sub { color: #64748b; font-size: 10.5px; }
        .mono { font-family: ui-monospace, monospace; font-size: 11px; }
        .pass { display: inline-block; background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; background: #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Student Portal Login Credentials Register</div>
        <p class="meta">Provisioned by Student Admin · Total Student Accounts: ${accounts.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Account &amp; Roll #</th>
            <th>Student &amp; Class</th>
            <th>Assigned Student Email</th>
            <th>Assigned Password</th>
            <th>Assigned By &amp; Last Login</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </body>
  </html>`;

  return printHtml(html);
}

export function printParentAccountsRegister(
  accounts: StudentAccountRecord[]
): boolean {
  const rowsHtml = accounts
    .map(
      (a) => `
      <tr>
        <td><strong>${a.accountNo.replace("STD-", "PRT-")}</strong><br/><span class="sub">Linked Roll #${a.rollNo}</span></td>
        <td><strong>${a.guardianName}</strong> (${a.guardianRelation})<br/><span class="sub">${a.phone}</span></td>
        <td><strong>${a.studentName}</strong><br/><span class="sub">${a.className}-${a.section} · ${a.campus}</span></td>
        <td class="mono">${a.parentEmail}</td>
        <td class="mono"><span class="pass">${a.parentPassword}</span></td>
        <td>${a.assignedByAdmin}<br/><span class="sub">Last Login: ${a.parentLastLogin}</span></td>
        <td><span class="badge">${a.parentPortalStatus}</span></td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Parent Portal Credentials Register - EduSphere</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 24px; color: #0f172a; }
        .banner { background: #091d3e; color: #fff; padding: 14px 18px; border-radius: 6px; margin-bottom: 16px; }
        .banner h1 { font-size: 16px; margin: 0 0 4px; color: #fff; letter-spacing: 0.02em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 4px; }
        .banner p.meta { font-size: 11px; color: #94a3b8; margin: 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; font-weight: 700; color: #091d3e; }
        .sub { color: #64748b; font-size: 10.5px; }
        .mono { font-family: ui-monospace, monospace; font-size: 11px; }
        .pass { display: inline-block; background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; background: #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Parent / Guardian Portal Login Credentials Register</div>
        <p class="meta">Provisioned by Parent Admin · Total Parent Accounts: ${accounts.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Account &amp; Roll #</th>
            <th>Parent / Guardian</th>
            <th>Ward (Student &amp; Class)</th>
            <th>Assigned Parent Email</th>
            <th>Assigned Password</th>
            <th>Assigned By &amp; Last Login</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </body>
  </html>`;

  return printHtml(html);
}

export function printStaffAccountsRegister(
  accounts: StaffAccountRecord[]
): boolean {
  const rowsHtml = accounts
    .map(
      (a) => `
      <tr>
        <td><strong>${a.accountNo}</strong><br/><span class="sub">${a.empCode} · ${a.category}</span></td>
        <td><strong>${a.name}</strong><br/><span class="sub">${a.designation} · ${a.department}</span></td>
        <td>${a.campus}<br/><span class="sub">${a.portalRole}</span></td>
        <td class="mono">${a.staffEmail}</td>
        <td class="mono"><span class="pass">${a.staffPassword}</span></td>
        <td>${a.assignedByAdmin}<br/><span class="sub">Last Login: ${a.lastLogin}</span></td>
        <td><span class="badge">${a.credentialStatus}</span></td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Staff Portal Credentials Register - EduSphere</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 24px; color: #0f172a; }
        .banner { background: #091d3e; color: #fff; padding: 14px 18px; border-radius: 6px; margin-bottom: 16px; }
        .banner h1 { font-size: 16px; margin: 0 0 4px; color: #fff; letter-spacing: 0.02em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 4px; }
        .banner p.meta { font-size: 11px; color: #94a3b8; margin: 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; font-weight: 700; color: #091d3e; }
        .sub { color: #64748b; font-size: 10.5px; }
        .mono { font-family: ui-monospace, monospace; font-size: 11px; }
        .pass { display: inline-block; background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; background: #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Staff Portal Login Credentials Register</div>
        <p class="meta">Provisioned by Staff Admin · Total Staff Accounts: ${accounts.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Account &amp; Emp Code</th>
            <th>Staff Member &amp; Dept</th>
            <th>Campus &amp; Portal Role</th>
            <th>Assigned Staff Email</th>
            <th>Assigned Password</th>
            <th>Assigned By &amp; Login</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </body>
  </html>`;

  return printHtml(html);
}

export function printSingleStudentAccountStatement(
  account: StudentAccountRecord
): boolean {
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Credential Slip - ${account.studentName}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 32px; color: #0f172a; }
        .banner { background: #091d3e; color: #fff; padding: 14px 18px; border-radius: 8px; margin-bottom: 16px; }
        .banner h1 { font-size: 15px; margin: 0 0 3px; color: #fff; letter-spacing: 0.04em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 3px; }
        .banner p.meta { font-size: 10.5px; color: #94a3b8; margin: 0; }
        .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 18px; }
        h2 { font-size: 14px; margin: 0 0 12px; color: #091d3e; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #e2e8f0; }
        .mono { font-family: ui-monospace, monospace; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Student &amp; Parent Portal Login Credentials</div>
        <p class="meta">Account #${account.accountNo} · Roll #${account.rollNo} · ${account.className}-${account.section} (${account.campus})</p>
      </div>
      <div class="card">
        <h2>Student Portal Login (Assigned by Student Admin)</h2>
        <div class="row"><span>Student Name:</span><strong>${account.studentName}</strong></div>
        <div class="row"><span>Student Login Email:</span><span class="mono">${account.studentEmail}</span></div>
        <div class="row"><span>Assigned Password:</span><span class="mono">${account.studentPassword}</span></div>
        <div class="row"><span>Portal Status:</span><strong>${account.studentPortalStatus}</strong></div>
      </div>
      <div class="card">
        <h2>Parent / Guardian Portal Login (Assigned by Student/Parent Admin)</h2>
        <div class="row"><span>Guardian Name:</span><strong>${account.guardianName} (${account.guardianRelation})</strong></div>
        <div class="row"><span>Parent Login Email:</span><span class="mono">${account.parentEmail}</span></div>
        <div class="row"><span>Assigned Password:</span><span class="mono">${account.parentPassword}</span></div>
        <div class="row"><span>Registered Phone:</span><span class="mono">${account.phone}</span></div>
      </div>
    </body>
  </html>`;

  return printHtml(html);
}

export function printSingleStaffAccountStatement(
  account: StaffAccountRecord
): boolean {
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Staff Credential Slip - ${account.name}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 32px; color: #0f172a; }
        .banner { background: #091d3e; color: #fff; padding: 14px 18px; border-radius: 8px; margin-bottom: 16px; }
        .banner h1 { font-size: 15px; margin: 0 0 3px; color: #fff; letter-spacing: 0.04em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 3px; }
        .banner p.meta { font-size: 10.5px; color: #94a3b8; margin: 0; }
        .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 18px; }
        h2 { font-size: 14px; margin: 0 0 12px; color: #091d3e; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #e2e8f0; }
        .mono { font-family: ui-monospace, monospace; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Staff Portal Login Credentials</div>
        <p class="meta">Account #${account.accountNo} · Emp Code: ${account.empCode} · ${account.campus}</p>
      </div>
      <div class="card">
        <h2>Staff Portal Credentials (Assigned by Staff Admin)</h2>
        <div class="row"><span>Staff Member:</span><strong>${account.name} (${account.designation})</strong></div>
        <div class="row"><span>Department:</span><strong>${account.department} (${account.category})</strong></div>
        <div class="row"><span>Official Login Email:</span><span class="mono">${account.staffEmail}</span></div>
        <div class="row"><span>Assigned Password:</span><span class="mono">${account.staffPassword}</span></div>
        <div class="row"><span>Assigned Portal Role:</span><strong>${account.portalRole}</strong></div>
        <div class="row"><span>Assigned By:</span><strong>${account.assignedByAdmin}</strong></div>
      </div>
    </body>
  </html>`;

  return printHtml(html);
}
