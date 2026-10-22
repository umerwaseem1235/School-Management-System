"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { StaffMember, Status } from "@/types";
import {
  Briefcase,
  FileDown,
  GraduationCap,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { StaffTable } from "./staff-table";
import { StaffDetailsDialog } from "./staff-details-dialog";
import { NewStaffDialog } from "./new-staff-dialog";
import { ExportStaffDialog } from "./export-staff-dialog";

interface StaffClientProps {
  initialStaff: StaffMember[];
}

export function StaffClient({ initialStaff }: StaffClientProps) {
  const [staffList, setStaffList] = React.useState<StaffMember[]>(initialStaff);
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);

  // Summary Metrics
  const totalStaff = staffList.length;
  const teachingCount = staffList.filter((s) => s.type === "Teaching").length;
  const nonTeachingCount = totalStaff - teachingCount;
  const activeCount = staffList.filter((s) => s.status === "Active").length;

  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
    const assignment = newStaff.assignedClasses
      ? `${newStaff.assignedClasses} · ${newStaff.assignedSubjects || newStaff.department}`
      : newStaff.designation;
    toast.success("Staff Member Added", {
      description: `${newStaff.name} registered successfully (${assignment}).`,
    });
  };

  const handleStatusChange = (id: string, newStatus: Status) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );

    setSelectedStaff((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );

    const member = staffList.find((s) => s.id === id);
    const name = member?.name || "Staff member";

    if (newStatus === "Inactive") {
      toast.warning("Staff Member Deactivated", {
        description: `${name} has been marked as Inactive. Historical tenure and logs are preserved.`,
      });
    } else if (newStatus === "Active") {
      toast.success("Staff Member Activated", {
        description: `${name} is now marked as Active on duty.`,
      });
    } else if (newStatus === "Suspended") {
      toast.error("Staff Member Suspended", {
        description: `${name} is now temporarily suspended.`,
      });
    } else {
      toast.info("Status Updated", {
        description: `${name} status set to ${newStatus}.`,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <PageHeader
        title="Staff Management"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportOpen(true)}
              className="gap-2 border-border/80 hover:bg-muted/60 shadow-2xs cursor-pointer text-xs font-semibold"
            >
              <FileDown className="size-4 text-brand" data-icon="inline-start" />
              <span>Export PDF</span>
            </Button>

            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-2 bg-brand text-cream hover:bg-brand-600 cursor-pointer shadow-sm text-xs font-semibold px-4"
            >
              <UserPlus className="size-4" data-icon="inline-start" />
              <span>Add Staff Member</span>
            </Button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <StatGrid>
        <StatCard
          label="Total Staff"
          value={formatNumber(totalStaff)}
          icon={Users}
        />
        <StatCard
          label="Teaching Faculty"
          value={formatNumber(teachingCount)}
          icon={GraduationCap}
        />
        <StatCard
          label="Non-Teaching Staff"
          value={formatNumber(nonTeachingCount)}
          icon={Briefcase}
        />
        <StatCard
          label="Active on Duty"
          value={formatNumber(activeCount)}
          icon={UserCheck}
        />
      </StatGrid>

      {/* Main Staff Directory Card */}
      <SectionCard flush>
        <StaffTable
          data={staffList}
          onSelectStaff={setSelectedStaff}
          onStatusChange={handleStatusChange}
        />
      </SectionCard>

      {/* Modals & Dialogs */}
      <StaffDetailsDialog
        staff={selectedStaff}
        open={Boolean(selectedStaff)}
        onOpenChange={(open) => {
          if (!open) setSelectedStaff(null);
        }}
        onStatusChange={handleStatusChange}
      />

      <NewStaffDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAddStaff={handleAddStaff}
        existingCount={staffList.length}
      />

      <ExportStaffDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        staff={staffList}
      />
    </div>
  );
}
