"use client";

import * as React from "react";
import {
  Bus,
  Check,
  ChevronDown,
  Download,
  Eye,
  Fuel,
  GraduationCap,
  MapPin,
  Navigation,
  Plus,
  Printer,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
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
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from "@/lib/format";
import {
  INITIAL_FLEET_VEHICLES,
  INITIAL_STUDENT_ALLOCATIONS,
  INITIAL_TRANSPORT_DRIVERS,
  INITIAL_TRANSPORT_ROUTES,
  type AllocationStatus,
  type DriverDutyStatus,
  type FleetVehicleRecord,
  type FleetVehicleStatus,
  type RouteStatus,
  type RouteStopEntry,
  type StudentTransportAllocationRecord,
  type TransportDriverRecord,
  type TransportRouteRecord,
} from "@/lib/mock/transport";
import {
  exportDriversPdf,
  exportFleetPdf,
  exportRoutesPdf,
  exportStudentAllocationsPdf,
  printTransportRoutesRegister,
} from "./transport-export";
import {
  DriverViewModal,
  FleetVehicleViewModal,
  StudentAllocationViewModal,
  TransportRouteViewModal,
} from "./transport-view-modals";
import {
  DriverFormModal,
  FleetVehicleFormModal,
  StudentAllocationFormModal,
  TransportRouteFormModal,
} from "./transport-form-modals";

type TransportViewTab = "routes" | "fleet" | "drivers" | "allocations";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

export function TransportClient() {
  const [activeTab, setActiveTab] =
    React.useState<TransportViewTab>("routes");

  const [routes, setRoutes] = React.useState<TransportRouteRecord[]>(
    INITIAL_TRANSPORT_ROUTES
  );
  const [vehicles, setVehicles] = React.useState<FleetVehicleRecord[]>(
    INITIAL_FLEET_VEHICLES
  );
  const [drivers, setDrivers] = React.useState<TransportDriverRecord[]>(
    INITIAL_TRANSPORT_DRIVERS
  );
  const [allocations, setAllocations] = React.useState<
    StudentTransportAllocationRecord[]
  >(INITIAL_STUDENT_ALLOCATIONS);

  // Route View & Create/Edit Modals
  const [selectedRouteId, setSelectedRouteId] = React.useState<string | null>(
    null
  );
  const [routeViewOpen, setRouteViewOpen] = React.useState(false);
  const [routeFormOpen, setRouteFormOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] =
    React.useState<TransportRouteRecord | null>(null);

  // Vehicle View & Create Modals
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<
    string | null
  >(null);
  const [vehicleViewOpen, setVehicleViewOpen] = React.useState(false);
  const [vehicleFormOpen, setVehicleFormOpen] = React.useState(false);

  // Driver View & Create Modals
  const [selectedDriverId, setSelectedDriverId] = React.useState<
    string | null
  >(null);
  const [driverViewOpen, setDriverViewOpen] = React.useState(false);
  const [driverFormOpen, setDriverFormOpen] = React.useState(false);

  // Student Allocation View & Create Modals
  const [selectedAllocationId, setSelectedAllocationId] = React.useState<
    string | null
  >(null);
  const [allocationViewOpen, setAllocationViewOpen] = React.useState(false);
  const [allocationFormOpen, setAllocationFormOpen] = React.useState(false);

  const selectedRoute = React.useMemo(
    () => routes.find((r) => r.id === selectedRouteId) ?? null,
    [routes, selectedRouteId]
  );

  const selectedVehicle = React.useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId]
  );

  const selectedDriver = React.useMemo(
    () => drivers.find((d) => d.id === selectedDriverId) ?? null,
    [drivers, selectedDriverId]
  );

  const selectedAllocation = React.useMemo(
    () => allocations.find((a) => a.id === selectedAllocationId) ?? null,
    [allocations, selectedAllocationId]
  );

  /* ───────────────────────── Dynamic KPI Aggregates ───────────────────────── */

  const routeKpis = React.useMemo(() => {
    const totalStops = routes.reduce((s, r) => s + r.stops.length, 0);
    const totalSeats = routes.reduce((s, r) => s + r.seatCapacity, 0);
    const totalRiders = routes.reduce((s, r) => s + r.allocatedStudents, 0);
    const monthlyRevenue = routes.reduce(
      (s, r) => s + r.allocatedStudents * r.monthlyRouteFee,
      0
    );
    const utilPct = Math.round(
      (totalRiders / Math.max(1, totalSeats)) * 100
    );
    return {
      totalRoutes: routes.length,
      totalStops,
      totalSeats,
      totalRiders,
      monthlyRevenue,
      utilPct,
    };
  }, [routes]);

  const fleetKpis = React.useMemo(() => {
    const activeCount = vehicles.filter(
      (v) => v.status === "Operational" || v.status === "On Route"
    ).length;
    const maintCount = vehicles.filter(
      (v) => v.status === "In Maintenance"
    ).length;
    const totalCapacity = vehicles.reduce((s, v) => s + v.seatingCapacity, 0);
    const totalFuelCost = vehicles.reduce((s, v) => s + v.monthlyFuelCost, 0);
    return {
      totalVehicles: vehicles.length,
      activeCount,
      maintCount,
      totalCapacity,
      totalFuelCost,
    };
  }, [vehicles]);

  const driverKpis = React.useMemo(() => {
    const onDutyCount = drivers.filter(
      (d) => d.status === "On Duty" || d.status === "Active"
    ).length;
    const avgExp = Math.round(
      drivers.reduce((s, d) => s + d.experienceYears, 0) /
        Math.max(1, drivers.length)
    );
    return {
      totalDrivers: drivers.length,
      onDutyCount,
      avgExp,
    };
  }, [drivers]);

  const allocationKpis = React.useMemo(() => {
    const allocatedCount = allocations.filter(
      (a) => a.status === "Allocated"
    ).length;
    const waitlistCount = allocations.filter(
      (a) => a.status === "Waitlisted"
    ).length;
    const paidPassRevenue = allocations
      .filter((a) => a.feeStatus === "Paid")
      .reduce((s, a) => s + a.monthlyTransportFee, 0);
    return {
      totalPasses: allocations.length,
      allocatedCount,
      waitlistCount,
      paidPassRevenue,
    };
  }, [allocations]);

  /* ───────────────────────── Interactive Handlers ───────────────────────── */

  const handleUpdateRoute = React.useCallback(
    (
      routeId: string,
      payload: {
        status: RouteStatus;
        vehicleRegNo: string;
        driverName: string;
      }
    ) => {
      setRoutes((prev) =>
        prev.map((r) => (r.id === routeId ? { ...r, ...payload } : r))
      );
      toast.success("Route dispatch & operational status updated.");
    },
    []
  );

  const handleAddStop = React.useCallback(
    (routeId: string, newStop: RouteStopEntry) => {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                stops: [...r.stops, newStop],
                allocatedStudents: Math.min(
                  r.seatCapacity,
                  r.allocatedStudents + newStop.studentsCount
                ),
              }
            : r
        )
      );
      toast.success(`Stop "${newStop.stopName}" added to route schedule.`);
    },
    []
  );

  const handleSaveRoute = React.useCallback((record: TransportRouteRecord) => {
    setRoutes((prev) => {
      const exists = prev.some((r) => r.id === record.id);
      return exists
        ? prev.map((r) => (r.id === record.id ? record : r))
        : [record, ...prev];
    });
  }, []);

  const handleUpdateVehicleStatus = React.useCallback(
    (
      vehicleId: string,
      status: FleetVehicleStatus,
      lastServiceDate: string
    ) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId ? { ...v, status, lastServiceDate } : v
        )
      );
      toast.success(`Fleet vehicle status updated to ${status}.`);
    },
    []
  );

  const handleCreateVehicle = React.useCallback(
    (newVehicle: FleetVehicleRecord) => {
      setVehicles((prev) => [newVehicle, ...prev]);
    },
    []
  );

  const handleUpdateDriverStatus = React.useCallback(
    (id: string, status: DriverDutyStatus) => {
      setDrivers((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
      toast.success(`Driver roster status updated to ${status}.`);
    },
    []
  );

  const handleCreateDriver = React.useCallback(
    (newDriver: TransportDriverRecord) => {
      setDrivers((prev) => [newDriver, ...prev]);
    },
    []
  );

  const handleUpdateAllocation = React.useCallback(
    (
      id: string,
      status: AllocationStatus,
      feeStatus: "Paid" | "Pending"
    ) => {
      setAllocations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status, feeStatus } : a))
      );
      toast.success("Student transport pass updated.");
    },
    []
  );

  const handleCreateAllocation = React.useCallback(
    (newAlloc: StudentTransportAllocationRecord) => {
      setAllocations((prev) => [newAlloc, ...prev]);
      setRoutes((prev) =>
        prev.map((r) =>
          r.routeCode === newAlloc.routeCode
            ? {
                ...r,
                allocatedStudents: Math.min(
                  r.seatCapacity,
                  r.allocatedStudents + 1
                ),
              }
            : r
        )
      );
    },
    []
  );

  /* ───────────────────────── 1. Routes & Stops Columns ───────────────────────── */

  const routeColumns = React.useMemo<Column<TransportRouteRecord>[]>(
    () => [
      {
        key: "routeCode",
        header: "Route Code",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.routeCode}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.distanceKm} km · {r.stops.length} Stops
            </p>
          </div>
        ),
      },
      {
        key: "routeName",
        header: "Route Corridor & Stops",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[245px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.routeName}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              Origin: {r.stops[0]?.stopName} ({r.morningDeparture})
            </p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus & Vehicle",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="font-mono text-[10.5px] text-brand font-semibold">
              {r.vehicleRegNo}
            </p>
          </div>
        ),
      },
      {
        key: "driver",
        header: "Assigned Driver",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[190px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.driverName}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.driverPhone}
            </p>
          </div>
        ),
      },
      {
        key: "occupancy",
        header: "Seat Occupancy",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-[#091d3e]">
              {r.allocatedStudents} / {r.seatCapacity} Seats
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {Math.round(
                (r.allocatedStudents / Math.max(1, r.seatCapacity)) * 100
              )}
              % Occupied
            </p>
          </div>
        ),
      },
      {
        key: "fee",
        header: "Monthly Pass Fee",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.monthlyRouteFee)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              GPS: {r.gpsTrackerId}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
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
              title="View timed stops schedule, crew & dispatch status"
              onClick={() => {
                setSelectedRouteId(r.id);
                setRouteViewOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const routeFilters = React.useMemo<FilterDef<TransportRouteRecord>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: CAMPUS_OPTIONS,
        getValue: (r) => r.campus,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["On Route", "Active", "Standby"],
        getValue: (r) => r.status,
      },
    ],
    []
  );

  /* ───────────────────────── 2. Vehicle Fleet Columns ───────────────────────── */

  const fleetColumns = React.useMemo<Column<FleetVehicleRecord>[]>(
    () => [
      {
        key: "registrationNo",
        header: "Reg # / Fleet ID",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.registrationNo}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.vehicleCode} · {r.gpsDeviceCode}
            </p>
          </div>
        ),
      },
      {
        key: "makeModel",
        header: "Make, Model & Classification",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[235px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.makeModel}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.vehicleType} · {r.fuelType}
            </p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus & Route",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="font-mono text-[10.5px] text-brand">
              {r.assignedRouteCode}
            </p>
          </div>
        ),
      },
      {
        key: "driver",
        header: "Assigned Driver",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.assignedDriver}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              Odometer: {r.odometerKm.toLocaleString()} km
            </p>
          </div>
        ),
      },
      {
        key: "capacity",
        header: "Seat Load",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold text-[#091d3e]">
              {r.occupiedSeats} / {r.seatingCapacity} Seats
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              Fitness: {formatDate(r.fitnessExpiry)}
            </p>
          </div>
        ),
      },
      {
        key: "fuel",
        header: "Monthly Fuel",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.monthlyFuelCost)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {r.monthlyFuelLitres} Litres / Mo
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Fleet Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
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
              title="View vehicle telemetry, fitness certificate & workshop log"
              onClick={() => {
                setSelectedVehicleId(r.id);
                setVehicleViewOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  /* ───────────────────────── 3. Driver Assignments Columns ───────────────────────── */

  const driverColumns = React.useMemo<Column<TransportDriverRecord>[]>(
    () => [
      {
        key: "driverCode",
        header: "Driver ID",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.driverCode}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.experienceYears} Yrs Exp
            </p>
          </div>
        ),
      },
      {
        key: "fullName",
        header: "Driver Name & CNIC",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.fullName}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              CNIC: {r.cnic}
            </p>
          </div>
        ),
      },
      {
        key: "license",
        header: "HTV / PSV License",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold text-[#091d3e]">
              {r.htvLicenseNo}
            </span>
            <p className="text-[10px] text-muted-foreground">
              {r.licenseCategory} · Exp {formatDate(r.licenseExpiry)}
            </p>
          </div>
        ),
      },
      {
        key: "assignment",
        header: "Campus, Bus & Route",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.campus} · {r.assignedVehicleReg}
            </p>
            <p className="font-mono text-[10.5px] text-brand">
              {r.assignedRouteCode} · Conductor: {r.conductorName}
            </p>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Contact & Shift",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold text-foreground">
              {r.phone}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {r.shiftTiming}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Duty Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
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
              title="View driver HTV license, police vetting & duty status"
              onClick={() => {
                setSelectedDriverId(r.id);
                setDriverViewOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  /* ───────────────────────── 4. Student Route Allocation Columns ───────────────────────── */

  const allocationColumns = React.useMemo<
    Column<StudentTransportAllocationRecord>[]
  >(
    () => [
      {
        key: "passNo",
        header: "Pass #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.passNo}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.seatNo}
            </p>
          </div>
        ),
      },
      {
        key: "studentName",
        header: "Student & Guardian",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.studentName}{" "}
              <span className="font-mono text-[10.5px] text-muted-foreground">
                (#{r.rollNo} · {r.className})
              </span>
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.guardianName} · {r.guardianPhone}
            </p>
          </div>
        ),
      },
      {
        key: "route",
        header: "Assigned Route & Bus",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[215px] mx-auto">
            <p className="font-mono text-xs font-bold text-[#091d3e]">
              {r.routeCode} · {r.vehicleRegNo}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.campus} · {r.routeName}
            </p>
          </div>
        ),
      },
      {
        key: "pickupStop",
        header: "Boarding Stop & Schedule",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[205px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.pickupStop}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Pickup: {r.pickupTime} · Drop: {r.dropTime}
            </p>
          </div>
        ),
      },
      {
        key: "fee",
        header: "Monthly Fee",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.monthlyTransportFee)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Challan: {r.feeStatus}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Pass Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
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
              title="View student transport pass, boarding stop & fee status"
              onClick={() => {
                setSelectedAllocationId(r.id);
                setAllocationViewOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  /* ───────────────────────── Header Export & Primary Action ───────────────────────── */

  const handlePrint = () => {
    const ok = printTransportRoutesRegister(routes);
    if (ok)
      toast.info("Opening print preview for institutional transport routes…");
    else toast.error("Pop-up blocked. Please allow pop-ups to print.");
  };

  const handleExportPdf = () => {
    if (activeTab === "routes") {
      exportRoutesPdf(routes);
      toast.success(
        `Transport routes & stops schedule (${routes.length} routes) downloaded as PDF.`
      );
    } else if (activeTab === "fleet") {
      exportFleetPdf(vehicles);
      toast.success(
        `Campus vehicle fleet register (${vehicles.length} vehicles) downloaded as PDF.`
      );
    } else if (activeTab === "drivers") {
      exportDriversPdf(drivers);
      toast.success(
        `Licensed drivers & conductors roster (${drivers.length} staff) downloaded as PDF.`
      );
    } else {
      exportStudentAllocationsPdf(allocations);
      toast.success(
        `Student transport allocations (${allocations.length} passes) downloaded as PDF.`
      );
    }
  };

  const handlePrimaryAction = () => {
    if (activeTab === "fleet") {
      setVehicleFormOpen(true);
    } else if (activeTab === "drivers") {
      setDriverFormOpen(true);
    } else if (activeTab === "allocations") {
      setAllocationFormOpen(true);
    } else {
      setEditingRoute(null);
      setRouteFormOpen(true);
    }
  };

  const primaryActionLabel =
    activeTab === "fleet"
      ? "Register Vehicle"
      : activeTab === "drivers"
      ? "Assign Driver"
      : activeTab === "allocations"
      ? "Allocate Student Pass"
      : "Create Route";

  const activeTabMeta = {
    routes: {
      label: "Routes & Stops",
      count: routes.length,
      icon: Navigation,
      subtitle: `GPS Tracked Corridors · ${routeKpis.totalStops} Timed Stops · ${routeKpis.utilPct}% Seat Occupancy`,
    },
    fleet: {
      label: "Vehicle Fleet",
      count: vehicles.length,
      icon: Bus,
      subtitle: `Institutional Buses & Coasters · ${fleetKpis.activeCount} Operational · 100% Fitness Certified`,
    },
    drivers: {
      label: "Driver Assignments",
      count: drivers.length,
      icon: UserCheck,
      subtitle: `HTV & PSV Certified Crew · ${driverKpis.onDutyCount} Active On Duty · Police Verified`,
    },
    allocations: {
      label: "Student Route Allocation",
      count: allocations.length,
      icon: GraduationCap,
      subtitle: `Enrolled Student Riders · ${allocationKpis.allocatedCount} Reserved Seats Allocated`,
    },
  }[activeTab];

  const ActiveTabIcon = activeTabMeta.icon;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transport"
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
            <ActionButton
              tone="primary"
              size="md"
              onClick={handlePrimaryAction}
            >
              <Plus />
              <span>{primaryActionLabel}</span>
            </ActionButton>
          </>
        }
      />

      {/* Dynamic 4-Card KPI Strip */}
      {activeTab === "routes" && (
        <StatGrid>
          <StatCard
            label="Active Bus Corridors"
            value={`${routeKpis.totalRoutes} Routes (${routeKpis.totalStops} Stops)`}
            icon={Navigation}
          />
          <StatCard
            label="Enrolled Route Riders"
            value={`${routeKpis.totalRiders} / ${routeKpis.totalSeats} Seats (${routeKpis.utilPct}%)`}
            icon={Users}
          />
          <StatCard
            label="Monthly Route Revenue"
            value={formatCurrencyCompact(routeKpis.monthlyRevenue)}
            icon={Wallet}
          />
          <StatCard
            label="GPS Fleet Telemetry"
            value="100% Live Tracked"
            icon={MapPin}
          />
        </StatGrid>
      )}

      {activeTab === "fleet" && (
        <StatGrid>
          <StatCard
            label="Campus Vehicle Fleet"
            value={`${fleetKpis.totalVehicles} Vehicles (${fleetKpis.totalCapacity} Seats)`}
            icon={Bus}
          />
          <StatCard
            label="Operational & On Route"
            value={`${fleetKpis.activeCount} Active · ${fleetKpis.maintCount} Workshop`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Monthly Fuel Spend (Oct)"
            value={formatCurrencyCompact(fleetKpis.totalFuelCost)}
            icon={Fuel}
          />
          <StatCard
            label="Excise & Fitness Status"
            value="100% Certified"
            icon={Navigation}
          />
        </StatGrid>
      )}

      {activeTab === "drivers" && (
        <StatGrid>
          <StatCard
            label="Licensed HTV Drivers"
            value={`${driverKpis.totalDrivers} Drivers & Crew`}
            icon={UserCheck}
          />
          <StatCard
            label="Active On-Duty Crew"
            value={`${driverKpis.onDutyCount} Dispatched`}
            icon={Bus}
          />
          <StatCard
            label="Average Driving Experience"
            value={`${driverKpis.avgExp} Years HTV`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Police & Medical Vetting"
            value="100% Cleared"
            icon={Users}
          />
        </StatGrid>
      )}

      {activeTab === "allocations" && (
        <StatGrid>
          <StatCard
            label="Issued Transport Passes"
            value={`${allocationKpis.totalPasses} Student Passes`}
            icon={GraduationCap}
          />
          <StatCard
            label="Confirmed Seat Holders"
            value={`${allocationKpis.allocatedCount} Allocated`}
            icon={UserCheck}
          />
          <StatCard
            label="Waitlisted Requests"
            value={`${allocationKpis.waitlistCount} Waitlisted`}
            icon={MapPin}
          />
          <StatCard
            label="Cleared Pass Fee (Oct)"
            value={formatCurrencyCompact(allocationKpis.paidPassRevenue)}
            icon={Wallet}
          />
        </StatGrid>
      )}

      {/* Executive Register Selector Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="group inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-semibold text-[#091d3e] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-colors hover:border-brand/35 hover:bg-brand-50/40 focus:outline-none focus:ring-2 focus:ring-brand/15">
            <ActiveTabIcon className="size-3.5 shrink-0 text-brand" />
            <span className="font-semibold text-[#091d3e]">
              {activeTabMeta.label}
            </span>
            <span className="rounded-[3px] border border-brand/15 bg-brand-50/80 px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand">
              {activeTabMeta.count}
            </span>
            <ChevronDown className="ml-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-open:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[260px] rounded-[6px] border border-brand/15 bg-white p-1 shadow-[0_10px_28px_-6px_rgb(9_29_62/0.18),0_2px_6px_rgb(9_29_62/0.06)] ring-0"
          >
            {(
              [
                {
                  key: "routes" as const,
                  label: "Routes & Stops",
                  count: routes.length,
                  icon: Navigation,
                },
                {
                  key: "fleet" as const,
                  label: "Vehicle Fleet",
                  count: vehicles.length,
                  icon: Bus,
                },
                {
                  key: "drivers" as const,
                  label: "Driver Assignments",
                  count: drivers.length,
                  icon: UserCheck,
                },
                {
                  key: "allocations" as const,
                  label: "Student Route Allocation",
                  count: allocations.length,
                  icon: GraduationCap,
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
          <span className="font-medium">{activeTabMeta.subtitle}</span>
        </div>
      </div>

      {/* Main Register DataTable */}
      {activeTab === "routes" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={routes}
            columns={routeColumns}
            getRowId={(r) => r.id}
            filters={routeFilters}
            searchPlaceholder="Search route code, corridor name, stop, vehicle reg # or driver…"
            searchFn={(r, q) =>
              r.routeCode.toLowerCase().includes(q) ||
              r.routeName.toLowerCase().includes(q) ||
              r.vehicleRegNo.toLowerCase().includes(q) ||
              r.driverName.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q) ||
              r.stops.some((s) => s.stopName.toLowerCase().includes(q))
            }
            pageSize={8}
            emptyMessage="No transport routes match the selected filters."
          />
        </SectionCard>
      )}

      {activeTab === "fleet" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={vehicles}
            columns={fleetColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search vehicle reg #, fleet code, make/model, route or driver…"
            searchFn={(r, q) =>
              r.registrationNo.toLowerCase().includes(q) ||
              r.vehicleCode.toLowerCase().includes(q) ||
              r.makeModel.toLowerCase().includes(q) ||
              r.assignedRouteCode.toLowerCase().includes(q) ||
              r.assignedDriver.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No fleet vehicles match the search query."
          />
        </SectionCard>
      )}

      {activeTab === "drivers" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={drivers}
            columns={driverColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search driver name, CNIC, HTV license #, vehicle reg # or phone…"
            searchFn={(r, q) =>
              r.driverCode.toLowerCase().includes(q) ||
              r.fullName.toLowerCase().includes(q) ||
              r.cnic.toLowerCase().includes(q) ||
              r.htvLicenseNo.toLowerCase().includes(q) ||
              r.assignedVehicleReg.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No transport drivers match the search query."
          />
        </SectionCard>
      )}

      {activeTab === "allocations" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={allocations}
            columns={allocationColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search pass #, student name, roll #, route code, pickup stop or seat #…"
            searchFn={(r, q) =>
              r.passNo.toLowerCase().includes(q) ||
              r.studentName.toLowerCase().includes(q) ||
              r.rollNo.toLowerCase().includes(q) ||
              r.routeCode.toLowerCase().includes(q) ||
              r.pickupStop.toLowerCase().includes(q) ||
              r.seatNo.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No student transport passes match the search query."
          />
        </SectionCard>
      )}

      {/* Interactive Modals */}
      <TransportRouteViewModal
        route={selectedRoute}
        open={routeViewOpen}
        onOpenChange={setRouteViewOpen}
        onUpdateRoute={handleUpdateRoute}
        onAddStop={handleAddStop}
        onEditRoute={(rt) => {
          setEditingRoute(rt);
          setRouteFormOpen(true);
        }}
      />

      <TransportRouteFormModal
        open={routeFormOpen}
        onOpenChange={setRouteFormOpen}
        initialData={editingRoute}
        totalCount={routes.length}
        onSave={handleSaveRoute}
      />

      <FleetVehicleViewModal
        vehicle={selectedVehicle}
        open={vehicleViewOpen}
        onOpenChange={setVehicleViewOpen}
        onUpdateVehicleStatus={handleUpdateVehicleStatus}
      />

      <FleetVehicleFormModal
        open={vehicleFormOpen}
        onOpenChange={setVehicleFormOpen}
        totalCount={vehicles.length}
        onSave={handleCreateVehicle}
      />

      <DriverViewModal
        driver={selectedDriver}
        open={driverViewOpen}
        onOpenChange={setDriverViewOpen}
        onUpdateDriverStatus={handleUpdateDriverStatus}
      />

      <DriverFormModal
        open={driverFormOpen}
        onOpenChange={setDriverFormOpen}
        totalCount={drivers.length}
        onSave={handleCreateDriver}
      />

      <StudentAllocationViewModal
        allocation={selectedAllocation}
        open={allocationViewOpen}
        onOpenChange={setAllocationViewOpen}
        onUpdateAllocation={handleUpdateAllocation}
      />

      <StudentAllocationFormModal
        open={allocationFormOpen}
        onOpenChange={setAllocationFormOpen}
        routes={routes}
        totalCount={allocations.length}
        onSave={handleCreateAllocation}
      />
    </div>
  );
}
