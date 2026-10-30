"use client";

import * as React from "react";
import {
  Award,
  Users,
  Percent,
  Printer,
  Download,
  Plus,
  Check,
  ShieldCheck,
  Eye,
  Pencil,
  School,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import { PersonCell, UserAvatar } from "@/components/shared/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, fieldClass } from "../../attendance/_components/attendance-kit";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  FEE_SCHOLARSHIP_AWARDS,
  type FeeScholarshipAward,
} from "@/lib/mock/finance";
import { SCHOLARSHIPS } from "@/lib/mock/operations";
import { exportScholarshipsPdf, printScholarshipsReport } from "./scholarships-export";

export function ScholarshipsClient() {
  const [records, setRecords] = React.useState<FeeScholarshipAward[]>(
    FEE_SCHOLARSHIP_AWARDS
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // View modal state
  const [selectedAward, setSelectedAward] = React.useState<FeeScholarshipAward | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);

  // Edit modal state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingAward, setEditingAward] = React.useState<FeeScholarshipAward | null>(null);

  // Create Form states
  const [student, setStudent] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [className, setClassName] = React.useState("Grade 9-A");
  const [campus, setCampus] = React.useState("Gulberg");
  const [scholarshipName, setScholarshipName] =
    React.useState<FeeScholarshipAward["scholarshipName"]>("Merit Scholarship");
  const [concessionPercent, setConcessionPercent] = React.useState("50");
  const [monthlyValue, setMonthlyValue] = React.useState("9250");
  const [authority, setAuthority] = React.useState("Academic Board");

  // Edit Form states
  const [editStudent, setEditStudent] = React.useState("");
  const [editRollNo, setEditRollNo] = React.useState("");
  const [editClassName, setEditClassName] = React.useState("Grade 9-A");
  const [editCampus, setEditCampus] = React.useState("Gulberg");
  const [editScholarshipName, setEditScholarshipName] =
    React.useState<FeeScholarshipAward["scholarshipName"]>("Merit Scholarship");
  const [editConcessionPercent, setEditConcessionPercent] = React.useState("50");
  const [editMonthlyValue, setEditMonthlyValue] = React.useState("9250");
  const [editValidUntil, setEditValidUntil] = React.useState("2027-06-30");
  const [editStatus, setEditStatus] =
    React.useState<FeeScholarshipAward["status"]>("Active");
  const [editAuthority, setEditAuthority] = React.useState("Academic Board");

  const totalMonthlySubsidy = records.reduce((s, r) => s + r.monthlyValue, 0);
  const totalBeneficiaries = SCHOLARSHIPS.reduce((s, r) => s + r.beneficiaries, 0);

  const handleOpenEdit = React.useCallback((award: FeeScholarshipAward) => {
    setEditingAward(award);
    setEditStudent(award.student);
    setEditRollNo(award.rollNo);
    setEditClassName(award.className);
    setEditCampus(award.campus);
    setEditScholarshipName(award.scholarshipName);
    setEditConcessionPercent(String(award.concessionPercent));
    setEditMonthlyValue(String(award.monthlyValue));
    setEditValidUntil(award.validUntil);
    setEditStatus(award.status);
    setEditAuthority(award.authority);
    setEditDialogOpen(true);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.trim()) {
      toast.error("Please enter student name.");
      return;
    }

    const nextId = `sch-${Date.now()}`;
    const nextNo = `SCH-2026-0${records.length + 47}`;
    const newAward: FeeScholarshipAward = {
      id: nextId,
      awardNo: nextNo,
      student: student.trim(),
      rollNo: rollNo.trim() || "101",
      className,
      campus,
      scholarshipName,
      concessionPercent: Number(concessionPercent) || 50,
      monthlyValue: Number(monthlyValue) || 8000,
      awardedDate: new Date().toISOString().slice(0, 10),
      validUntil: "2027-06-30",
      status: "Active",
      authority,
    };

    setRecords([newAward, ...records]);
    setDialogOpen(false);
    setStudent("");
    setRollNo("");
    toast.success(`Scholarship award ${nextNo} granted to ${student.trim()}.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAward) return;
    if (!editStudent.trim()) {
      toast.error("Please enter student name.");
      return;
    }

    const updated: FeeScholarshipAward = {
      ...editingAward,
      student: editStudent.trim(),
      rollNo: editRollNo.trim() || editingAward.rollNo,
      className: editClassName,
      campus: editCampus,
      scholarshipName: editScholarshipName,
      concessionPercent: Number(editConcessionPercent) || 0,
      monthlyValue: Number(editMonthlyValue) || 0,
      validUntil: editValidUntil || editingAward.validUntil,
      status: editStatus,
      authority: editAuthority.trim() || editingAward.authority,
    };

    setRecords((prev) =>
      prev.map((item) => (item.id === editingAward.id ? updated : item))
    );

    if (selectedAward && selectedAward.id === editingAward.id) {
      setSelectedAward(updated);
    }

    setEditDialogOpen(false);
    toast.success(`Scholarship award ${editingAward.awardNo} updated successfully.`);
  };

  const columns: Column<FeeScholarshipAward>[] = [
    {
      key: "awardNo",
      header: "Award #",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {r.awardNo}
        </span>
      ),
      className: "w-[10%] text-center",
      headerClassName: "w-[10%] text-center",
    },
    {
      key: "student",
      header: "Beneficiary Student",
      align: "center",
      className: "w-[18%] text-center",
      headerClassName: "w-[18%] text-center",
      cell: (r) => (
        <PersonCell
          name={r.student}
          subtitle={`Roll #${r.rollNo} · ${r.className}`}
          showAvatar={false}
          className="text-center"
        />
      ),
    },
    {
      key: "campus",
      header: "Campus",
      align: "center",
      cell: (r) => <span className="text-[13px]">{r.campus}</span>,
      className: "w-[10%] text-center",
      headerClassName: "w-[10%] text-center",
    },
    {
      key: "scholarshipName",
      header: "Scheme / Program",
      align: "center",
      cell: (r) => (
        <div className="space-y-0.5 text-center">
          <p className="text-xs font-semibold text-foreground">{r.scholarshipName}</p>
          <p className="text-[11px] text-muted-foreground">{r.authority}</p>
        </div>
      ),
      className: "w-[15%] text-center",
      headerClassName: "w-[15%] text-center",
    },
    {
      key: "concessionPercent",
      header: "Concession",
      align: "center",
      className: "w-[9%] text-center",
      headerClassName: "w-[9%] text-center",
      cell: (r) => (
        <div className="flex justify-center">
          <span className="inline-flex flex-col items-center justify-center rounded-md bg-brand/10 px-2.5 py-1 text-center font-mono text-xs font-bold leading-tight text-brand">
            <span>{r.concessionPercent}%</span>
            <span>Off</span>
          </span>
        </div>
      ),
    },
    {
      key: "monthlyValue",
      header: "Monthly Subsidy",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs font-bold tabular-nums text-foreground">
          {formatCurrency(r.monthlyValue)}
        </span>
      ),
      className: "w-[11%] text-center",
      headerClassName: "w-[11%] text-center",
    },
    {
      key: "validUntil",
      header: "Valid Until",
      align: "center",
      cell: (r) => (
        <span className="text-[13px] tabular-nums text-muted-foreground">
          {formatDate(r.validUntil)}
        </span>
      ),
      className: "w-[9%] text-center",
      headerClassName: "w-[9%] text-center",
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (r) => (
        <div className="flex justify-center">
          <StatusBadge
            status={
              r.status === "Active"
                ? "Active"
                : r.status === "Under Review"
                ? "Pending"
                : "Inactive"
            }
          />
        </div>
      ),
      className: "w-[8%] text-center",
      headerClassName: "w-[8%] text-center",
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      className: "w-[14%] px-2 text-center",
      headerClassName: "w-[14%] text-center",
      cell: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          <ActionButton
            tone="outline"
            size="xs"
            title="View scholarship award details"
            onClick={() => {
              setSelectedAward(r);
              setViewDialogOpen(true);
            }}
          >
            <Eye className="size-3.5" />
            <span>View</span>
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit scholarship award"
            onClick={() => handleOpenEdit(r)}
          >
            <Pencil className="size-3.5" />
            <span>Edit</span>
          </ActionButton>
        </div>
      ),
    },
  ];

  const filters: FilterDef<FeeScholarshipAward>[] = [
    {
      key: "scholarshipName",
      label: "Program",
      options: [
        "Merit Scholarship",
        "Need-Based Aid",
        "Sibling Discount",
        "Staff Ward Concession",
        "Sports Excellence",
      ],
      getValue: (r) => r.scholarshipName,
    },
    {
      key: "campus",
      label: "Campus",
      options: ["Gulberg", "DHA Phase 5", "F-8 Islamabad", "Clifton", "Bahria Town"],
      getValue: (r) => r.campus,
    },
    {
      key: "status",
      label: "Status",
      options: ["Active", "Under Review", "Lapsed"],
      getValue: (r) => r.status,
    },
  ];

  const handlePrint = React.useCallback(() => {
    const ok = printScholarshipsReport(records);
    if (ok) {
      toast.info("Opening print preview for Scholarships & Concessions Register…");
    }
  }, [records]);

  const handleExportPdf = React.useCallback(() => {
    const ok = exportScholarshipsPdf(records);
    if (ok) {
      toast.success(
        `Scholarships register (${records.length} awards) downloaded as PDF.`
      );
    }
  }, [records]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Scholarships & Concessions"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => setDialogOpen(true)}
            >
              <Plus />
              <span>Award Scholarship</span>
            </ActionButton>
          </>
        }
      />

      {/* KPI Cards */}
      <StatGrid>
        <StatCard
          label="Total Beneficiaries"
          value={`${totalBeneficiaries} Students`}
          icon={Users}
        />
        <StatCard
          label="Monthly Fee Subsidy"
          value={formatCurrency(totalMonthlySubsidy * 25)}
          icon={Award}
        />
        <StatCard
          label="Active Programs"
          value="5 Approved Schemes"
          icon={ShieldCheck}
        />
        <StatCard
          label="Average Concession"
          value="48.5% Tuition"
          icon={Percent}
        />
      </StatGrid>

      {/* Standalone Section Heading & DataTable */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            Institutional Scholarship & Concession Register
          </h2>
        </div>

        {/* DataTable */}
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={records}
            columns={columns}
            getRowId={(r) => r.id}
            filters={filters}
            searchPlaceholder="Search by student, award # or scheme…"
            searchFn={(r, q) =>
              r.student.toLowerCase().includes(q) ||
              r.awardNo.toLowerCase().includes(q) ||
              r.scholarshipName.toLowerCase().includes(q)
            }
            pageSize={8}
          />
        </SectionCard>
      </div>

      {/* View Award Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedAward && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <Award className="size-4 text-brand" />
                      <span>Scholarship Award Details</span>
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs text-muted-foreground">
                      Ref: {selectedAward.awardNo} · Granted on {formatDate(selectedAward.awardedDate)}
                    </DialogDescription>
                  </div>
                  <StatusBadge
                    status={
                      selectedAward.status === "Active"
                        ? "Active"
                        : selectedAward.status === "Under Review"
                        ? "Pending"
                        : "Inactive"
                    }
                  />
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Beneficiary Student Card */}
                <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={selectedAward.student}
                      size="lg"
                      className="ring-2 ring-brand/15"
                    />
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-foreground">
                        {selectedAward.student}
                      </h4>
                      <p className="truncate text-xs text-muted-foreground">
                        Roll #{selectedAward.rollNo} · {selectedAward.className}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start rounded-md border border-brand/20 bg-white px-2.5 py-1 text-xs font-semibold text-brand sm:self-center shadow-2xs">
                    <School className="size-3.5" />
                    <span>{selectedAward.campus} Campus</span>
                  </div>
                </div>

                {/* Concession Breakdown Grid */}
                <div className="grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-white shadow-2xs">
                  <div className="p-3 text-center">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Concession Rate
                    </span>
                    <p className="mt-1 font-mono text-base font-bold text-brand">
                      {selectedAward.concessionPercent}% Off
                    </p>
                  </div>
                  <div className="bg-emerald-50/40 p-3 text-center">
                    <span className="text-[11px] font-semibold text-emerald-800">
                      Monthly Subsidy
                    </span>
                    <p className="mt-1 font-mono text-base font-bold text-emerald-700">
                      {formatCurrency(selectedAward.monthlyValue)}
                    </p>
                  </div>
                  <div className="p-3 text-center">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Annual Relief
                    </span>
                    <p className="mt-1 font-mono text-base font-bold text-foreground">
                      {formatCurrency(selectedAward.monthlyValue * 12)}
                    </p>
                  </div>
                </div>

                {/* Scheme & Authority Meta */}
                <div className="rounded-xl border border-border/70 bg-white p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-muted-foreground" />
                      Scholarship Scheme
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedAward.scholarshipName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-muted-foreground" />
                      Sanctioning Authority
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedAward.authority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      Validity Period
                    </span>
                    <span className="font-mono text-foreground">
                      {formatDate(selectedAward.awardedDate)} – {formatDate(selectedAward.validUntil)}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                <ActionButton
                  tone="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </ActionButton>
                <ActionButton
                  tone="primary"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleOpenEdit(selectedAward);
                  }}
                >
                  <Pencil className="size-3.5" />
                  <span>Edit Award</span>
                </ActionButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Scholarship Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4 text-brand" />
              <span>Edit Scholarship Award</span>
            </DialogTitle>
            <DialogDescription>
              Modify scholarship parameters, student tier, or concession validity for {editingAward?.awardNo}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Student Name">
                <input
                  type="text"
                  required
                  placeholder="e.g. Areeba Tariq"
                  value={editStudent}
                  onChange={(e) => setEditStudent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  type="text"
                  placeholder="e.g. 118"
                  value={editRollNo}
                  onChange={(e) => setEditRollNo(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Class">
                <select
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className={fieldClass}
                >
                  <option>Grade 6-A</option>
                  <option>Grade 6-B</option>
                  <option>Grade 7-A</option>
                  <option>Grade 7-B</option>
                  <option>Grade 8-A</option>
                  <option>Grade 8-C</option>
                  <option>Grade 9-A</option>
                  <option>Grade 10-B</option>
                  <option>Grade 11-A</option>
                  <option>Grade 12-A</option>
                </select>
              </Field>
              <Field label="Campus">
                <select
                  value={editCampus}
                  onChange={(e) => setEditCampus(e.target.value)}
                  className={fieldClass}
                >
                  <option>Gulberg</option>
                  <option>DHA Phase 5</option>
                  <option>F-8 Islamabad</option>
                  <option>Clifton</option>
                  <option>Bahria Town</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Scheme Program">
                <select
                  value={editScholarshipName}
                  onChange={(e) =>
                    setEditScholarshipName(
                      e.target.value as FeeScholarshipAward["scholarshipName"]
                    )
                  }
                  className={fieldClass}
                >
                  <option>Merit Scholarship</option>
                  <option>Need-Based Aid</option>
                  <option>Sibling Discount</option>
                  <option>Staff Ward Concession</option>
                  <option>Sports Excellence</option>
                </select>
              </Field>
              <Field label="Concession %">
                <input
                  type="number"
                  min={5}
                  max={100}
                  required
                  placeholder="e.g. 50"
                  value={editConcessionPercent}
                  onChange={(e) => setEditConcessionPercent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Monthly Value (Rs)">
                <input
                  type="number"
                  min={500}
                  required
                  placeholder="e.g. 12500"
                  value={editMonthlyValue}
                  onChange={(e) => setEditMonthlyValue(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Valid Until">
                <input
                  type="date"
                  value={editValidUntil}
                  onChange={(e) => setEditValidUntil(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Award Status">
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as FeeScholarshipAward["status"])
                  }
                  className={fieldClass}
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Lapsed">Lapsed</option>
                </select>
              </Field>
            </div>

            <Field label="Sanctioning Authority">
              <input
                type="text"
                placeholder="e.g. Academic Council / Principal"
                value={editAuthority}
                onChange={(e) => setEditAuthority(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <ActionButton tone="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary">
                <Check />
                Save Changes
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Award Scholarship Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="size-4 text-brand" />
              <span>Award Scholarship / Concession</span>
            </DialogTitle>
            <DialogDescription>
              Grant fee concession or merit tuition waiver to an eligible enrolled student.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Student Name">
                <input
                  type="text"
                  required
                  placeholder="e.g. Areeba Tariq"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  type="text"
                  placeholder="e.g. 118"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Class">
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={fieldClass}
                >
                  <option>Grade 6-A</option>
                  <option>Grade 7-B</option>
                  <option>Grade 8-C</option>
                  <option>Grade 9-A</option>
                  <option>Grade 10-B</option>
                  <option>Grade 11-A</option>
                </select>
              </Field>
              <Field label="Campus">
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className={fieldClass}
                >
                  <option>Gulberg</option>
                  <option>DHA Phase 5</option>
                  <option>F-8 Islamabad</option>
                  <option>Clifton</option>
                  <option>Bahria Town</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Scheme Program">
                <select
                  value={scholarshipName}
                  onChange={(e) =>
                    setScholarshipName(
                      e.target.value as FeeScholarshipAward["scholarshipName"]
                    )
                  }
                  className={fieldClass}
                >
                  <option>Merit Scholarship</option>
                  <option>Need-Based Aid</option>
                  <option>Sibling Discount</option>
                  <option>Staff Ward Concession</option>
                  <option>Sports Excellence</option>
                </select>
              </Field>
              <Field label="Concession %">
                <input
                  type="number"
                  min={5}
                  max={100}
                  required
                  placeholder="e.g. 50"
                  value={concessionPercent}
                  onChange={(e) => setConcessionPercent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Monthly Value (Rs)">
                <input
                  type="number"
                  min={500}
                  required
                  placeholder="e.g. 12500"
                  value={monthlyValue}
                  onChange={(e) => setMonthlyValue(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Sanctioning Authority">
              <input
                type="text"
                placeholder="e.g. Academic Council / Principal"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <ActionButton tone="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary">
                <Check />
                Grant Award
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
