"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  Download,
  Eye,
  GraduationCap,
  KeyRound,
  Landmark,
  Lock,
  Plus,
  Printer,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_STUDENT_ACCOUNTS,
  type StaffAccountRecord,
  type StaffPortalRole,
  type StudentAccountRecord,
} from "@/lib/mock/accounts";
import {
  exportParentAccountsPdf,
  exportStaffAccountsPdf,
  exportStudentAccountsPdf,
  printParentAccountsRegister,
  printStaffAccountsRegister,
  printStudentAccountsRegister,
} from "./accounts-export";
import { StudentAccountModal } from "./student-account-modal";
import { StaffAccountModal } from "./staff-account-modal";
import {
  StaffAccountFormModal,
  StudentAccountFormModal,
} from "./account-form-modals";

type AccountsTab = "students" | "parents" | "staff";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

function sortClasses(values: string[]): string[] {
  return [...values].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

export function AccountsClient() {
  const [activeTab, setActiveTab] = React.useState<AccountsTab>("students");
  const [studentAccounts, setStudentAccounts] = React.useState<
    StudentAccountRecord[]
  >(INITIAL_STUDENT_ACCOUNTS);
  const [staffAccounts, setStaffAccounts] = React.useState<
    StaffAccountRecord[]
  >(INITIAL_STAFF_ACCOUNTS);

  // Student / Parent modal state
  const [selectedStudentId, setSelectedStudentId] = React.useState<
    string | null
  >(null);
  const [studentModalOpen, setStudentModalOpen] = React.useState(false);
  const [studentModalTab, setStudentModalTab] = React.useState<
    "overview" | "logs" | "reset"
  >("overview");
  const [studentModalMode, setStudentModalMode] = React.useState<
    "student" | "parent"
  >("student");
  const [studentFormOpen, setStudentFormOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] =
    React.useState<StudentAccountRecord | null>(null);

  // Staff modal state
  const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(
    null
  );
  const [staffModalOpen, setStaffModalOpen] = React.useState(false);
  const [staffFormOpen, setStaffFormOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] =
    React.useState<StaffAccountRecord | null>(null);

  const selectedStudent = React.useMemo(
    () => studentAccounts.find((a) => a.id === selectedStudentId) ?? null,
    [studentAccounts, selectedStudentId]
  );
  const selectedStaff = React.useMemo(
    () => staffAccounts.find((a) => a.id === selectedStaffId) ?? null,
    [staffAccounts, selectedStaffId]
  );

  /* ───────────────────────── KPI aggregates ───────────────────────── */

  const studentKpis = React.useMemo(() => {
    const total = studentAccounts.length;
    const active = studentAccounts.filter(
      (a) => a.studentPortalStatus === "Active"
    ).length;
    const pending = studentAccounts.filter(
      (a) => a.studentPortalStatus === "Pending"
    ).length;
    const suspended = studentAccounts.filter(
      (a) => a.studentPortalStatus === "Suspended"
    ).length;
    return {
      total,
      active,
      pendingOrSuspended: pending + suspended,
    };
  }, [studentAccounts]);

  const parentKpis = React.useMemo(() => {
    const total = studentAccounts.length;
    const active = studentAccounts.filter(
      (a) => a.parentPortalStatus === "Active"
    ).length;
    const pending = studentAccounts.filter(
      (a) => a.parentPortalStatus === "Pending"
    ).length;
    const suspended = studentAccounts.filter(
      (a) => a.parentPortalStatus === "Suspended"
    ).length;
    return {
      total,
      active,
      pendingOrSuspended: pending + suspended,
    };
  }, [studentAccounts]);

  const staffKpis = React.useMemo(() => {
    const total = staffAccounts.length;
    const active = staffAccounts.filter(
      (a) => a.credentialStatus === "Active"
    ).length;
    const teaching = staffAccounts.filter(
      (a) => a.category === "Teaching"
    ).length;
    const nonTeaching = staffAccounts.filter(
      (a) => a.category === "Non-Teaching"
    ).length;
    const pendingOrSuspended = staffAccounts.filter(
      (a) => a.credentialStatus !== "Active"
    ).length;
    return { total, active, teaching, nonTeaching, pendingOrSuspended };
  }, [staffAccounts]);

  /* ───────────────────────── Student & Parent handlers ───────────────────────── */

  const openStudent = React.useCallback(
    (
      acc: StudentAccountRecord,
      tab: "overview" | "logs" | "reset" = "overview",
      mode: "student" | "parent" = "student"
    ) => {
      setSelectedStudentId(acc.id);
      setStudentModalTab(tab);
      setStudentModalMode(mode);
      setStudentModalOpen(true);
    },
    []
  );

  const handleUpdateStudentCredentials = React.useCallback(
    (
      accountId: string,
      payload: {
        studentEmail: string;
        studentPassword: string;
        parentEmail: string;
        parentPassword: string;
        credentialStatus: StudentAccountRecord["credentialStatus"];
        assignedByAdmin: string;
      }
    ) => {
      const today = new Date().toISOString().slice(0, 10);
      let studentName = "";

      setStudentAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc;
          studentName = acc.studentName;
          return {
            ...acc,
            studentEmail: payload.studentEmail,
            studentPassword: payload.studentPassword,
            studentPortalStatus: payload.credentialStatus,
            parentEmail: payload.parentEmail,
            parentPassword: payload.parentPassword,
            parentPortalStatus: payload.credentialStatus,
            credentialStatus: payload.credentialStatus,
            assignedByAdmin: payload.assignedByAdmin,
            lastPasswordReset: today,
            accessLogs: [
              {
                id: `${acc.id}-log-${Date.now()}`,
                timestamp: `${today} 10:30 AM`,
                actor: "Student Admin",
                event:
                  "Student & Parent portal emails and passwords updated by Admin",
                ipAddress: "192.168.10.14",
                device: "Admin Console",
                status: "Reset",
              },
              ...acc.accessLogs,
            ],
          };
        })
      );

      toast.success(`Portal login credentials updated for ${studentName}.`);
    },
    []
  );

  const handleSaveStudent = React.useCallback(
    (record: StudentAccountRecord) => {
      setStudentAccounts((prev) => {
        const exists = prev.some((a) => a.id === record.id);
        return exists
          ? prev.map((a) => (a.id === record.id ? record : a))
          : [record, ...prev];
      });
    },
    []
  );

  /* ───────────────────────── Staff handlers ───────────────────────── */

  const openStaff = React.useCallback((acc: StaffAccountRecord) => {
    setSelectedStaffId(acc.id);
    setStaffModalOpen(true);
  }, []);

  const handleUpdateStaffCredentials = React.useCallback(
    (
      accountId: string,
      payload: {
        staffEmail: string;
        staffPassword: string;
        portalRole: StaffPortalRole;
        credentialStatus: StaffAccountRecord["credentialStatus"];
        assignedByAdmin: string;
        twoFactorEnabled: boolean;
      }
    ) => {
      const today = new Date().toISOString().slice(0, 10);
      let staffName = "";

      setStaffAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc;
          staffName = acc.name;
          return {
            ...acc,
            staffEmail: payload.staffEmail,
            staffPassword: payload.staffPassword,
            portalRole: payload.portalRole,
            credentialStatus: payload.credentialStatus,
            assignedByAdmin: payload.assignedByAdmin,
            twoFactorEnabled: payload.twoFactorEnabled,
            lastPasswordReset: today,
            accessLogs: [
              {
                id: `${acc.id}-log-${Date.now()}`,
                timestamp: `${today} 11:00 AM`,
                actor: "Staff Admin",
                event: `Staff portal email & password updated (${payload.portalRole})`,
                ipAddress: "192.168.1.25",
                device: "HR & Staff Admin Console",
                status: "Reset",
              },
              ...acc.accessLogs,
            ],
          };
        })
      );

      toast.success(`Staff login credentials updated for ${staffName}.`);
    },
    []
  );

  const handleSaveStaff = React.useCallback((record: StaffAccountRecord) => {
    setStaffAccounts((prev) => {
      const exists = prev.some((a) => a.id === record.id);
      return exists
        ? prev.map((a) => (a.id === record.id ? record : a))
        : [record, ...prev];
    });
  }, []);

  /* ───────────────────────── 1. Student Accounts Table ───────────────────────── */

  const studentOnlyColumns = React.useMemo<Column<StudentAccountRecord>[]>(
    () => [
      {
        key: "accountNo",
        header: "Account #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center whitespace-nowrap rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.accountNo}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground whitespace-nowrap">
              Roll #{r.rollNo}
            </p>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        align: "center",
        cell: (r) => (
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {r.studentName}
          </span>
        ),
      },
      {
        key: "className",
        header: "Class",
        align: "center",
        cell: (r) => (
          <span className="inline-flex items-center whitespace-nowrap rounded-md border border-border/80 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {r.className}-{r.section}
          </span>
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {r.campus}
          </span>
        ),
      },
      {
        key: "assignedBy",
        header: "Assigned By",
        align: "center",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {r.assignedByAdmin}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.studentPortalStatus} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View assigned student email, password, and login history"
              onClick={() => openStudent(r, "overview", "student")}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [openStudent]
  );

  /* ───────────────────────── 2. Parent Accounts Table ───────────────────────── */

  const parentOnlyColumns = React.useMemo<Column<StudentAccountRecord>[]>(
    () => [
      {
        key: "accountNo",
        header: "Account #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center whitespace-nowrap rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.accountNo.replace("STD-", "PRT-")}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground whitespace-nowrap">
              Roll #{r.rollNo}
            </p>
          </div>
        ),
      },
      {
        key: "guardian",
        header: "Parent / Guardian",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-sm font-semibold text-foreground whitespace-nowrap">
              {r.guardianName}
            </p>
            <p className="text-[10.5px] text-muted-foreground whitespace-nowrap">
              {r.guardianRelation}
            </p>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        align: "center",
        cell: (r) => (
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {r.studentName}
          </span>
        ),
      },
      {
        key: "className",
        header: "Class",
        align: "center",
        cell: (r) => (
          <span className="inline-flex items-center whitespace-nowrap rounded-md border border-border/80 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {r.className}-{r.section}
          </span>
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {r.campus}
          </span>
        ),
      },
      {
        key: "assignedBy",
        header: "Assigned By",
        align: "center",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {r.assignedByAdmin.replace("Student Admin", "Parent Admin")}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.parentPortalStatus} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View assigned parent email, password, and login history"
              onClick={() => openStudent(r, "overview", "parent")}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [openStudent]
  );

  const studentAndParentFilters = React.useMemo<
    FilterDef<StudentAccountRecord>[]
  >(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: CAMPUS_OPTIONS,
        getValue: (r) => r.campus,
      },
      {
        key: "class",
        label: "Class",
        allLabel: "All Classes",
        options: sortClasses([
          ...new Set(studentAccounts.map((a) => a.className)),
        ]),
        getValue: (r) => r.className,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Active", "Pending", "Suspended"],
        getValue: (r) => r.credentialStatus,
      },
    ],
    [studentAccounts]
  );

  /* ───────────────────────── 3. Staff Accounts Table ───────────────────────── */

  const staffColumns = React.useMemo<Column<StaffAccountRecord>[]>(
    () => [
      {
        key: "accountNo",
        header: "Account #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center whitespace-nowrap rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.accountNo}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground whitespace-nowrap">
              {r.empCode}
            </p>
          </div>
        ),
      },
      {
        key: "employee",
        header: "Staff Member",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-sm font-semibold text-foreground whitespace-nowrap">
              {r.name}
            </p>
            <p className="text-[10.5px] text-muted-foreground whitespace-nowrap">
              {r.designation}
            </p>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        align: "center",
        cell: (r) => (
          <span className="inline-flex items-center whitespace-nowrap rounded-md border border-border/80 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {r.department}
          </span>
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {r.campus}
          </span>
        ),
      },
      {
        key: "assignedBy",
        header: "Assigned By",
        align: "center",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {r.assignedByAdmin}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.credentialStatus} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View assigned staff email, password, and login history"
              onClick={() => openStaff(r)}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [openStaff]
  );

  const staffFilters = React.useMemo<FilterDef<StaffAccountRecord>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: CAMPUS_OPTIONS,
        getValue: (r) => r.campus,
      },
      {
        key: "department",
        label: "Department",
        allLabel: "All Departments",
        options: [...new Set(staffAccounts.map((a) => a.department))].sort(),
        getValue: (r) => r.department,
      },
      {
        key: "category",
        label: "Category",
        allLabel: "All Categories",
        options: ["Teaching", "Non-Teaching"],
        getValue: (r) => r.category,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Active", "Pending", "Suspended"],
        getValue: (r) => r.credentialStatus,
      },
    ],
    [staffAccounts]
  );

  /* ───────────────────────── Header actions ───────────────────────── */

  const handlePrint = () => {
    const ok =
      activeTab === "students"
        ? printStudentAccountsRegister(studentAccounts)
        : activeTab === "parents"
        ? printParentAccountsRegister(studentAccounts)
        : printStaffAccountsRegister(staffAccounts);
    if (ok) toast.info("Opening print preview for credentials register…");
    else toast.error("Pop-up blocked. Allow pop-ups to print the register.");
  };

  const handleExportPdf = () => {
    if (activeTab === "students") {
      exportStudentAccountsPdf(studentAccounts);
      toast.success(
        `Student credentials directory (${studentAccounts.length} accounts) downloaded as PDF.`
      );
    } else if (activeTab === "parents") {
      exportParentAccountsPdf(studentAccounts);
      toast.success(
        `Parent credentials directory (${studentAccounts.length} accounts) downloaded as PDF.`
      );
    } else {
      exportStaffAccountsPdf(staffAccounts);
      toast.success(
        `Staff credentials directory (${staffAccounts.length} accounts) downloaded as PDF.`
      );
    }
  };

  const handleOpenNew = () => {
    if (activeTab === "students" || activeTab === "parents") {
      setEditingStudent(null);
      setStudentFormOpen(true);
    } else {
      setEditingStaff(null);
      setStaffFormOpen(true);
    }
  };

  const activeRegisterLabel =
    activeTab === "students"
      ? "Student Accounts"
      : activeTab === "parents"
      ? "Parent Accounts"
      : "Staff Accounts";

  const activeRegisterCount =
    activeTab === "staff" ? staffAccounts.length : studentAccounts.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print Register</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton tone="primary" size="md" onClick={handleOpenNew}>
              <Plus />
              <span>
                {activeTab === "students"
                  ? "Assign Student Account"
                  : activeTab === "parents"
                  ? "Assign Parent Account"
                  : "Assign Staff Account"}
              </span>
            </ActionButton>
          </>
        }
      />

      {/* KPI cards switch dynamically with the active credential register */}
      {activeTab === "students" ? (
        <StatGrid>
          <StatCard
            label="Student Portal Accounts"
            value={`${formatNumber(studentKpis.total)} (${studentKpis.active} Active)`}
            icon={GraduationCap}
          />
          <StatCard
            label="Student Emails Assigned"
            value={`${formatNumber(studentKpis.total)} Emails`}
            icon={KeyRound}
          />
          <StatCard
            label="Active Student Logins"
            value={`${formatNumber(studentKpis.active)} Active`}
            icon={UserCheck}
          />
          <StatCard
            label="Pending / Suspended"
            value={`${formatNumber(studentKpis.pendingOrSuspended)} Accounts`}
            icon={Lock}
          />
        </StatGrid>
      ) : activeTab === "parents" ? (
        <StatGrid>
          <StatCard
            label="Parent Portal Accounts"
            value={`${formatNumber(parentKpis.total)} (${parentKpis.active} Active)`}
            icon={Users}
          />
          <StatCard
            label="Parent Emails Assigned"
            value={`${formatNumber(parentKpis.total)} Guardians`}
            icon={KeyRound}
          />
          <StatCard
            label="Active Parent Logins"
            value={`${formatNumber(parentKpis.active)} Active`}
            icon={UserCheck}
          />
          <StatCard
            label="Pending / Suspended"
            value={`${formatNumber(parentKpis.pendingOrSuspended)} Accounts`}
            icon={Lock}
          />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Staff Portal Accounts"
            value={`${formatNumber(staffKpis.total)} (${staffKpis.active} Active)`}
            icon={Landmark}
          />
          <StatCard
            label="Teaching Staff Logins"
            value={`${formatNumber(staffKpis.teaching)} Provisioned`}
            icon={UserCheck}
          />
          <StatCard
            label="Admin & Support Logins"
            value={`${formatNumber(staffKpis.nonTeaching)} Provisioned`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Pending / Suspended"
            value={`${formatNumber(staffKpis.pendingOrSuspended)} Accounts`}
            icon={Lock}
          />
        </StatGrid>
      )}

      {/* Account Register Selector Dropdown (Clean Single-Line Executive Control) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="group inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-semibold text-[#091d3e] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-colors hover:border-brand/35 hover:bg-brand-50/40 focus:outline-none focus:ring-2 focus:ring-brand/15">
            {activeTab === "students" ? (
              <GraduationCap className="size-3.5 shrink-0 text-brand" />
            ) : activeTab === "parents" ? (
              <Users className="size-3.5 shrink-0 text-brand" />
            ) : (
              <Landmark className="size-3.5 shrink-0 text-brand" />
            )}
            <span className="font-semibold text-[#091d3e]">
              {activeRegisterLabel}
            </span>
            <span className="rounded-[3px] border border-brand/15 bg-brand-50/80 px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand">
              {activeRegisterCount}
            </span>
            <ChevronDown className="ml-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-open:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[235px] rounded-[6px] border border-brand/15 bg-white p-1 shadow-[0_10px_28px_-6px_rgb(9_29_62/0.18),0_2px_6px_rgb(9_29_62/0.06)] ring-0"
          >
            {(
              [
                {
                  key: "students" as const,
                  label: "Student Accounts",
                  count: studentAccounts.length,
                  icon: GraduationCap,
                },
                {
                  key: "parents" as const,
                  label: "Parent Accounts",
                  count: studentAccounts.length,
                  icon: Users,
                },
                {
                  key: "staff" as const,
                  label: "Staff Accounts",
                  count: staffAccounts.length,
                  icon: Landmark,
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.key;
              return (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-[4px] px-2.5 py-2 text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-brand-50/80 font-semibold text-[#091d3e] focus:bg-brand-50"
                      : "font-medium text-foreground/85 hover:bg-slate-50 focus:bg-slate-100/80"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0",
                        isSelected ? "text-[#091d3e]" : "text-muted-foreground"
                      )}
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "min-w-[26px] rounded-[3px] px-1.5 py-0.5 text-center font-mono text-[10.5px] font-bold tabular-nums",
                        isSelected
                          ? "bg-[#091d3e] text-white"
                          : "bg-slate-100 text-muted-foreground"
                      )}
                    >
                      {item.count}
                    </span>
                    <span className="grid size-3.5 shrink-0 place-items-center">
                      {isSelected && (
                        <Check className="size-3.5 text-[#091d3e] stroke-[2.5]" />
                      )}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="font-medium">
            {activeTab === "students"
              ? `Student Portal Directory · ${studentKpis.active} Active Logins`
              : activeTab === "parents"
              ? `Parent / Guardian Portal Directory · ${parentKpis.active} Active Logins`
              : `Staff Portal Directory · ${staffKpis.active} Active Logins`}
          </span>
        </div>
      </div>

      {/* Active Register Table */}
      {activeTab === "students" ? (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={studentAccounts}
            columns={studentOnlyColumns}
            getRowId={(r) => r.id}
            filters={studentAndParentFilters}
            searchPlaceholder="Search student name, roll #, account #, or class…"
            searchFn={(r, q) =>
              r.studentName.toLowerCase().includes(q) ||
              r.rollNo.toLowerCase().includes(q) ||
              r.accountNo.toLowerCase().includes(q) ||
              r.admissionNumber.toLowerCase().includes(q) ||
              r.className.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q) ||
              r.studentEmail.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No student portal accounts match the selected filters."
          />
        </SectionCard>
      ) : activeTab === "parents" ? (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={studentAccounts}
            columns={parentOnlyColumns}
            getRowId={(r) => r.id}
            filters={studentAndParentFilters}
            searchPlaceholder="Search parent/guardian, student name, roll #, or campus…"
            searchFn={(r, q) =>
              r.guardianName.toLowerCase().includes(q) ||
              r.phone.toLowerCase().includes(q) ||
              r.parentEmail.toLowerCase().includes(q) ||
              r.studentName.toLowerCase().includes(q) ||
              r.rollNo.toLowerCase().includes(q) ||
              r.className.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q) ||
              r.accountNo.replace("STD-", "PRT-").toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No parent portal accounts match the selected filters."
          />
        </SectionCard>
      ) : (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={staffAccounts}
            columns={staffColumns}
            getRowId={(r) => r.id}
            filters={staffFilters}
            searchPlaceholder="Search staff name, emp code, department, or campus…"
            searchFn={(r, q) =>
              r.name.toLowerCase().includes(q) ||
              r.empCode.toLowerCase().includes(q) ||
              r.accountNo.toLowerCase().includes(q) ||
              r.designation.toLowerCase().includes(q) ||
              r.department.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q) ||
              r.staffEmail.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No staff portal accounts match the selected filters."
          />
        </SectionCard>
      )}

      {/* Modals */}
      <StudentAccountModal
        account={selectedStudent}
        open={studentModalOpen}
        onOpenChange={setStudentModalOpen}
        initialTab={studentModalTab}
        accountMode={studentModalMode}
        onUpdateCredentials={handleUpdateStudentCredentials}
        onEditAccount={(acc) => {
          setEditingStudent(acc);
          setStudentFormOpen(true);
        }}
      />
      <StudentAccountFormModal
        open={studentFormOpen}
        onOpenChange={setStudentFormOpen}
        initialData={editingStudent}
        totalCount={studentAccounts.length}
        onSave={handleSaveStudent}
      />

      <StaffAccountModal
        account={selectedStaff}
        open={staffModalOpen}
        onOpenChange={setStaffModalOpen}
        onUpdateStaffCredentials={handleUpdateStaffCredentials}
        onEditAccount={(acc) => {
          setEditingStaff(acc);
          setStaffFormOpen(true);
        }}
      />
      <StaffAccountFormModal
        open={staffFormOpen}
        onOpenChange={setStaffFormOpen}
        initialData={editingStaff}
        totalCount={staffAccounts.length}
        onSave={handleSaveStaff}
      />
    </div>
  );
}
