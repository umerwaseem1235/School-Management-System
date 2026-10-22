"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatCampusDisplay, formatNumber } from "@/lib/format";
import type { FrontDeskInquiry, VisitorPass } from "@/types";
import {
  Clock,
  LogOut,
  PhoneCall,
  Plus,
  UserCheck,
  Users,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { CheckInVisitorDialog } from "./check-in-visitor-dialog";
import { LogInquiryDialog } from "./log-inquiry-dialog";

interface ReceptionClientProps {
  initialVisitorPasses: VisitorPass[];
  initialInquiries: FrontDeskInquiry[];
}

export function ReceptionClient({
  initialVisitorPasses,
  initialInquiries,
}: ReceptionClientProps) {
  // State
  const [visitorPasses, setVisitorPasses] = React.useState<VisitorPass[]>(initialVisitorPasses);
  const [inquiries, setInquiries] = React.useState<FrontDeskInquiry[]>(initialInquiries);
  const [activeTab, setActiveTab] = React.useState("visitors");

  // Dialog States
  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [isLogInquiryOpen, setIsLogInquiryOpen] = React.useState(false);

  // Summary Counts
  const totalVisitorsToday = visitorPasses.length;
  const insideVisitors = visitorPasses.filter((v) => v.status === "Inside" || v.status === "Overstay").length;
  const checkedOutVisitors = visitorPasses.filter((v) => v.status === "Checked Out").length;
  const totalInquiries = inquiries.length;

  // Handlers: Add Visitor
  const handleAddVisitor = (newPass: VisitorPass) => {
    setVisitorPasses((prev) => [newPass, ...prev]);
    toast.success("Visitor Entry Recorded", {
      description: `${newPass.visitorName} checked in at ${newPass.checkInTime}.`,
    });
  };

  // Handlers: One-click Check Out
  const handleCheckOutVisitor = React.useCallback((passId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setVisitorPasses((prev) =>
      prev.map((p) => {
        if (p.id === passId) {
          toast.success("Visitor Checked Out", {
            description: `${p.visitorName} departed at ${timeStr}.`,
          });
          return {
            ...p,
            status: "Checked Out",
            checkOutTime: timeStr,
          };
        }
        return p;
      })
    );
  }, []);

  // Handlers: Add Inquiry
  const handleAddInquiry = (newInquiry: FrontDeskInquiry) => {
    setInquiries((prev) => [newInquiry, ...prev]);
    toast.success("Inquiry Logged", {
      description: `Inquiry from ${newInquiry.callerName} saved.`,
    });
  };

  // Handlers: Toggle Inquiry Status (Pending <-> Resolved)
  const handleToggleInquiryStatus = React.useCallback((id: string) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const isResolved = i.status === "Closed" || i.status === "Converted";
          const newStatus = isResolved ? "New" : "Closed";
          toast.success(newStatus === "Closed" ? "Inquiry Marked Resolved" : "Inquiry Reopened");
          return { ...i, status: newStatus };
        }
        return i;
      })
    );
  }, []);

  /* ─────────────────────────────────────────────────────────────
     Visitor Register Columns & Filters
     ───────────────────────────────────────────────────────────── */
  const visitorCampuses = React.useMemo(
    () => [...new Set(visitorPasses.map((v) => v.campus))],
    [visitorPasses]
  );

  const visitorCampusOptions = React.useMemo(
    () =>
      visitorCampuses.map((c) => ({
        value: c,
        label: formatCampusDisplay(c).label,
      })),
    [visitorCampuses]
  );

  const visitorColumns = React.useMemo<Column<VisitorPass>[]>(
    () => [
      {
        key: "visitor",
        header: "Visitor",
        cell: (r) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-[13px] leading-tight truncate">
              {r.visitorName}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{r.phone}</span>
          </div>
        ),
        sortValue: (r) => r.visitorName,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "host",
        header: "Whom to Meet & Purpose",
        cell: (r) => (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground leading-tight truncate">
              {r.hostPerson}
            </span>
            <div className="mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground">
                {r.purpose}
              </span>
            </div>
          </div>
        ),
        sortValue: (r) => r.hostPerson,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "campus",
        header: "Campus",
        cell: (r) => (
          <span className="text-xs text-muted-foreground font-medium block truncate">
            {formatCampusDisplay(r.campus).primary}
          </span>
        ),
        sortValue: (r) => r.campus,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "timing",
        header: "Timing",
        cell: (r) => (
          <div className="flex flex-col text-xs font-mono leading-tight whitespace-nowrap">
            <span className="text-foreground">In: {r.checkInTime}</span>
            <span className="text-muted-foreground text-[11px]">
              Out: {r.checkOutTime || "—"}
            </span>
          </div>
        ),
        className: "px-4 py-3 whitespace-nowrap",
        headerClassName: "px-4",
      },
      {
        key: "actions",
        header: "Status / Action",
        cell: (r) => {
          const isInside = r.status === "Inside" || r.status === "Overstay";
          if (!isInside) {
            return (
              <div className="flex items-center justify-end">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground whitespace-nowrap">
                  Checked Out
                </span>
              </div>
            );
          }
          return (
            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-warning-soft text-warning">
                Inside
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleCheckOutVisitor(r.id)}
                className="h-7 gap-1 px-2.5 rounded-lg text-xs font-semibold text-danger border-border/80 hover:bg-danger-soft hover:text-danger hover:border-danger/30 cursor-pointer shadow-2xs"
              >
                <LogOut className="size-3" />
                <span>Check Out</span>
              </Button>
            </div>
          );
        },
        className: "px-4 py-3 text-right whitespace-nowrap",
        headerClassName: "px-4 text-right",
      },
    ],
    [handleCheckOutVisitor]
  );

  const visitorFilters = React.useMemo<FilterDef<VisitorPass>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: visitorCampusOptions,
        triggerClassName: "w-[150px] shrink-0",
        getValue: (r) => r.campus,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Inside", "Checked Out"],
        triggerClassName: "w-[120px] shrink-0",
        getValue: (r) =>
          r.status === "Inside" || r.status === "Overstay" ? "Inside" : "Checked Out",
      },
      {
        key: "purpose",
        label: "Purpose",
        allLabel: "All Purposes",
        options: [
          "Parent Meeting",
          "Admission Inquiry",
          "Fee Payment",
          "Official Visit",
          "Other",
        ],
        triggerClassName: "w-[145px] shrink-0",
        getValue: (r) => r.purpose,
      },
    ],
    [visitorCampusOptions]
  );

  /* ─────────────────────────────────────────────────────────────
     Inquiries Table Columns & Filters
     ───────────────────────────────────────────────────────────── */
  const inquiryCampuses = React.useMemo(
    () => [...new Set(inquiries.map((i) => i.campus))],
    [inquiries]
  );

  const inquiryCampusOptions = React.useMemo(
    () =>
      inquiryCampuses.map((c) => ({
        value: c,
        label: formatCampusDisplay(c).label,
      })),
    [inquiryCampuses]
  );

  const inquiryColumns = React.useMemo<Column<FrontDeskInquiry>[]>(
    () => [
      {
        key: "caller",
        header: "Caller / Inquirer",
        cell: (r) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-[13px] leading-tight truncate">
              {r.callerName}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{r.phone}</span>
          </div>
        ),
        sortValue: (r) => r.callerName,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "inquiryType",
        header: "Category & Message",
        cell: (r) => (
          <div className="flex flex-col min-w-0">
            <div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand">
                {r.inquiryType}
              </span>
            </div>
            <p className="text-xs text-foreground/80 line-clamp-1 mt-0.5">
              {r.notes}
            </p>
          </div>
        ),
        sortValue: (r) => r.inquiryType,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "campus",
        header: "Campus",
        cell: (r) => (
          <span className="text-xs text-muted-foreground font-medium block truncate">
            {formatCampusDisplay(r.campus).primary}
          </span>
        ),
        sortValue: (r) => r.campus,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "createdAt",
        header: "Date",
        cell: (r) => (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {r.createdAt}
          </span>
        ),
        sortValue: (r) => r.createdAt,
        className: "px-4 py-3 whitespace-nowrap",
        headerClassName: "px-4",
      },
      {
        key: "actions",
        header: "Status / Action",
        cell: (r) => {
          const isResolved = r.status === "Closed" || r.status === "Converted";
          return (
            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isResolved
                    ? "bg-success-soft text-success"
                    : "bg-warning-soft text-warning"
                }`}
              >
                {isResolved ? "Resolved" : "Pending"}
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleToggleInquiryStatus(r.id)}
                className="h-7 text-xs font-medium border-border/80 hover:bg-muted/60 cursor-pointer shadow-2xs"
              >
                {isResolved ? "Reopen" : "Resolve"}
              </Button>
            </div>
          );
        },
        className: "px-4 py-3 text-right whitespace-nowrap",
        headerClassName: "px-4 text-right",
      },
    ],
    [handleToggleInquiryStatus]
  );

  const inquiryFilters = React.useMemo<FilterDef<FrontDeskInquiry>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: inquiryCampusOptions,
        triggerClassName: "w-[150px] shrink-0",
        getValue: (r) => r.campus,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Pending", "Resolved"],
        triggerClassName: "w-[120px] shrink-0",
        getValue: (r) =>
          r.status === "Closed" || r.status === "Converted" ? "Resolved" : "Pending",
      },
    ],
    [inquiryCampusOptions]
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <PageHeader
        title="Reception"
        actions={
          <Button
            onClick={() => {
              if (activeTab === "visitors") {
                setIsCheckInOpen(true);
              } else {
                setIsLogInquiryOpen(true);
              }
            }}
            className="gap-2 bg-brand text-cream hover:bg-brand-600 cursor-pointer shadow-sm text-xs font-semibold px-4"
          >
            <Plus className="size-4" data-icon="inline-start" />
            <span>{activeTab === "visitors" ? "Add Visitor" : "Log Inquiry"}</span>
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <StatGrid>
        <StatCard
          label="Total Visitors Today"
          value={formatNumber(totalVisitorsToday)}
          icon={Users}
        />
        <StatCard
          label="Currently Inside"
          value={formatNumber(insideVisitors)}
          icon={UserCheck}
        />
        <StatCard
          label="Checked Out"
          value={formatNumber(checkedOutVisitors)}
          icon={Clock}
        />
        <StatCard
          label="Total Inquiries"
          value={formatNumber(totalInquiries)}
          icon={PhoneCall}
        />
      </StatGrid>

      {/* Clean 2 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-1">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="visitors"
              className="gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer px-3.5 py-1.5"
            >
              <Users className="size-3.5 text-brand" />
              <span>Visitor Register</span>
              <span className="ml-1 text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-brand-50 text-brand">
                {visitorPasses.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="inquiries"
              className="gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer px-3.5 py-1.5"
            >
              <PhoneCall className="size-3.5 text-brand" />
              <span>Inquiries & Calls</span>
              <span className="ml-1 text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                {inquiries.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Visitor Register */}
        <TabsContent value="visitors" className="m-0 focus-visible:outline-none">
          <SectionCard flush>
            <DataTable
              data={visitorPasses}
              columns={visitorColumns}
              getRowId={(r) => r.id}
              searchPlaceholder="Search visitors…"
              searchFn={(r, q) =>
                r.visitorName.toLowerCase().includes(q) ||
                r.phone.toLowerCase().includes(q) ||
                r.hostPerson.toLowerCase().includes(q) ||
                r.purpose.toLowerCase().includes(q)
              }
              filters={visitorFilters}
              pageSize={8}
              tableClassName="w-full text-sm"
            />
          </SectionCard>
        </TabsContent>

        {/* Tab 2: Inquiries & Calls */}
        <TabsContent value="inquiries" className="m-0 focus-visible:outline-none">
          <SectionCard flush>
            <DataTable
              data={inquiries}
              columns={inquiryColumns}
              getRowId={(r) => r.id}
              searchPlaceholder="Search inquiries…"
              searchFn={(r, q) =>
                r.callerName.toLowerCase().includes(q) ||
                r.phone.toLowerCase().includes(q) ||
                r.notes.toLowerCase().includes(q) ||
                r.inquiryType.toLowerCase().includes(q)
              }
              filters={inquiryFilters}
              pageSize={8}
              tableClassName="w-full text-sm"
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Simple Dialogs */}
      <CheckInVisitorDialog
        open={isCheckInOpen}
        onOpenChange={setIsCheckInOpen}
        onAddVisitor={handleAddVisitor}
        existingCount={visitorPasses.length}
      />

      <LogInquiryDialog
        open={isLogInquiryOpen}
        onOpenChange={setIsLogInquiryOpen}
        onAddInquiry={handleAddInquiry}
        existingCount={inquiries.length}
      />
    </div>
  );
}
