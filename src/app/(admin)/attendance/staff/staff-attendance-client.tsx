"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCheck,
  Clock,
  Copy,
  Download,
  Eye,
  Fingerprint,
  Mail,
  Percent,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserX,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef, ALL } from "@/components/shared/data-table";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import {
  AttendanceActionButton,
  AttendanceDatePicker,
  RowSegmented,
  type RowSegmentedOption,
} from "../_components/attendance-ui";
import { shortCampus } from "../_components/attendance-utils";
import {
  CAMPUS_ATTENDANCE_MATRIX,
  STAFF_ATTENDANCE_RECORDS,
  STAFF_TODAY,
  type StaffAttendanceRecord,
  type DailyStaffStatus,
} from "@/lib/mock/attendance";
import { CAMPUSES } from "@/lib/mock/institution";
import { formatNumber, formatPercent } from "@/lib/format";

const OVERRIDE_OPTIONS: RowSegmentedOption<DailyStaffStatus>[] = [
  {
    value: "Present",
    code: "P",
    label: "Mark Present",
    activeClassName: "bg-success",
    inactiveHoverClassName: "hover:bg-success-soft/45 hover:text-success hover:ring-success/35",
  },
  {
    value: "Late",
    code: "L",
    label: "Mark Late",
    activeClassName: "bg-warning",
    inactiveHoverClassName: "hover:bg-warning-soft/45 hover:text-warning hover:ring-warning/35",
  },
  {
    value: "Half Day",
    code: "HD",
    label: "Mark Half Day",
    activeClassName: "bg-brand",
    inactiveHoverClassName: "hover:bg-brand-50/75 hover:text-brand hover:ring-brand/35",
  },
  {
    value: "On Leave",
    code: "LV",
    label: "Mark On Leave",
    activeClassName: "bg-info",
    inactiveHoverClassName: "hover:bg-info-soft/45 hover:text-info hover:ring-info/35",
  },
  {
    value: "Absent",
    code: "A",
    label: "Mark Absent",
    activeClassName: "bg-danger",
    inactiveHoverClassName: "hover:bg-danger-soft/45 hover:text-danger hover:ring-danger/35",
  },
];

// ── Static filter option lists ─────────────────────────────────────────────
const CAMPUS_FILTER_OPTIONS = [
  ...new Set([
    ...CAMPUSES.map((c) => c.campusName),
    ...STAFF_ATTENDANCE_RECORDS.map((s) => s.campus),
  ]),
];
const DEPT_OPTIONS = [...new Set(STAFF_ATTENDANCE_RECORDS.map((s) => s.department))];

// ── Exact Campus Staff Breakdown (sums precisely to 479 total, 464 on duty) ──
const CAMPUS_STAFF_BREAKDOWN: Record<string, StaffKPIs> = {
  "Main Campus — Gulberg": {
    total: 146,
    onDuty: 143,
    late: 4,
    leaveAbsent: 3,
    rate: 97.9,
  },
  "DHA Phase 5 Campus": {
    total: 112,
    onDuty: 109,
    late: 3,
    leaveAbsent: 3,
    rate: 97.3,
  },
  "F-8 Islamabad Campus": {
    total: 94,
    onDuty: 91,
    late: 3,
    leaveAbsent: 3,
    rate: 96.8,
  },
  "Clifton Karachi Campus": {
    total: 86,
    onDuty: 82,
    late: 2,
    leaveAbsent: 4,
    rate: 95.3,
  },
  "Bahria Town Campus": {
    total: 41,
    onDuty: 39,
    late: 1,
    leaveAbsent: 2,
    rate: 95.1,
  },
};

// ── Per-campus KPI derivation ───────────────────────────────────────────────
interface StaffKPIs {
  total: number;
  onDuty: number;
  late: number;
  leaveAbsent: number;
  rate: number;
}

function deriveStaffKPIs(campusValue: string): StaffKPIs {
  if (!campusValue || campusValue === ALL || campusValue === "all") {
    const onDuty = STAFF_TODAY.present + STAFF_TODAY.late;
    return {
      total: STAFF_TODAY.total,
      onDuty,
      late: STAFF_TODAY.late,
      leaveAbsent: STAFF_TODAY.onLeave + STAFF_TODAY.absent,
      rate: STAFF_TODAY.rate,
    };
  }

  for (const [campusName, data] of Object.entries(CAMPUS_STAFF_BREAKDOWN)) {
    if (
      campusName.toLowerCase() === campusValue.toLowerCase() ||
      campusName.toLowerCase().includes(campusValue.toLowerCase()) ||
      campusValue.toLowerCase().includes(campusName.toLowerCase())
    ) {
      return data;
    }
  }

  const row = CAMPUS_ATTENDANCE_MATRIX.find(
    (r) =>
      r.campus.toLowerCase() === campusValue.toLowerCase() ||
      r.campus.toLowerCase().includes(campusValue.toLowerCase()) ||
      campusValue.toLowerCase().includes(r.campus.toLowerCase())
  );

  if (row) {
    const total = row.staffTotal;
    const onDuty = row.staffPresent;
    const leaveAbsent = Math.max(0, total - onDuty);
    const late = Math.max(1, Math.round(onDuty * 0.028));
    return {
      total,
      onDuty,
      late,
      leaveAbsent,
      rate: row.staffRate,
    };
  }

  const onDuty = STAFF_TODAY.present + STAFF_TODAY.late;
  return {
    total: STAFF_TODAY.total,
    onDuty,
    late: STAFF_TODAY.late,
    leaveAbsent: STAFF_TODAY.onLeave + STAFF_TODAY.absent,
    rate: STAFF_TODAY.rate,
  };
}

// ── Animated KPI value ──────────────────────────────────────────────────────
function KpiValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both">
      {children}
    </span>
  );
}

export function StaffAttendanceClient() {
  const [selectedCampus, setSelectedCampus] = React.useState<string>(ALL);
  const [records, setRecords] = React.useState<StaffAttendanceRecord[]>(
    STAFF_ATTENDANCE_RECORDS
  );
  const [selectedDate, setSelectedDate] = React.useState("2026-10-12");

  // Derive KPI metrics for the selected campus
  const kpis = React.useMemo(() => deriveStaffKPIs(selectedCampus), [selectedCampus]);

  // Dynamic filters with controlled campus
  const filters = React.useMemo<FilterDef<StaffAttendanceRecord>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campus",
        options: CAMPUS_FILTER_OPTIONS,
        getValue: (r) => r.campus,
        value: selectedCampus,
        onChange: (val) => setSelectedCampus(val),
        className: "w-[140px]",
      },
      {
        key: "department",
        label: "Department",
        allLabel: "All Departments",
        options: DEPT_OPTIONS,
        getValue: (r) => r.department,
        className: "w-[145px]",
      },
      {
        key: "type",
        label: "Category",
        allLabel: "All Categories",
        options: ["Teaching", "Non-Teaching"],
        getValue: (r) => r.type,
        className: "w-[135px]",
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Status",
        options: ["Present", "Late", "Half Day", "On Leave", "Absent"],
        getValue: (r) => r.statusToday,
        className: "w-[135px]",
      },
    ],
    [selectedCampus]
  );
  const [viewingStaff, setViewingStaff] =
    React.useState<StaffAttendanceRecord | null>(null);

  const activeViewingStaff = React.useMemo(() => {
    if (!viewingStaff) return null;
    return records.find((r) => r.id === viewingStaff.id) ?? viewingStaff;
  }, [viewingStaff, records]);

  const tally = React.useMemo(() => {
    const count = (s: DailyStaffStatus) =>
      records.filter((r) => r.statusToday === s).length;
    return {
      total: records.length,
      present: count("Present"),
      late: count("Late"),
      halfDay: count("Half Day"),
      onLeave: count("On Leave"),
      absent: count("Absent"),
    };
  }, [records]);

  const applyStaffStatus = React.useCallback(
    (ids: Set<string>, status: DailyStaffStatus) => {
      const off = status === "Absent" || status === "On Leave";
      setRecords((prev) =>
        prev.map((r) =>
          !ids.has(r.id)
            ? r
            : {
                ...r,
                statusToday: status,
                checkIn: off
                  ? "—"
                  : status === "Late"
                    ? "08:19 AM"
                    : "07:41 AM",
                checkOut: off
                  ? "—"
                  : status === "Half Day"
                    ? "11:30 AM"
                    : "02:35 PM",
                lateMinutes: status === "Late" ? 19 : 0,
                workingHours: off
                  ? "0h 00m"
                  : status === "Half Day"
                    ? "3h 49m"
                    : "6h 54m",
              }
        )
      );
    },
    []
  );

  const handleOverride = React.useCallback(
    (record: StaffAttendanceRecord, status: DailyStaffStatus) => {
      applyStaffStatus(new Set([record.id]), status);
      toast.success(`${record.name} marked ${status}`);
    },
    [applyStaffStatus]
  );

  const columns = React.useMemo<Column<StaffAttendanceRecord>[]>(
    () => [
      {
        key: "employee",
        header: "Employee",
        headerAlign: "center",
        align: "center",
        className: "w-[24%] text-center",
        headerClassName: "w-[24%] text-center",
        cell: (r) => (
          <span className="text-[13px] font-semibold text-foreground">
            {r.name}
          </span>
        ),
      },
      {
        key: "verification",
        header: "Terminal",
        align: "center",
        className: "w-[20%] whitespace-nowrap text-center",
        headerClassName: "w-[20%] text-center",
        cell: (r) => (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Fingerprint className="size-3.5 text-brand" />
            {r.verificationMethod}
          </span>
        ),
      },
      {
        key: "punctuality",
        header: "Punctuality",
        align: "center",
        className: "w-[18%] text-center",
        headerClassName: "w-[18%] text-center",
        cell: (r) => (
          <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
            {r.monthlyPunctuality}%
          </span>
        ),
      },
      {
        key: "override",
        header: "Override",
        align: "center",
        className: "w-[22%] whitespace-nowrap",
        headerClassName: "w-[22%]",
        cell: (r) => (
          <div className="flex justify-center">
            <RowSegmented
              size="sm"
              options={OVERRIDE_OPTIONS}
              value={r.statusToday}
              onChange={(next) => handleOverride(r, next)}
            />
          </div>
        ),
      },
      {
        key: "view",
        header: "View",
        align: "center",
        className: "w-[16%] whitespace-nowrap",
        headerClassName: "w-[16%]",
        cell: (r) => (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setViewingStaff(r)}
              title={`View ${r.name}'s attendance record, contact details (${r.email || "staff@edusphere.edu.pk"}) & department`}
              aria-label={`View ${r.name}'s attendance record & contact details`}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-blue-200 bg-blue-50/70 px-2.5 text-xs font-semibold text-blue-700 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-all duration-150 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-800 active:translate-y-px cursor-pointer"
            >
              <Eye className="size-3.5 text-blue-600" />
              <span>View</span>
            </button>
          </div>
        ),
      },
    ],
    [handleOverride]
  );


  return (
    <>
      <PageHeader
        title="Staff Attendance"
        actions={
          <>
            <AttendanceActionButton
              tone="outline"
              onClick={() =>
                toast.success("Synced 18 biometric and RFID terminals.")
              }
            >
              <RefreshCw />
              Sync Terminals
            </AttendanceActionButton>
            <AttendanceActionButton
              tone="outline"
              onClick={() =>
                toast.success(
                  "Staff attendance log exported for October payroll."
                )
              }
            >
              <Download />
              Export Payroll Log
            </AttendanceActionButton>
          </>
        }
      />

      {/* ── Staff Attendance KPIs — reactive to campus dropdown ─────── */}
      <div className="mb-6">
        <StatGrid className="max-w-none sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Staff"
            value={
              <KpiValue key={`total-${selectedCampus}`}>
                {formatNumber(kpis.total)}
              </KpiValue>
            }
            icon={Users}
          />
          <StatCard
            label="Staff On Duty"
            value={
              <KpiValue key={`duty-${selectedCampus}`}>
                {formatNumber(kpis.onDuty)}
              </KpiValue>
            }
            icon={UserCheck}
          />
          <StatCard
            label="Late Check-Ins"
            value={
              <KpiValue key={`late-${selectedCampus}`}>
                {formatNumber(kpis.late)}
              </KpiValue>
            }
            icon={Clock}
          />
          <StatCard
            label="On Leave / Absent"
            value={
              <KpiValue key={`leave-${selectedCampus}`}>
                {formatNumber(kpis.leaveAbsent)}
              </KpiValue>
            }
            icon={UserMinus}
          />
          <StatCard
            label="Attendance Percentage"
            value={
              <KpiValue key={`rate-${selectedCampus}`}>
                {formatPercent(kpis.rate)}
              </KpiValue>
            }
            icon={Percent}
          />
        </StatGrid>
      </div>

      {/* Attendance Details Section Header & Actions Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-base font-bold tracking-tight text-foreground md:text-lg">
          Attendance Details
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <AttendanceDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
          />
          <AttendanceActionButton
            tone="success"
            onClick={() => {
              applyStaffStatus(new Set(records.map((r) => r.id)), "Present");
              toast.success("All staff in current log marked Present");
            }}
          >
            <CheckCheck />
            Mark All Present
          </AttendanceActionButton>
          <AttendanceActionButton
            tone="danger"
            onClick={() => {
              applyStaffStatus(new Set(records.map((r) => r.id)), "Absent");
              toast.error("All staff in current log marked Absent");
            }}
          >
            <UserX />
            Mark All Absent
          </AttendanceActionButton>
          <AttendanceActionButton
            tone="primary"
            onClick={() =>
              toast.success(`Staff attendance register for ${selectedDate} saved.`)
            }
          >
            <Save />
            Save Register
          </AttendanceActionButton>
        </div>
      </div>

      <SectionCard flush contentClassName="pt-5">
        <DataTable
          data={records}
          columns={columns}
          getRowId={(r) => r.id}
          searchPlaceholder="Search employee by name, ID, email, phone..."
          searchFn={(r, q) =>
            r.name.toLowerCase().includes(q) ||
            r.empCode.toLowerCase().includes(q) ||
            r.designation.toLowerCase().includes(q) ||
            r.department.toLowerCase().includes(q) ||
            Boolean(r.email?.toLowerCase().includes(q)) ||
            Boolean(r.phone?.toLowerCase().includes(q))
          }
          filters={filters}
          pageSize={10}
        />
      </SectionCard>

      {/* Staff Attendance Details Modal */}
      <Dialog
        open={Boolean(viewingStaff)}
        onOpenChange={(open) => {
          if (!open) setViewingStaff(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border border-border shadow-xl rounded-xl bg-white max-h-[calc(100vh-3.5rem)] flex flex-col">
          {activeViewingStaff && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header Banner */}
              <div className="shrink-0 border-b border-border bg-white p-5 text-foreground">
                <DialogHeader className="gap-1 text-left">
                  <div className="flex items-start justify-between gap-3 pr-6">
                    <div className="flex items-center gap-3.5">
                      <UserAvatar
                        name={activeViewingStaff.name}
                        size="lg"
                          className="ring-1 ring-border"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <DialogTitle className="font-heading text-base font-semibold text-foreground tracking-[-0.01em]">
                            {activeViewingStaff.name}
                          </DialogTitle>
                          <Badge
                            variant="secondary"
                            className="bg-muted text-[10px] font-medium text-muted-foreground ring-1 ring-border"
                          >
                            {activeViewingStaff.type}
                          </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                          ID: {activeViewingStaff.empCode} &bull; {activeViewingStaff.designation}
                        </DialogDescription>
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <StatusBadge status={activeViewingStaff.statusToday} />
                    </div>
                  </div>

                  {/* Quick Contact Bar in Header */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-border text-xs text-muted-foreground">
                    <a
                      href={`mailto:${activeViewingStaff.email}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 hover:bg-muted px-2.5 py-1 text-xs text-foreground transition-colors"
                      title="Send official email"
                    >
                      <Mail className="size-3 text-muted-foreground" />
                      <span className="font-mono text-[11px]">{activeViewingStaff.email}</span>
                    </a>
                    <a
                      href={`tel:${activeViewingStaff.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 hover:bg-muted px-2.5 py-1 text-xs text-foreground transition-colors"
                      title="Call staff phone"
                    >
                      <Phone className="size-3 text-muted-foreground" />
                      <span className="font-mono text-[11px]">{activeViewingStaff.phone}</span>
                    </a>
                  </div>
                </DialogHeader>
              </div>

              {/* Scrollable Body Details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/20">
                {/* Official Staff Contact & Communication Directory */}
                <div className="rounded-lg border border-border bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e] flex items-center gap-1.5">
                      <Mail className="size-3.5 text-brand" />
                      Official Staff Contact &amp; Directory Details
                    </p>
                    <span className="inline-flex items-center gap-1 rounded bg-brand-50 border border-brand/20 px-2 py-0.5 font-mono text-[10px] font-bold text-brand uppercase">
                      <ShieldCheck className="size-3 text-brand" />
                      Verified Profile
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Email Card */}
                    <div className="rounded-lg border border-border/80 bg-slate-50/70 p-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                          <Mail className="size-3 text-brand" />
                          Official Institutional Email
                        </span>
                        <a
                          href={`mailto:${activeViewingStaff.email}`}
                          className="font-mono font-semibold text-brand text-xs hover:underline block truncate"
                          title={`Send email to ${activeViewingStaff.email}`}
                        >
                          {activeViewingStaff.email}
                        </a>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Domain: @edusphere.edu.pk</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeViewingStaff.email);
                            toast.success(`Copied ${activeViewingStaff.email} to clipboard`);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand/80 cursor-pointer"
                        >
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Phone Card */}
                    <div className="rounded-lg border border-border/80 bg-slate-50/70 p-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                          <Phone className="size-3 text-brand" />
                          Primary Contact Number
                        </span>
                        <a
                          href={`tel:${activeViewingStaff.phone}`}
                          className="font-mono font-semibold text-foreground text-xs hover:text-brand hover:underline block"
                          title={`Call ${activeViewingStaff.phone}`}
                        >
                          {activeViewingStaff.phone}
                        </a>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Direct Mobile Active
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeViewingStaff.phone);
                            toast.success(`Copied ${activeViewingStaff.phone} to clipboard`);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand/80 cursor-pointer"
                        >
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department, Wing & Teaching Subject Card */}
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                    <Building2 className="size-3.5 text-brand" />
                    Department, Wing &amp; Teaching Subject
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {activeViewingStaff.department}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Campus / Wing:</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {activeViewingStaff.campus}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teacher Role / Subject:</span>
                      <p className="text-sm font-bold text-brand mt-0.5">
                        {activeViewingStaff.designation}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Staff Category:</span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {activeViewingStaff.type}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attendance Status & Check-In / Check-Out Log */}
                <div className="rounded-lg border border-border bg-white p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-brand" />
                      Check-In &amp; Check-Out Time Log
                    </p>
                    <StatusBadge status={activeViewingStaff.statusToday} />
                  </div>

                  {/* High-visibility Check-In / Check-Out / Working Hours block */}
                  <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-muted/30 p-3 text-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Check-In
                      </span>
                      <p className="text-[15px] font-bold tabular-nums text-foreground mt-0.5">
                        {activeViewingStaff.checkIn}
                      </p>
                    </div>
                    <div className="border-x border-[#dbe4f0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Check-Out
                      </span>
                      <p className="text-[15px] font-bold tabular-nums text-foreground mt-0.5">
                        {activeViewingStaff.checkOut}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Working Hours
                      </span>
                      <p className="text-[15px] font-bold tabular-nums text-foreground mt-0.5">
                        {activeViewingStaff.workingHours}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs px-1 text-muted-foreground">
                    <span>
                      Shift: <strong className="text-foreground font-semibold">{activeViewingStaff.shift}</strong>
                    </span>
                    {activeViewingStaff.lateMinutes > 0 ? (
                      <span className="font-semibold text-warning bg-warning-soft/70 px-2 py-0.5 rounded-[3px] border border-warning/25 text-[11px]">
                        +{activeViewingStaff.lateMinutes}m Late Arrival
                      </span>
                    ) : (
                      <span className="font-semibold text-success bg-success-soft/70 px-2 py-0.5 rounded-[3px] border border-success/25 text-[11px]">
                        On-Time Schedule
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification & Punctuality */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-white p-3">
                    <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Fingerprint className="size-3 text-brand" />
                      Verification Terminal
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {activeViewingStaff.verificationMethod}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-white p-3">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Percent className="size-3 text-brand" />
                        Monthly Reliability
                      </span>
                      <span className="font-bold tabular-nums text-brand">
                        {activeViewingStaff.monthlyPunctuality}%
                      </span>
                    </div>
                    <Meter
                      value={activeViewingStaff.monthlyPunctuality}
                      size="xs"
                      tone="dark-blue"
                      className="h-1"
                    />
                  </div>
                </div>

                {/* Quick Status Override in Modal */}
                <div className="rounded-lg border border-border bg-white p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
                    Quick Override Status
                  </p>
                  <div className="flex justify-center">
                    <RowSegmented
                      size="sm"
                      options={OVERRIDE_OPTIONS}
                      value={activeViewingStaff.statusToday}
                      onChange={(next) => handleOverride(activeViewingStaff, next)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="shrink-0 border-t border-border bg-white px-5 py-3 flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
                  <span>ID: {activeViewingStaff.empCode}</span>
                  <span>&bull;</span>
                  <span>{activeViewingStaff.phone}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingStaff(null)}
                  className="h-8 rounded-[4px] px-4 text-xs font-semibold cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
