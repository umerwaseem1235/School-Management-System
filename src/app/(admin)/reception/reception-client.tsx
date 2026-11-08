"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
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
  RotateCcw,
  ChevronDown,
  Check,
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
        align: "left",
        cell: (r) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-[13px] leading-tight truncate">
              {r.visitorName}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{r.phone}</span>
          </div>
        ),
        sortValue: (r) => r.visitorName,
        className: "whitespace-nowrap",
      },
      {
        key: "host",
        header: "Whom to Meet & Purpose",
        align: "center",
        cell: (r) => (
          <div className="inline-flex flex-col items-center justify-center min-w-0">
            <span className="text-xs font-semibold text-foreground leading-tight truncate">
              {r.hostPerson}
            </span>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground">
                {r.purpose}
              </span>
            </div>
          </div>
        ),
        sortValue: (r) => r.hostPerson,
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        cell: (r) => (
          <span className="text-xs text-muted-foreground font-medium block truncate">
            {formatCampusDisplay(r.campus).primary}
          </span>
        ),
        sortValue: (r) => r.campus,
      },
      {
        key: "timing",
        header: "Timing",
        align: "center",
        cell: (r) => (
          <div className="inline-flex flex-col items-center justify-center text-xs font-mono leading-tight whitespace-nowrap">
            <span className="text-foreground">In: {r.checkInTime}</span>
            <span className="text-muted-foreground text-[11px]">
              Out: {r.checkOutTime || "—"}
            </span>
          </div>
        ),
        className: "whitespace-nowrap",
      },
      {
        key: "actions",
        header: "Status / Action",
        align: "center",
        cell: (r) => {
          const isInside = r.status === "Inside" || r.status === "Overstay";
          if (!isInside) {
            return (
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground whitespace-nowrap">
                  Checked Out
                </span>
              </div>
            );
          }
          return (
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-soft text-warning">
                Inside
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleCheckOutVisitor(r.id)}
                className="h-7 gap-1 px-2.5 rounded-lg text-xs font-semibold border-rose-200 bg-rose-50/70 text-rose-700 hover:border-rose-400 hover:bg-rose-100 hover:text-rose-800 cursor-pointer shadow-2xs"
              >
                <LogOut className="size-3 text-rose-600" />
                <span>Check Out</span>
              </Button>
            </div>
          );
        },
        className: "whitespace-nowrap",
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
        align: "left",
        cell: (r) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-[13px] leading-tight truncate">
              {r.callerName}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{r.phone}</span>
          </div>
        ),
        sortValue: (r) => r.callerName,
        className: "whitespace-nowrap",
      },
      {
        key: "inquiryType",
        header: "Category & Message",
        align: "center",
        cell: (r) => (
          <div className="inline-flex flex-col items-center justify-center min-w-0 max-w-[280px]">
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand">
                {r.inquiryType}
              </span>
            </div>
            <p className="text-xs text-foreground/80 line-clamp-1 mt-0.5 text-center">
              {r.notes}
            </p>
          </div>
        ),
        sortValue: (r) => r.inquiryType,
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        cell: (r) => (
          <span className="text-xs text-muted-foreground font-medium block truncate">
            {formatCampusDisplay(r.campus).primary}
          </span>
        ),
        sortValue: (r) => r.campus,
      },
      {
        key: "createdAt",
        header: "Date",
        align: "center",
        cell: (r) => (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {r.createdAt}
          </span>
        ),
        sortValue: (r) => r.createdAt,
        className: "whitespace-nowrap",
      },
      {
        key: "actions",
        header: "Status / Action",
        align: "center",
        cell: (r) => {
          const isResolved = r.status === "Closed" || r.status === "Converted";
          return (
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
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
                className={`h-7 gap-1 px-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs ${
                  isResolved
                    ? "border-amber-200 bg-amber-50/70 text-amber-700 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800"
                    : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 hover:text-emerald-800"
                }`}
              >
                {isResolved ? (
                  <>
                    <RotateCcw className="size-3 text-amber-600" />
                    <span>Reopen</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span>Resolve</span>
                  </>
                )}
              </Button>
            </div>
          );
        },
        className: "whitespace-nowrap",
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

  const receptionSections = [
    {
      id: "visitors",
      label: "Visitor Register",
      icon: Users,
      count: visitorPasses.length,
    },
    {
      id: "inquiries",
      label: "Inquiries & Calls",
      icon: PhoneCall,
      count: inquiries.length,
    },
  ];

  const activeSectionObj =
    receptionSections.find((s) => s.id === activeTab) || receptionSections[0];

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-8">
      {/* Header */}
      <PageHeader
        title="Reception"
        className="mb-0 lg:mb-0"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLogInquiryOpen(true)}
              className="gap-1.5 text-xs font-medium cursor-pointer shadow-2xs h-9 px-3.5"
            >
              <PhoneCall className="size-3.5 text-brand" />
              <span>Log Inquiry</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCheckInOpen(true)}
              className="gap-1.5 bg-brand text-cream hover:bg-brand-600 cursor-pointer shadow-sm text-xs font-semibold h-9 px-3.5"
            >
              <Plus className="size-4" />
              <span>Add Visitor</span>
            </Button>
          </div>
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
        {/* Dropdown Section Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="group inline-flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background hover:bg-muted/50 px-3 h-9 text-xs font-semibold shadow-2xs transition-all hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer min-w-[210px] sm:min-w-[230px]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <activeSectionObj.icon className="size-4 text-brand shrink-0" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {activeSectionObj.label}
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-60 p-1 rounded-xl shadow-lg border-border/80"
              >
                {receptionSections.map((sec) => {
                  const Icon = sec.icon;
                  const isSelected = activeTab === sec.id;
                  return (
                    <DropdownMenuItem
                      key={sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors",
                        isSelected
                          ? "bg-brand-soft text-brand font-semibold"
                          : "hover:bg-muted/70 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "size-3.5 shrink-0",
                            isSelected ? "text-brand" : "text-muted-foreground"
                          )}
                        />
                        <span className="truncate">{sec.label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold",
                            isSelected
                              ? "bg-brand/15 text-brand"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {sec.count}
                        </span>
                        {isSelected && (
                          <Check className="size-3.5 text-brand shrink-0" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
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
