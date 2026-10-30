"use client";

import * as React from "react";
import {
  Bus,
  Check,
  ChevronDown,
  Download,
  Edit,
  FileDown,
  GraduationCap,
  MapPin,
  Navigation,
  Plus,
  Printer,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/components/shared/data-table";
import { ActionButton } from "@/components/shared/action-button";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  INITIAL_TRANSPORT_ASSIGNMENTS,
  INITIAL_TRANSPORT_ROUTES,
  INITIAL_TRANSPORT_VEHICLES,
  type TransportAssignmentRecord,
  type TransportRouteRecord,
  type TransportVehicleRecord,
} from "@/lib/mock/transport";
import {
  exportRouteStudentsPdf,
  exportStudentTransportCardPdf,
  exportTransportAssignmentsPdf,
  exportTransportRoutesPdf,
  exportTransportVehiclesPdf,
  exportVehicleStudentsPdf,
  printTransportOverview,
} from "./transport-export";
import {
  AssignmentFormModal,
  DeleteConfirmModal,
  RouteFormModal,
  VehicleFormModal,
} from "./transport-form-modals";

type TransportTab = "routes" | "vehicles" | "assignments";

export function TransportClient() {
  const [activeTab, setActiveTab] = React.useState<TransportTab>("routes");

  const [routes, setRoutes] = React.useState<TransportRouteRecord[]>(
    INITIAL_TRANSPORT_ROUTES
  );
  const [vehicles, setVehicles] = React.useState<TransportVehicleRecord[]>(
    INITIAL_TRANSPORT_VEHICLES
  );
  const [assignments, setAssignments] = React.useState<
    TransportAssignmentRecord[]
  >(INITIAL_TRANSPORT_ASSIGNMENTS);

  // Route Form Modal State
  const [routeModalOpen, setRouteModalOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] =
    React.useState<TransportRouteRecord | null>(null);

  // Vehicle Form Modal State
  const [vehicleModalOpen, setVehicleModalOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] =
    React.useState<TransportVehicleRecord | null>(null);

  // Student Assignment Form Modal State
  const [assignmentModalOpen, setAssignmentModalOpen] = React.useState(false);
  const [editingAssignment, setEditingAssignment] =
    React.useState<TransportAssignmentRecord | null>(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: TransportTab;
    id: string;
    label: string;
  } | null>(null);

  /* ───────────────────────── Dynamic KPI Aggregates ───────────────────────── */

  const kpis = React.useMemo(() => {
    const totalRoutes = routes.length;
    const totalVehicles = vehicles.length;
    const totalCapacity = vehicles.reduce((s, v) => s + v.capacity, 0);
    const totalAssignedStudents = assignments.length;
    const monthlyRevenue = assignments.reduce((s, a) => s + a.monthlyFare, 0);

    return {
      totalRoutes,
      totalVehicles,
      totalCapacity,
      totalAssignedStudents,
      monthlyRevenue,
    };
  }, [routes, vehicles, assignments]);

  /* ───────────────────────── CRUD Handlers ───────────────────────── */

  const handleSaveRoute = React.useCallback((record: TransportRouteRecord) => {
    setRoutes((prev) => {
      const exists = prev.some((r) => r.id === record.id);
      return exists
        ? prev.map((r) => (r.id === record.id ? record : r))
        : [record, ...prev];
    });

    // Keep linked vehicles and assignments synchronized with updated route name & fare
    setVehicles((prev) =>
      prev.map((v) =>
        v.routeId === record.id ? { ...v, routeName: record.routeName } : v
      )
    );
    setAssignments((prev) =>
      prev.map((a) =>
        a.routeId === record.id
          ? {
              ...a,
              routeName: record.routeName,
              monthlyFare: record.monthlyFare,
            }
          : a
      )
    );
  }, []);

  const handleSaveVehicle = React.useCallback(
    (record: TransportVehicleRecord) => {
      setVehicles((prev) => {
        const exists = prev.some((v) => v.id === record.id);
        return exists
          ? prev.map((v) => (v.id === record.id ? record : v))
          : [record, ...prev];
      });
    },
    []
  );

  const handleSaveAssignment = React.useCallback(
    (record: TransportAssignmentRecord) => {
      setAssignments((prev) => {
        const exists = prev.some((a) => a.id === record.id);
        return exists
          ? prev.map((a) => (a.id === record.id ? record : a))
          : [record, ...prev];
      });
    },
    []
  );

  const handleConfirmDelete = React.useCallback(() => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "routes") {
      setRoutes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setVehicles((prev) =>
        prev.map((v) =>
          v.routeId === deleteTarget.id
            ? { ...v, routeId: "", routeName: "" }
            : v
        )
      );
      toast.success(`Route "${deleteTarget.label}" deleted.`);
    } else if (deleteTarget.type === "vehicles") {
      setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      toast.success(`Vehicle "${deleteTarget.label}" removed from fleet.`);
    } else {
      setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success(
        `Student assignment for "${deleteTarget.label}" removed.`
      );
    }
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleOpenPrimaryAdd = () => {
    if (activeTab === "routes") {
      setEditingRoute(null);
      setRouteModalOpen(true);
    } else if (activeTab === "vehicles") {
      setEditingVehicle(null);
      setVehicleModalOpen(true);
    } else {
      setEditingAssignment(null);
      setAssignmentModalOpen(true);
    }
  };

  const handlePrint = () => {
    printTransportOverview(routes, vehicles, assignments);
    toast.info("Opening print preview for transport register…");
  };

  const handleExportPdf = () => {
    if (activeTab === "routes") {
      exportTransportRoutesPdf(routes, vehicles, assignments);
      toast.success(`Routes register (${routes.length} routes) exported as PDF.`);
    } else if (activeTab === "vehicles") {
      exportTransportVehiclesPdf(vehicles);
      toast.success(
        `Vehicles register (${vehicles.length} vehicles) exported as PDF.`
      );
    } else {
      exportTransportAssignmentsPdf(assignments, vehicles);
      toast.success(
        `Transport assignments (${assignments.length} students) exported as PDF.`
      );
    }
  };

  const handleDownloadRouteStudentsPdf = React.useCallback(
    (route: TransportRouteRecord) => {
      const matchedStudents = assignments.filter(
        (a) => a.routeId === route.id || a.routeName === route.routeName
      );
      exportRouteStudentsPdf(route, vehicles, matchedStudents);
      toast.success(
        `Downloaded route manifest PDF for ${route.routeName} — ${matchedStudents.length} students.`
      );
    },
    [vehicles, assignments]
  );

  const handleDownloadVehicleStudentsPdf = React.useCallback(
    (vehicle: TransportVehicleRecord) => {
      const matchedStudents = assignments.filter(
        (a) =>
          (vehicle.routeId && a.routeId === vehicle.routeId) ||
          (vehicle.routeName && a.routeName === vehicle.routeName)
      );
      exportVehicleStudentsPdf(vehicle, matchedStudents);
      toast.success(
        `Downloaded student manifest PDF for ${vehicle.vehicleNo} (${vehicle.model}) — ${matchedStudents.length} students.`
      );
    },
    [assignments]
  );

  const handleDownloadStudentPassPdf = React.useCallback(
    (assignment: TransportAssignmentRecord) => {
      const matchedVehicle = vehicles.find(
        (v) =>
          (assignment.routeId && v.routeId === assignment.routeId) ||
          (assignment.routeName && v.routeName === assignment.routeName)
      );
      exportStudentTransportCardPdf(assignment, matchedVehicle);
      toast.success(
        `Downloaded transport pass PDF for ${assignment.studentName} (${assignment.studentRollNo}).`
      );
    },
    [vehicles]
  );

  /* ───────────────────────── 1. Routes Table Columns ───────────────────────── */

  const routeColumns = React.useMemo<Column<TransportRouteRecord>[]>(
    () => [
      {
        key: "routeName",
        header: "Route Name",
        align: "center",
        className: "w-[32%] px-4 text-center",
        headerClassName: "w-[32%] px-4 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <p className="text-[13px] font-bold text-foreground">
              {r.routeName}
            </p>
            <span className="font-mono text-[10.5px] font-medium text-muted-foreground">
              {r.routeCode}
            </span>
          </div>
        ),
      },
      {
        key: "vehicle",
        header: "Vehicle",
        align: "center",
        className: "w-[22%] px-3 text-center",
        headerClassName: "w-[22%] px-3 text-center whitespace-nowrap",
        cell: (r) => {
          const assignedVehicles = vehicles.filter(
            (v) => v.routeId === r.id || v.routeName === r.routeName
          );
          if (assignedVehicles.length === 0) {
            return (
              <span className="text-xs font-medium text-muted-foreground">
                —
              </span>
            );
          }
          return (
            <div className="flex flex-wrap items-center justify-center gap-1">
              {assignedVehicles.map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200/90 bg-slate-100/80 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]"
                >
                  <Bus className="size-3 text-slate-500" />
                  {v.vehicleNo}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        key: "students",
        header: "Students",
        align: "center",
        className: "w-[14%] px-3 text-center",
        headerClassName: "w-[14%] px-3 text-center whitespace-nowrap",
        cell: (r) => {
          const count = assignments.filter(
            (a) => a.routeId === r.id || a.routeName === r.routeName
          ).length;
          return (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700">
              {count}
            </span>
          );
        },
      },
      {
        key: "monthlyFare",
        header: "Monthly Fare",
        align: "center",
        className: "w-[16%] px-3 text-center",
        headerClassName: "w-[16%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <span className="font-mono text-sm font-extrabold tabular-nums text-[#091d3e]">
            Rs {formatNumber(r.monthlyFare)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[16%] px-3 text-center",
        headerClassName: "w-[16%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1.5">
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-slate-50/80 text-[#091d3e] hover:border-[#091d3e] hover:bg-[#091d3e] hover:text-white transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Download route manifest PDF for ${r.routeName}`}
              aria-label={`Download route manifest PDF for ${r.routeName}`}
              onClick={() => handleDownloadRouteStudentsPdf(r)}
            >
              <FileDown className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Edit ${r.routeName}`}
              aria-label={`Edit ${r.routeName}`}
              onClick={() => {
                setEditingRoute(r);
                setRouteModalOpen(true);
              }}
            >
              <Edit className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Delete ${r.routeName}`}
              aria-label={`Delete ${r.routeName}`}
              onClick={() =>
                setDeleteTarget({
                  type: "routes",
                  id: r.id,
                  label: r.routeName,
                })
              }
            >
              <Trash2 className="size-3.5" />
            </ActionButton>
          </div>
        ),
      },
    ],
    [vehicles, assignments, handleDownloadRouteStudentsPdf]
  );

  /* ───────────────────────── 2. Vehicles Table Columns ───────────────────────── */

  const vehicleColumns = React.useMemo<Column<TransportVehicleRecord>[]>(
    () => [
      {
        key: "vehicleNo",
        header: "Vehicle No",
        align: "center",
        className: "w-[14%] px-3 text-center",
        headerClassName: "w-[14%] px-3 text-center whitespace-nowrap",
        cell: (v) => (
          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-slate-300/90 bg-slate-100/90 px-2.5 py-0.5 font-mono text-xs font-extrabold tracking-wide text-[#091d3e]">
              {v.vehicleNo}
            </span>
            <span className="font-mono text-[10px] font-medium text-muted-foreground">
              {v.vehicleCode}
            </span>
          </div>
        ),
      },
      {
        key: "model",
        header: "Model",
        align: "center",
        className: "w-[20%] px-3 text-center",
        headerClassName: "w-[20%] px-3 text-center whitespace-nowrap",
        cell: (v) => (
          <span className="text-[13px] font-bold text-foreground">
            {v.model}
          </span>
        ),
      },
      {
        key: "driver",
        header: "Driver",
        align: "center",
        className: "w-[22%] px-3 text-center",
        headerClassName: "w-[22%] px-3 text-center whitespace-nowrap",
        cell: (v) => (
          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <span className="text-[13px] font-bold text-[#091d3e]">
              {v.driverName || "—"}
            </span>
            {v.driverPhone ? (
              <span className="font-mono text-[10.5px] font-medium text-muted-foreground">
                {v.driverPhone}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "capacity",
        header: "Capacity",
        align: "center",
        className: "w-[10%] px-2 text-center",
        headerClassName: "w-[10%] px-2 text-center whitespace-nowrap",
        cell: (v) => (
          <span className="font-mono text-sm font-extrabold tabular-nums text-[#091d3e]">
            {formatNumber(v.capacity)}
          </span>
        ),
      },
      {
        key: "route",
        header: "Route",
        align: "center",
        className: "w-[22%] px-3 text-center",
        headerClassName: "w-[22%] px-3 text-center whitespace-nowrap",
        cell: (v) =>
          v.routeName ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <Navigation className="size-3 shrink-0 text-[#091d3e]" />
              <span className="truncate">{v.routeName}</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">—</span>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[12%] px-3 text-center",
        headerClassName: "w-[12%] px-3 text-center whitespace-nowrap",
        cell: (v) => (
          <div className="flex items-center justify-center gap-1.5">
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-slate-50/80 text-[#091d3e] hover:border-[#091d3e] hover:bg-[#091d3e] hover:text-white transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Download student manifest PDF for ${v.vehicleNo} (${v.model})`}
              aria-label={`Download student manifest PDF for ${v.vehicleNo}`}
              onClick={() => handleDownloadVehicleStudentsPdf(v)}
            >
              <FileDown className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Edit vehicle ${v.vehicleNo}`}
              aria-label={`Edit vehicle ${v.vehicleNo}`}
              onClick={() => {
                setEditingVehicle(v);
                setVehicleModalOpen(true);
              }}
            >
              <Edit className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Delete vehicle ${v.vehicleNo}`}
              aria-label={`Delete vehicle ${v.vehicleNo}`}
              onClick={() =>
                setDeleteTarget({
                  type: "vehicles",
                  id: v.id,
                  label: v.vehicleNo,
                })
              }
            >
              <Trash2 className="size-3.5" />
            </ActionButton>
          </div>
        ),
      },
    ],
    [handleDownloadVehicleStudentsPdf]
  );

  const vehicleFilters = React.useMemo<FilterDef<TransportVehicleRecord>[]>(
    () => [
      {
        key: "route",
        label: "Route",
        allLabel: "All Routes",
        options: [
          ...routes.map((r) => r.routeName),
          "Unassigned",
        ],
        getValue: (v) => v.routeName || "Unassigned",
      },
    ],
    [routes]
  );

  /* ───────────────────────── 3. Transport Assignments Columns ───────────────────────── */

  const assignmentColumns = React.useMemo<Column<TransportAssignmentRecord>[]>(
    () => [
      {
        key: "studentName",
        header: "Name",
        align: "center",
        className: "w-[18%] px-3 text-center",
        headerClassName: "w-[18%] px-3 text-center whitespace-nowrap",
        cell: (a) => (
          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <p className="text-[13px] font-bold text-foreground">
              {a.studentName}
            </p>
            <span className="font-mono text-[10.5px] font-medium text-muted-foreground">
              {a.studentRollNo} · {a.className}
            </span>
          </div>
        ),
      },
      {
        key: "routeName",
        header: "Route",
        align: "center",
        className: "w-[18%] px-3 text-center",
        headerClassName: "w-[18%] px-3 text-center whitespace-nowrap",
        cell: (a) => (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Navigation className="size-3 shrink-0 text-[#091d3e]" />
            <span className="truncate">{a.routeName}</span>
          </span>
        ),
      },
      {
        key: "busName",
        header: "Bus Name",
        align: "center",
        className: "w-[16%] px-3 text-center",
        headerClassName: "w-[16%] px-3 text-center whitespace-nowrap",
        cell: (a) => {
          const v = vehicles.find(
            (veh) =>
              (a.routeId && veh.routeId === a.routeId) ||
              (a.routeName && veh.routeName === a.routeName)
          );
          const busModel = a.busName || v?.model || "—";
          const plate = a.vehicleNo || v?.vehicleNo;

          if (!busModel || busModel === "—") {
            return (
              <span className="text-xs font-medium text-muted-foreground">—</span>
            );
          }

          return (
            <div className="flex flex-col items-center justify-center gap-0.5 text-center">
              <span className="text-[12.5px] font-bold text-foreground">
                {busModel}
              </span>
              {plate && (
                <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-bold text-[#091d3e]">
                  <Bus className="size-3 text-slate-400" />
                  {plate}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "driverName",
        header: "Driver Name",
        align: "center",
        className: "w-[15%] px-3 text-center",
        headerClassName: "w-[15%] px-3 text-center whitespace-nowrap",
        cell: (a) => {
          const v = vehicles.find(
            (veh) =>
              (a.routeId && veh.routeId === a.routeId) ||
              (a.routeName && veh.routeName === a.routeName)
          );
          const driver = a.driverName || v?.driverName || "—";
          const phone = a.driverPhone || v?.driverPhone;

          if (!driver || driver === "—") {
            return (
              <span className="text-xs font-medium text-muted-foreground">—</span>
            );
          }

          return (
            <div className="flex flex-col items-center justify-center gap-0.5 text-center">
              <span className="text-[12.5px] font-bold text-[#091d3e]">
                {driver}
              </span>
              {phone && (
                <span className="font-mono text-[10.5px] font-medium text-muted-foreground">
                  {phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "boardingStop",
        header: "Boarding Stop",
        align: "center",
        className: "w-[13%] px-3 text-center",
        headerClassName: "w-[13%] px-3 text-center whitespace-nowrap",
        cell: (a) => (
          <div className="flex items-center justify-center gap-1 text-xs font-semibold text-foreground">
            <MapPin className="size-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{a.boardingStop}</span>
          </div>
        ),
      },
      {
        key: "monthlyFare",
        header: "Monthly Fare",
        align: "center",
        className: "w-[9%] px-2 text-center",
        headerClassName: "w-[9%] px-2 text-center whitespace-nowrap",
        cell: (a) => (
          <span className="font-mono text-sm font-extrabold tabular-nums text-[#091d3e]">
            Rs {formatNumber(a.monthlyFare)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[11%] px-2 text-center",
        headerClassName: "w-[11%] px-2 text-center whitespace-nowrap",
        cell: (a) => (
          <div className="flex items-center justify-center gap-1.5">
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-slate-50/80 text-[#091d3e] hover:border-[#091d3e] hover:bg-[#091d3e] hover:text-white transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Download transport pass PDF for ${a.studentName}`}
              aria-label={`Download transport pass PDF for ${a.studentName}`}
              onClick={() => handleDownloadStudentPassPdf(a)}
            >
              <FileDown className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Edit assignment for ${a.studentName}`}
              aria-label={`Edit assignment for ${a.studentName}`}
              onClick={() => {
                setEditingAssignment(a);
                setAssignmentModalOpen(true);
              }}
            >
              <Edit className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              className="h-7 w-7 p-0 rounded-md border-slate-200/90 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-2xs [&_svg]:size-3.5"
              title={`Remove ${a.studentName} from route`}
              aria-label={`Remove ${a.studentName} from route`}
              onClick={() =>
                setDeleteTarget({
                  type: "assignments",
                  id: a.id,
                  label: a.studentName,
                })
              }
            >
              <Trash2 className="size-3.5" />
            </ActionButton>
          </div>
        ),
      },
    ],
    [vehicles, handleDownloadStudentPassPdf]
  );

  const assignmentFilters = React.useMemo<
    FilterDef<TransportAssignmentRecord>[]
  >(
    () => [
      {
        key: "route",
        label: "Route",
        allLabel: "All Routes",
        options: routes.map((r) => r.routeName),
        getValue: (a) => a.routeName,
      },
      {
        key: "bus",
        label: "Bus",
        allLabel: "All Buses",
        options: Array.from(
          new Set(
            vehicles.map((v) => v.model).filter(Boolean)
          )
        ),
        getValue: (a) => {
          const v = vehicles.find(
            (veh) =>
              (a.routeId && veh.routeId === a.routeId) ||
              (a.routeName && veh.routeName === a.routeName)
          );
          return a.busName || v?.model || "Unassigned";
        },
      },
    ],
    [routes, vehicles]
  );

  const primaryButtonLabel =
    activeTab === "routes"
      ? "Add Route"
      : activeTab === "vehicles"
      ? "Add Vehicle"
      : "Assign Student";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transport Management"
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
              onClick={handleOpenPrimaryAdd}
            >
              <Plus />
              <span>{primaryButtonLabel}</span>
            </ActionButton>
          </>
        }
      />

      {/* Executive KPI Cards */}
      <StatGrid>
        <StatCard
          label="Routes"
          value={formatNumber(kpis.totalRoutes)}
          title={`${kpis.totalRoutes} active school transport routes`}
          icon={Navigation}
        />
        <StatCard
          label="Vehicles"
          value={formatNumber(kpis.totalVehicles)}
          title={`${kpis.totalVehicles} vehicles · ${formatNumber(
            kpis.totalCapacity
          )} total seats`}
          icon={Bus}
        />
        <StatCard
          label="Transport Assignments"
          value={formatNumber(kpis.totalAssignedStudents)}
          title={`${kpis.totalAssignedStudents} students assigned to transport routes`}
          icon={Users}
        />
        <StatCard
          label="Monthly Transport Fee"
          value={`Rs ${formatNumber(kpis.monthlyRevenue)}`}
          title={`Monthly recurring fare across ${kpis.totalAssignedStudents} assigned students`}
          icon={Wallet}
        />
      </StatGrid>

      {/* Executive Register Dropdown Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
        {/* Clean & Professional Register Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Select Transport Register"
            className="group inline-flex h-9 items-center gap-2.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 px-3.5 text-xs font-semibold text-foreground shadow-2xs hover:border-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
          >
            {activeTab === "routes" ? (
              <Navigation className="size-4 text-[#091d3e]" />
            ) : activeTab === "vehicles" ? (
              <Bus className="size-4 text-[#091d3e]" />
            ) : (
              <GraduationCap className="size-4 text-[#091d3e]" />
            )}
            <span>
              {activeTab === "routes"
                ? "Routes Register"
                : activeTab === "vehicles"
                ? "Vehicles Register"
                : "Transport Assignments"}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-56 p-1 rounded-xl shadow-lg border border-slate-200 bg-white text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-100"
          >
            <DropdownMenuItem
              onClick={() => setActiveTab("routes")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors outline-none",
                activeTab === "routes"
                  ? "bg-slate-100 font-semibold text-foreground"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <Navigation className="size-4 text-slate-500" />
                <span>Routes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] font-bold rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {routes.length}
                </span>
                {activeTab === "routes" && (
                  <Check className="size-3.5 text-foreground" />
                )}
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setActiveTab("vehicles")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors outline-none",
                activeTab === "vehicles"
                  ? "bg-slate-100 font-semibold text-foreground"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <Bus className="size-4 text-slate-500" />
                <span>Vehicles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] font-bold rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {vehicles.length}
                </span>
                {activeTab === "vehicles" && (
                  <Check className="size-3.5 text-foreground" />
                )}
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setActiveTab("assignments")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors outline-none",
                activeTab === "assignments"
                  ? "bg-slate-100 font-semibold text-foreground"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-slate-500" />
                <span>Transport Assignments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] font-bold rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {assignments.length}
                </span>
                {activeTab === "assignments" && (
                  <Check className="size-3.5 text-foreground" />
                )}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tab 1: Routes Table */}
      {activeTab === "routes" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={routes}
            columns={routeColumns}
            getRowId={(r) => r.id}
            tableClassName="min-w-[820px] table-fixed"
            searchPlaceholder="Search route name, code or monthly fare…"
            searchFn={(r, q) =>
              r.routeName.toLowerCase().includes(q) ||
              r.routeCode.toLowerCase().includes(q) ||
              String(r.monthlyFare).includes(q)
            }
            pageSize={8}
            emptyMessage="No transport routes found."
          />
        </SectionCard>
      )}

      {/* Tab 2: Vehicles Table */}
      {activeTab === "vehicles" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={vehicles}
            columns={vehicleColumns}
            getRowId={(v) => v.id}
            filters={vehicleFilters}
            tableClassName="min-w-[840px] table-fixed"
            searchPlaceholder="Search vehicle number, model, driver or assigned route…"
            searchFn={(v, q) =>
              v.vehicleNo.toLowerCase().includes(q) ||
              v.model.toLowerCase().includes(q) ||
              v.driverName.toLowerCase().includes(q) ||
              (v.driverPhone?.toLowerCase().includes(q) ?? false) ||
              v.routeName.toLowerCase().includes(q) ||
              v.vehicleCode.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No fleet vehicles match your search."
          />
        </SectionCard>
      )}

      {/* Tab 3: Transport Assignments Table */}
      {activeTab === "assignments" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={assignments}
            columns={assignmentColumns}
            getRowId={(a) => a.id}
            filters={assignmentFilters}
            tableClassName="min-w-[980px] table-fixed"
            searchPlaceholder="Search student, roll no, bus name, driver, route or stop…"
            searchFn={(a, q) => {
              const v = vehicles.find(
                (veh) =>
                  (a.routeId && veh.routeId === a.routeId) ||
                  (a.routeName && veh.routeName === a.routeName)
              );
              const bus = (a.busName || v?.model || "").toLowerCase();
              const vehNo = (a.vehicleNo || v?.vehicleNo || "").toLowerCase();
              const driver = (a.driverName || v?.driverName || "").toLowerCase();
              const phone = (a.driverPhone || v?.driverPhone || "").toLowerCase();

              return (
                a.studentName.toLowerCase().includes(q) ||
                a.studentRollNo.toLowerCase().includes(q) ||
                a.className.toLowerCase().includes(q) ||
                a.routeName.toLowerCase().includes(q) ||
                a.boardingStop.toLowerCase().includes(q) ||
                bus.includes(q) ||
                vehNo.includes(q) ||
                driver.includes(q) ||
                phone.includes(q)
              );
            }}
            pageSize={8}
            emptyMessage="No student transport assignments found."
          />
        </SectionCard>
      )}

      {/* 1. Add / Edit Route Modal */}
      <RouteFormModal
        open={routeModalOpen}
        onOpenChange={(open) => {
          setRouteModalOpen(open);
          if (!open) setEditingRoute(null);
        }}
        totalCount={routes.length}
        initialData={editingRoute}
        onSave={handleSaveRoute}
      />

      {/* 2. Add / Edit Vehicle Modal */}
      <VehicleFormModal
        open={vehicleModalOpen}
        onOpenChange={(open) => {
          setVehicleModalOpen(open);
          if (!open) setEditingVehicle(null);
        }}
        totalCount={vehicles.length}
        routes={routes}
        initialData={editingVehicle}
        onSave={handleSaveVehicle}
      />

      {/* 3. Assign Student / Edit Assignment Modal */}
      <AssignmentFormModal
        open={assignmentModalOpen}
        onOpenChange={(open) => {
          setAssignmentModalOpen(open);
          if (!open) setEditingAssignment(null);
        }}
        totalCount={assignments.length}
        routes={routes}
        vehicles={vehicles}
        initialData={editingAssignment}
        onSave={handleSaveAssignment}
      />

      {/* 4. Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === "routes"
            ? "Delete Transport Route"
            : deleteTarget?.type === "vehicles"
            ? "Delete Fleet Vehicle"
            : "Remove Student Assignment"
        }
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.label}"? This action will immediately update the transport register.`
            : ""
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
