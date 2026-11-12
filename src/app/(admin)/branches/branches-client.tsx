"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  Building2,
  GraduationCap,
  Users,
  MapPin,
  User as UserIcon,
  Plus,
  Eye,
  Pencil,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Campus } from "@/types";
import { useBranches } from "@/context/branches-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CreateBranchDialog } from "./create-branch-dialog";
import { EditBranchDialog } from "./edit-branch-dialog";
import { DeleteBranchDialog } from "./delete-branch-dialog";
import { ViewBranchDialog } from "./view-branch-dialog";

interface BranchesClientProps {
  initialBranches: Campus[];
}

export function BranchesClient({ initialBranches: _initialBranches }: BranchesClientProps) {
  // Use application-wide BranchesContext
  const {
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
  } = useBranches();

  // Dialog states
  const [createOpen, setCreateOpen] = React.useState(false);
  const [viewBranch, setViewBranch] = React.useState<Campus | null>(null);
  const [editBranch, setEditBranch] = React.useState<Campus | null>(null);
  const [deleteBranchState, setDeleteBranchState] = React.useState<Campus | null>(null);

  // Aggregate stats
  const totalCampuses = branches.length;
  const totalStudents = branches.reduce(
    (acc, curr) => acc + (curr.students || 0),
    0
  );
  const totalStaff = branches.reduce(
    (acc, curr) => acc + (curr.staff || 0),
    0
  );
  const totalCapacity = branches.reduce(
    (acc, curr) => acc + (curr.capacity || 0),
    0
  );
  const avgUtilization =
    totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

  // Unique cities list for filter
  const uniqueCities = React.useMemo(() => {
    return Array.from(new Set(branches.map((b) => b.city))).sort();
  }, [branches]);

  // Handlers
  const handleAddBranch = (newBranch: Campus) => {
    addBranch(newBranch);
  };

  const handleUpdateBranch = (updated: Campus) => {
    updateBranch(updated);
  };

  const handleDeleteBranch = (id: string) => {
    deleteBranch(id);
    toast.success("Branch removed successfully across all modules");
  };

  const handleToggleStatus = React.useCallback((id: string, currentStatus: Campus["status"], name: string) => {
    toggleBranchStatus(id);
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    toast.success(`Branch "${name}" marked as ${nextStatus}`);
  }, [toggleBranchStatus]);

  // Search function for DataTable
  const searchFn = React.useCallback((branch: Campus, q: string) => {
    const query = q.toLowerCase().trim();
    return (
      branch.campusName.toLowerCase().includes(query) ||
      branch.campusCode.toLowerCase().includes(query) ||
      branch.city.toLowerCase().includes(query) ||
      branch.principal.toLowerCase().includes(query) ||
      branch.address.toLowerCase().includes(query)
    );
  }, []);

  // Symmetrical, balanced column definitions
  const columns = React.useMemo<Column<Campus>[]>(
    () => [
      {
        key: "branch",
        header: "Branch / Campus",
        align: "left",
        headerClassName: "w-[24%] px-3.5 text-left",
        className: "w-[24%] px-3.5 text-left",
        cell: (r) => (
          <div
            className="flex items-center gap-2.5 min-w-0"
            title={`${r.campusName} (${r.campusCode})`}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand ring-1 ring-brand/10 dark:bg-brand-soft">
              <Building2 className="size-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-foreground text-xs leading-tight truncate">
                {r.campusName}
              </span>
              <div className="mt-0.5">
                <span className="inline-flex font-mono text-[10px] font-semibold text-muted-foreground bg-muted/80 px-1.5 py-0.2 rounded border border-border/40 shrink-0">
                  {r.campusCode}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "city",
        header: "City",
        align: "center",
        headerClassName: "w-[13%] px-2 text-center",
        className: "w-[13%] px-2 text-center",
        cell: (r) => (
          <div className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-foreground">
            <MapPin className="size-3.5 text-brand shrink-0" />
            <span>{r.city}</span>
          </div>
        ),
      },
      {
        key: "principal",
        header: "Principal / Head",
        align: "center",
        headerClassName: "w-[19%] px-2 text-center",
        className: "w-[19%] px-2 text-center",
        cell: (r) => (
          <div
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-foreground max-w-full"
            title={r.principal}
          >
            <UserIcon className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{r.principal}</span>
          </div>
        ),
      },
      {
        key: "capacity",
        header: "Students / Capacity",
        align: "center",
        headerClassName: "w-[16%] px-2 text-center",
        className: "w-[16%] px-2 text-center",
        cell: (r) => (
          <div className="inline-flex flex-col items-center justify-center leading-tight">
            <span className="text-xs font-bold text-foreground">
              {formatNumber(r.students)}
            </span>
            <span className="text-[10.5px] text-muted-foreground whitespace-nowrap">
              of {formatNumber(r.capacity)} seats
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        headerClassName: "w-[13%] px-2 text-center",
        className: "w-[13%] px-2 text-center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <StatusBadge status={r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        headerClassName: "w-[15%] px-2 text-center",
        className: "w-[15%] px-2 text-center",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1 whitespace-nowrap">
            {/* View Branch */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewBranch(r)}
              className="size-7 rounded-[4px] text-muted-foreground hover:text-brand hover:bg-brand-50 transition-colors cursor-pointer"
              title="View Branch Profile"
            >
              <Eye className="size-3.5" />
              <span className="sr-only">View</span>
            </Button>

            {/* Edit Branch */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditBranch(r)}
              className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Edit Branch"
            >
              <Pencil className="size-3.5" />
              <span className="sr-only">Edit</span>
            </Button>

            {/* Quick Toggle Status */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleStatus(r.id, r.status, r.campusName)}
              className={cn(
                "size-7 rounded-[4px] transition-colors cursor-pointer",
                r.status === "Active"
                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              )}
              title={
                r.status === "Active"
                  ? "Deactivate Branch (Set Inactive)"
                  : "Activate Branch (Set Active)"
              }
            >
              {r.status === "Active" ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <Ban className="size-3.5" />
              )}
              <span className="sr-only">Toggle Status</span>
            </Button>

            {/* Delete Branch */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteBranchState(r)}
              className="size-7 rounded-[4px] text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              title="Remove Branch"
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Filters configuration for DataTable
  const filters = React.useMemo<FilterDef<Campus>[]>(
    () => [
      {
        key: "city",
        label: "City",
        allLabel: "All Cities",
        options: uniqueCities,
        triggerClassName: "w-[140px] shrink-0",
        getValue: (r) => r.city,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Status",
        options: ["Active", "Pending", "Inactive"],
        triggerClassName: "w-[130px] shrink-0",
        getValue: (r) => r.status,
      },
    ],
    [uniqueCities]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Branches"
        actions={
          <Button
            size="lg"
            onClick={() => setCreateOpen(true)}
            className="h-9.5 px-5 gap-2 cursor-pointer shadow-sm text-xs font-semibold"
          >
            <Plus className="size-4" />
            <span>Add Branch</span>
          </Button>
        }
      />

      {/* KPI Stats */}
      <StatGrid>
        <StatCard
          label="Total Branches"
          value={totalCampuses.toString()}
          icon={Building2}
        />
        <StatCard
          label="Enrolled Students"
          value={formatNumber(totalStudents)}
          icon={GraduationCap}
        />
        <StatCard
          label="Total Staff"
          value={formatNumber(totalStaff)}
          icon={Users}
        />
        <StatCard
          label="Capacity Utilization"
          value={formatPercent(avgUtilization)}
          icon={TrendingUp}
        />
      </StatGrid>

      {/* Symmetrical, Full-featured DataTable wrapped in SectionCard */}
      <SectionCard flush contentClassName="pt-5">
        <DataTable<Campus>
          data={branches}
          columns={columns}
          getRowId={(r) => r.id}
          searchPlaceholder="Search branches by name, code, city, principal..."
          searchFn={searchFn}
          filters={filters}
          pageSize={10}
          tableClassName="w-full min-w-[760px] table-fixed"
          emptyMessage="No branches match your current search or filter criteria."
        />
      </SectionCard>

      {/* Dialogs */}
      <CreateBranchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onAddBranch={handleAddBranch}
      />

      <ViewBranchDialog
        branch={viewBranch}
        open={Boolean(viewBranch)}
        onOpenChange={(open) => !open && setViewBranch(null)}
      />

      <EditBranchDialog
        branch={editBranch}
        open={Boolean(editBranch)}
        onOpenChange={(open) => !open && setEditBranch(null)}
        onUpdateBranch={handleUpdateBranch}
      />

      <DeleteBranchDialog
        branch={deleteBranchState}
        open={Boolean(deleteBranchState)}
        onOpenChange={(open) => !open && setDeleteBranchState(null)}
        onConfirm={handleDeleteBranch}
      />
    </div>
  );
}
