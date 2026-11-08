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
import { UserAvatar } from "@/components/shared/user-avatar";
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
  readFeeScholarships,
  writeFeeScholarships,
  syncScholarshipWithFeeChallan,
  readFeeConfiguration,
  resolveMatchingTier,
  readFeeChallans,
} from "@/lib/mock/finance-storage";
import { STUDENTS } from "@/lib/mock/institution";
import {
  FEE_SCHOLARSHIP_AWARDS,
  type FeeScholarshipAward,
} from "@/lib/mock/finance";
import { SCHOLARSHIPS } from "@/lib/mock/operations";
import { exportScholarshipsPdf, printScholarshipsReport } from "./scholarships-export";

export function ScholarshipsClient() {
  const [records, setRecords] = React.useState<FeeScholarshipAward[]>(() => {
    return readFeeScholarships();
  });
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
  const [concessionPercent, setConcessionPercent] = React.useState("20");
  const [monthlyValue, setMonthlyValue] = React.useState("3700");
  const [authority, setAuthority] = React.useState("Academic Board");

  // Edit Form states
  const [editStudent, setEditStudent] = React.useState("");
  const [editRollNo, setEditRollNo] = React.useState("");
  const [editClassName, setEditClassName] = React.useState("Grade 9-A");
  const [editCampus, setEditCampus] = React.useState("Gulberg");
  const [editScholarshipName, setEditScholarshipName] =
    React.useState<FeeScholarshipAward["scholarshipName"]>("Merit Scholarship");
  const [editConcessionPercent, setEditConcessionPercent] = React.useState("20");
  const [editMonthlyValue, setEditMonthlyValue] = React.useState("3700");
  const [editValidUntil, setEditValidUntil] = React.useState("2027-06-30");
  const [editStatus, setEditStatus] =
    React.useState<FeeScholarshipAward["status"]>("Active");
  const [editAuthority, setEditAuthority] = React.useState("Academic Board");

  // Cross-submodule live synchronization listener
  React.useEffect(() => {
    setRecords(readFeeScholarships());
    const onSync = () => {
      setRecords(readFeeScholarships());
    };
    window.addEventListener("edusphere:fee-scholarships-updated", onSync);
    return () => window.removeEventListener("edusphere:fee-scholarships-updated", onSync);
  }, []);

  // Candidate enrolled students pool for instant auto-complete and lookup
  const candidateStudents = React.useMemo(() => {
    const list: Array<{ name: string; rollNo: string; className: string; campus: string; tuitionFee: number }> = [];
    const seen = new Set<string>();
    const tiers = readFeeConfiguration();

    const challans = readFeeChallans();
    for (const c of challans) {
      const key = `${c.student.trim().toLowerCase()}_${c.className.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        const tier = resolveMatchingTier(c.className, tiers);
        const tuition = c.tuitionFee ?? tier?.tuitionFee ?? 18500;
        list.push({
          name: c.student.trim(),
          rollNo: c.rollNo ? c.rollNo.replace(/^Roll\s*#?/i, "").trim() : "10",
          className: c.className,
          campus: c.campus,
          tuitionFee: tuition,
        });
      }
    }

    for (const s of STUDENTS) {
      const key = `${s.name.trim().toLowerCase()}_${s.className.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        const tier = resolveMatchingTier(s.className, tiers);
        const tuition = tier?.tuitionFee ?? 18500;
        list.push({
          name: s.name.trim(),
          rollNo: s.rollNo ? s.rollNo.replace(/^Roll\s*#?/i, "").trim() : "10",
          className: s.className,
          campus: s.campus,
          tuitionFee: tuition,
        });
      }
    }
    return list;
  }, []);

  // Standard class base tuition fee
  const selectedClassTuition = React.useMemo(() => {
    const tiers = readFeeConfiguration();
    const tier = resolveMatchingTier(className, tiers);
    return tier?.tuitionFee ?? 18500;
  }, [className]);

  const editClassTuition = React.useMemo(() => {
    const tiers = readFeeConfiguration();
    const tier = resolveMatchingTier(editClassName, tiers);
    return tier?.tuitionFee ?? 18500;
  }, [editClassName]);

  // Dynamic handlers for Student Name, Roll No, Concession %, and Monthly Value
  const handleStudentChange = (val: string) => {
    setStudent(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return;
    const match = candidateStudents.find(
      (c) => c.name.toLowerCase() === trimmed || c.name.toLowerCase().startsWith(trimmed)
    );
    if (match) {
      setRollNo(match.rollNo);
      setClassName(match.className);
      setCampus(match.campus);
      const pct = Number(concessionPercent) || 20;
      setMonthlyValue(String(Math.round((match.tuitionFee * pct) / 100)));
    }
  };

  const handleRollNoChange = (val: string) => {
    setRollNo(val);
    const clean = val.replace(/\D/g, "");
    if (!clean) return;
    const match = candidateStudents.find((c) => c.rollNo.replace(/\D/g, "") === clean);
    if (match) {
      setStudent(match.name);
      setClassName(match.className);
      setCampus(match.campus);
      const pct = Number(concessionPercent) || 20;
      setMonthlyValue(String(Math.round((match.tuitionFee * pct) / 100)));
    }
  };

  const handleClassChange = (newClass: string) => {
    setClassName(newClass);
    const tiers = readFeeConfiguration();
    const tier = resolveMatchingTier(newClass, tiers);
    const tuition = tier?.tuitionFee ?? 18500;
    const pct = Number(concessionPercent) || 20;
    setMonthlyValue(String(Math.round((tuition * pct) / 100)));
  };

  const handleConcessionPercentChange = (val: string) => {
    setConcessionPercent(val);
    const pct = Math.max(0, Math.min(100, Number(val) || 0));
    setMonthlyValue(String(Math.round((selectedClassTuition * pct) / 100)));
  };

  const handleMonthlyValueChange = (val: string) => {
    setMonthlyValue(val);
    const amt = Math.max(0, Number(val) || 0);
    if (selectedClassTuition > 0) {
      const derivedPct = Math.min(100, Math.round((amt / selectedClassTuition) * 100));
      setConcessionPercent(String(derivedPct));
    }
  };

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
      concessionPercent: Number(concessionPercent) || 20,
      monthlyValue: Number(monthlyValue) || Math.round((selectedClassTuition * 20) / 100),
      awardedDate: new Date().toISOString().slice(0, 10),
      validUntil: "2027-06-30",
      status: "Active",
      authority: authority.trim() || "Academic Board",
    };

    const updated = [newAward, ...records];
    setRecords(updated);
    writeFeeScholarships(updated);

    // Synchronize award directly with the Fee Collection voucher!
    syncScholarshipWithFeeChallan(newAward, "award");

    setDialogOpen(false);
    setStudent("");
    setRollNo("");
    setConcessionPercent("20");
    setMonthlyValue("3700");
    toast.success(
      `Scholarship ${nextNo} (${newAward.concessionPercent}% Off) awarded to ${newAward.student} and automatically added to Fee Voucher.`
    );
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

    const updatedList = records.map((item) => (item.id === editingAward.id ? updated : item));
    setRecords(updatedList);
    writeFeeScholarships(updatedList);

    // Sync updated award directly to Fee Collection vouchers!
    syncScholarshipWithFeeChallan(updated, "update");

    if (selectedAward && selectedAward.id === editingAward.id) {
      setSelectedAward(updated);
    }

    setEditDialogOpen(false);
    toast.success(`Scholarship award ${editingAward.awardNo} updated and synchronized with Fee Collection voucher.`);
  };

  const columns: Column<FeeScholarshipAward>[] = [
    {
      key: "awardNo",
      header: "Award #",
      align: "center",
      cell: (r) => (
        <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-1 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
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
        <span className="text-[13px] font-semibold text-foreground">
          {r.student}
        </span>
      ),
    },
    {
      key: "className",
      header: "Class",
      align: "center",
      cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.className}</span>,
      className: "w-[10%] text-center",
      headerClassName: "w-[10%] text-center",
    },
    {
      key: "scholarshipName",
      header: "Scheme / Program",
      align: "center",
      cell: (r) => (
        <span className="text-xs font-semibold text-foreground truncate">{r.scholarshipName}</span>
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
          <span className="inline-flex items-center justify-center rounded-md bg-brand/10 px-2.5 py-1 text-center font-mono text-xs font-bold leading-tight text-brand">
            {r.concessionPercent}% Off
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
            className="border-blue-200 bg-blue-50/70 text-blue-700 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-800 shadow-2xs"
            title="View scholarship award details"
            onClick={() => {
              setSelectedAward(r);
              setViewDialogOpen(true);
            }}
          >
            <Eye className="size-3.5 text-blue-600" />
            <span>View</span>
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            className="border-amber-200 bg-amber-50/70 text-amber-700 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800 shadow-2xs"
            title="Edit scholarship award"
            onClick={() => handleOpenEdit(r)}
          >
            <Pencil className="size-3.5 text-amber-600" />
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
            hideSortArrows
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
                    <DialogTitle>Scholarship Award Details</DialogTitle>
                    <DialogDescription className="sr-only">
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
            <DialogTitle>Edit Scholarship Award</DialogTitle>
            <DialogDescription className="sr-only">
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
                  min={1}
                  max={100}
                  required
                  placeholder="e.g. 20"
                  value={editConcessionPercent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditConcessionPercent(val);
                    const pct = Number(val) || 0;
                    setEditMonthlyValue(String(Math.round((editClassTuition * pct) / 100)));
                  }}
                  className={fieldClass}
                />
              </Field>
              <Field label="Monthly Value (Rs)">
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="e.g. 3700"
                  value={editMonthlyValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditMonthlyValue(val);
                    const amt = Number(val) || 0;
                    if (editClassTuition > 0) {
                      setEditConcessionPercent(String(Math.min(100, Math.round((amt / editClassTuition) * 100))));
                    }
                  }}
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
            <DialogTitle>Award Scholarship / Concession</DialogTitle>
            <DialogDescription className="sr-only">
              Grant fee concession or merit tuition waiver to an eligible enrolled student.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 py-1">
            {/* Datalists for real-time enrolled student auto-complete */}
            <datalist id="scholarship-student-candidates">
              {candidateStudents.map((c) => (
                <option key={`${c.name}-${c.rollNo}`} value={c.name}>
                  Roll #{c.rollNo} · {c.className} · {c.campus}
                </option>
              ))}
            </datalist>
            <datalist id="scholarship-rollno-candidates">
              {candidateStudents.map((c) => (
                <option key={`roll-${c.rollNo}-${c.name}`} value={c.rollNo}>
                  {c.name} ({c.className} · {c.campus})
                </option>
              ))}
            </datalist>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Student Name *">
                <input
                  type="text"
                  required
                  list="scholarship-student-candidates"
                  placeholder="e.g. Zain Ahmed or Hamza Khan"
                  value={student}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  type="text"
                  list="scholarship-rollno-candidates"
                  placeholder="e.g. 10 or Roll #12"
                  value={rollNo}
                  onChange={(e) => handleRollNoChange(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Class">
                <select
                  value={className}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className={fieldClass}
                >
                  <option>Grade 6-A</option>
                  <option>Grade 7-B</option>
                  <option>Grade 8-C</option>
                  <option>Grade 9-A</option>
                  <option>Grade 10-A</option>
                  <option>Grade 10-B</option>
                  <option>Grade 11-A</option>
                  <option>Grade 12-A</option>
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
                  min={1}
                  max={100}
                  required
                  placeholder="e.g. 20"
                  value={concessionPercent}
                  onChange={(e) => handleConcessionPercentChange(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Monthly Value (Rs)">
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="e.g. 3700"
                  value={monthlyValue}
                  onChange={(e) => handleMonthlyValueChange(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            {/* Live Subsidy & Fee Collection Voucher Sync Preview Card */}
            <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand-50/70 via-background to-brand-50/30 p-3.5 text-xs space-y-2 dark:border-brand/30 dark:from-brand-950/20">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-brand" />
                  Base Class Tuition Fee ({className})
                </span>
                <span className="font-mono text-foreground font-bold">
                  {formatCurrency(selectedClassTuition)} / month
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Percent className="size-3.5" />
                  Concession Deduction ({concessionPercent || 0}% Off)
                </span>
                <span className="font-mono font-bold">
                  −{formatCurrency(Number(monthlyValue) || 0)} / month
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-brand/15 pt-2 font-bold">
                <span className="text-foreground">Net Tuition Payable by Student</span>
                <span className="font-mono text-brand text-sm sm:text-base">
                  {formatCurrency(
                    Math.max(0, selectedClassTuition - (Number(monthlyValue) || 0))
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                <Check className="size-3 text-emerald-600 shrink-0" />
                <span>
                  Automatically links & deducts discount in the Fee Collection voucher
                </span>
              </div>
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
                Grant Award & Apply to Voucher
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
