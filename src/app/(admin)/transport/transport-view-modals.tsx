"use client";

import * as React from "react";
import {
  Bus,
  Check,
  Copy,
  Download,
  Edit,
  Fuel,
  GraduationCap,
  MapPin,
  Navigation,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  AllocationStatus,
  DriverDutyStatus,
  FleetVehicleRecord,
  FleetVehicleStatus,
  RouteStatus,
  RouteStopEntry,
  StudentTransportAllocationRecord,
  TransportDriverRecord,
  TransportRouteRecord,
} from "@/lib/mock/transport";
import { exportSingleRouteCardPdf } from "./transport-export";

const fieldClass =
  "h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

/* ═══════════════════════════════════════════════════════════════════════════
   1. TRANSPORT ROUTE & TIMED STOPS VIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface TransportRouteViewModalProps {
  route: TransportRouteRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateRoute?: (
    routeId: string,
    payload: {
      status: RouteStatus;
      vehicleRegNo: string;
      driverName: string;
    }
  ) => void;
  onAddStop?: (routeId: string, newStop: RouteStopEntry) => void;
  onEditRoute?: (route: TransportRouteRecord) => void;
}

export function TransportRouteViewModal({
  route,
  open,
  onOpenChange,
  onUpdateRoute,
  onAddStop,
  onEditRoute,
}: TransportRouteViewModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "stops" | "dispatch"
  >("overview");

  const [status, setStatus] = React.useState<RouteStatus>("On Route");
  const [vehicleRegNo, setVehicleRegNo] = React.useState("");
  const [driverName, setDriverName] = React.useState("");

  // Add Stop inputs
  const [stopName, setStopName] = React.useState("");
  const [landmark, setLandmark] = React.useState("");
  const [morningPickup, setMorningPickup] = React.useState("07:15 AM");
  const [afternoonDrop, setAfternoonDrop] = React.useState("02:25 PM");
  const [studentsCount, setStudentsCount] = React.useState("");

  React.useEffect(() => {
    if (open && route) {
      setActiveTab("overview");
      setStatus(route.status);
      setVehicleRegNo(route.vehicleRegNo);
      setDriverName(route.driverName);
      setStopName("");
      setLandmark("");
      setStudentsCount("");
    }
  }, [open, route]);

  if (!route) return null;

  const occupancyPct = Math.min(
    100,
    Math.round((route.allocatedStudents / Math.max(1, route.seatCapacity)) * 100)
  );

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, { description: text });
    }
  };

  const handleAddStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopName.trim()) {
      toast.error("Please enter the stop name.");
      return;
    }
    if (onAddStop) {
      onAddStop(route.id, {
        stopOrder: route.stops.length + 1,
        stopName: stopName.trim(),
        landmark: landmark.trim() || "Main Service Road Bus Bay",
        morningPickup: morningPickup.trim() || "07:15 AM",
        afternoonDrop: afternoonDrop.trim() || "02:25 PM",
        studentsCount: Math.max(1, Number(studentsCount) || 4),
      });
      setStopName("");
      setLandmark("");
      setStudentsCount("");
    }
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateRoute) {
      onUpdateRoute(route.id, {
        status,
        vehicleRegNo: vehicleRegNo.trim() || route.vehicleRegNo,
        driverName: driverName.trim() || route.driverName,
      });
      setActiveTab("overview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-3xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Header */}
        <DialogHeader className="shrink-0 gap-1 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4.5">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white shadow-xs">
                <Navigation className="size-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-tight text-foreground">
                  {route.routeName}
                </DialogTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={route.status} />
                  <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                    {route.routeCode}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                    {route.vehicleRegNo}
                  </span>
                  <DialogDescription className="font-mono text-xs text-muted-foreground">
                    {route.campus} · {route.distanceKm} km Corridor
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                GPS Telemetry ID
              </p>
              <button
                type="button"
                onClick={() => handleCopy(route.gpsTrackerId, "GPS Tracker ID")}
                className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e] hover:border-brand/40 cursor-pointer"
              >
                <span>{route.gpsTrackerId}</span>
                <Copy className="size-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* 4-Column Operational Strip */}
        <dl className="grid shrink-0 grid-cols-2 divide-x divide-y divide-border/70 border-y border-border/70 bg-slate-50/70 sm:grid-cols-4 sm:divide-y-0">
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Seat Occupancy
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-foreground">
              {route.allocatedStudents} / {route.seatCapacity} Seats (
              {occupancyPct}%)
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Morning Run
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-[#091d3e]">
              {route.morningDeparture} → {route.campusArrival}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Designated Stops
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-foreground">
              {route.stops.length} Timed Stops
            </dd>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50/45">
            <dt className="text-[11px] font-semibold text-emerald-800">
              Monthly Route Fee
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-extrabold text-emerald-700">
              {formatCurrency(route.monthlyRouteFee)} / Student
            </dd>
          </div>
        </dl>

        {/* Sub-Tabs */}
        <div className="flex shrink-0 items-center gap-1 border-b border-border/70 bg-white px-6 pt-2">
          {(
            [
              {
                key: "overview",
                label: "Route & Crew Overview",
                icon: Bus,
              },
              {
                key: "stops",
                label: `Timed Stops Schedule (${route.stops.length})`,
                icon: MapPin,
              },
              {
                key: "dispatch",
                label: "Dispatch & Status Control",
                icon: ShieldCheck,
              },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer",
                  active
                    ? "border-[#091d3e] text-[#091d3e]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === "overview" && (
            <>
              <div className="rounded-xl border border-border/80 bg-slate-50/50 p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-muted-foreground">
                    Student Seat Utilization ({route.allocatedStudents} of{" "}
                    {route.seatCapacity} seats allocated)
                  </span>
                  <span className="font-mono font-bold text-[#091d3e]">
                    {route.seatCapacity - route.allocatedStudents} Seats Vacant
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs space-y-2 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[#091d3e] border-b border-border/60 pb-2">
                    Assigned Fleet Vehicle
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Registration #:
                    </span>
                    <span className="font-mono font-bold text-[#091d3e]">
                      {route.vehicleRegNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Make & Model:</span>
                    <span className="font-semibold text-foreground">
                      {route.vehicleModel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      One-Way Distance:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {route.distanceKm} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Afternoon Return:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      Departs Campus @ {route.afternoonDeparture}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs space-y-2 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[#091d3e] border-b border-border/60 pb-2">
                    Assigned Driver & Conductor
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Primary Driver:
                    </span>
                    <span className="font-semibold text-foreground">
                      {route.driverName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Driver Mobile:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {route.driverPhone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Route Conductor:
                    </span>
                    <span className="font-semibold text-foreground">
                      {route.conductorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Monthly Revenue:
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(
                        route.allocatedStudents * route.monthlyRouteFee
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "stops" && (
            <div className="space-y-4">
              <div className="space-y-2">
                {route.stops.map((st) => (
                  <div
                    key={st.stopOrder}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-white p-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#091d3e] font-mono text-xs font-bold text-white">
                        {st.stopOrder}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {st.stopName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {st.landmark} ·{" "}
                          <strong className="text-[#091d3e]">
                            {st.studentsCount} Students Boarding
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs shrink-0">
                      <span className="font-bold text-emerald-700">
                        Pickup: {st.morningPickup}
                      </span>
                      <p className="text-[10.5px] text-muted-foreground">
                        Drop: {st.afternoonDrop}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Stop Form */}
              <form
                onSubmit={handleAddStopSubmit}
                className="rounded-xl border border-brand/20 bg-brand-50/40 p-3.5 space-y-3"
              >
                <p className="text-xs font-bold text-[#091d3e] flex items-center gap-1.5">
                  <Plus className="size-3.5" />
                  <span>Add New Designated Stop to {route.routeCode}</span>
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kalma Chowk Flyover Stop"
                    value={stopName}
                    onChange={(e) => setStopName(e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Bus Station"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 5 (Students)"
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="e.g. 07:15 AM (Pickup)"
                    value={morningPickup}
                    onChange={(e) => setMorningPickup(e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    type="text"
                    placeholder="e.g. 02:25 PM (Drop)"
                    value={afternoonDrop}
                    onChange={(e) => setAfternoonDrop(e.target.value)}
                    className={fieldClass}
                  />
                  <ActionButton type="submit" tone="primary" size="sm">
                    <Check className="size-3.5" />
                    <span>Append Stop</span>
                  </ActionButton>
                </div>
              </form>
            </div>
          )}

          {activeTab === "dispatch" && (
            <form onSubmit={handleDispatchSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Route Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RouteStatus)}
                    className={fieldClass}
                  >
                    <option value="On Route">On Route (Live GPS)</option>
                    <option value="Active">Active Schedule</option>
                    <option value="Standby">Standby / Spare</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Assigned Vehicle Registration #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LES-24-8801"
                    value={vehicleRegNo}
                    onChange={(e) => setVehicleRegNo(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Assigned HTV Driver
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Subedar (R) Muhammad Akram"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <ActionButton type="submit" tone="primary" size="sm">
                  <Check className="size-3.5" />
                  <span>Update Dispatch Assignment</span>
                </ActionButton>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-slate-50/60 px-6 py-3.5">
          <ActionButton
            tone="pdf"
            size="sm"
            onClick={() => {
              exportSingleRouteCardPdf(route);
              toast.success(
                `Route manifest ${route.routeCode} downloaded as PDF.`
              );
            }}
          >
            <Download className="size-3.5" />
            <span>Download Manifest PDF</span>
          </ActionButton>

          <div className="flex items-center gap-2">
            {onEditRoute && (
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEditRoute(route);
                }}
              >
                <Edit className="size-3.5" />
                <span>Edit Route</span>
              </ActionButton>
            )}
            <ActionButton
              tone="primary"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <span>Close</span>
            </ActionButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. FLEET VEHICLE VIEW & MAINTENANCE MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface FleetVehicleViewModalProps {
  vehicle: FleetVehicleRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateVehicleStatus?: (
    vehicleId: string,
    status: FleetVehicleStatus,
    lastServiceDate: string
  ) => void;
}

export function FleetVehicleViewModal({
  vehicle,
  open,
  onOpenChange,
  onUpdateVehicleStatus,
}: FleetVehicleViewModalProps) {
  const [status, setStatus] = React.useState<FleetVehicleStatus>("Operational");
  const [lastServiceDate, setLastServiceDate] = React.useState("2026-10-24");

  React.useEffect(() => {
    if (open && vehicle) {
      setStatus(vehicle.status);
      setLastServiceDate(vehicle.lastServiceDate);
    }
  }, [open, vehicle]);

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <Bus className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {vehicle.makeModel}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                Reg #{vehicle.registrationNo} · {vehicle.vehicleCode} ·{" "}
                {vehicle.campus}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-border/80 bg-slate-50/60 p-3 text-center">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                Seat Occupancy
              </span>
              <p className="font-mono text-sm font-bold text-[#091d3e] mt-0.5">
                {vehicle.occupiedSeats} / {vehicle.seatingCapacity} Seats
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                Monthly Fuel (Oct)
              </span>
              <p className="font-mono text-sm font-bold text-emerald-700 mt-0.5">
                {formatCurrency(vehicle.monthlyFuelCost)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                Odometer Reading
              </span>
              <p className="font-mono text-sm font-bold text-foreground mt-0.5">
                {vehicle.odometerKm.toLocaleString()} km
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-3.5">
            <div>
              <span className="text-muted-foreground">Assigned Route:</span>
              <p className="font-mono font-bold text-[#091d3e]">
                {vehicle.assignedRouteCode}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Assigned Driver:</span>
              <p className="font-semibold text-foreground">
                {vehicle.assignedDriver}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Fuel Specification:</span>
              <p className="font-semibold text-foreground">
                {vehicle.fuelType} ({vehicle.monthlyFuelLitres} L/mo)
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Fitness Certificate:</span>
              <p className="font-mono font-semibold text-emerald-700">
                Valid till {formatDate(vehicle.fitnessExpiry)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Fleet Operational Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as FleetVehicleStatus)
                }
                className={fieldClass}
              >
                <option value="Operational">Operational (Ready)</option>
                <option value="On Route">On Route</option>
                <option value="In Maintenance">In Workshop Maintenance</option>
                <option value="Standby">Standby Reserve</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Last Workshop Inspection Date
              </label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-slate-50/60 px-6 py-3 flex items-center justify-end gap-2">
          <ActionButton
            tone="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="primary"
            size="sm"
            onClick={() => {
              if (onUpdateVehicleStatus) {
                onUpdateVehicleStatus(vehicle.id, status, lastServiceDate);
              }
              onOpenChange(false);
            }}
          >
            <Check className="size-3.5" />
            <span>Save Fleet Status</span>
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. LICENSED DRIVER PROFILE VIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface DriverViewModalProps {
  driver: TransportDriverRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateDriverStatus?: (id: string, status: DriverDutyStatus) => void;
}

export function DriverViewModal({
  driver,
  open,
  onOpenChange,
  onUpdateDriverStatus,
}: DriverViewModalProps) {
  const [status, setStatus] = React.useState<DriverDutyStatus>("On Duty");

  React.useEffect(() => {
    if (open && driver) {
      setStatus(driver.status);
    }
  }, [open, driver]);

  if (!driver) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <UserCheck className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {driver.fullName}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                {driver.driverCode} · CNIC: {driver.cnic} · {driver.campus}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/80 bg-slate-50/50 p-3.5">
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                HTV / PSV License #
              </span>
              <p className="font-mono font-bold text-[#091d3e] mt-0.5">
                {driver.htvLicenseNo}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {driver.licenseCategory} (Exp: {formatDate(driver.licenseExpiry)}
                )
              </p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Assigned Vehicle & Route
              </span>
              <p className="font-mono font-bold text-foreground mt-0.5">
                {driver.assignedVehicleReg} ({driver.assignedRouteCode})
              </p>
              <p className="text-[11px] text-muted-foreground">
                Conductor: {driver.conductorName}
              </p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Contact & Emergency
              </span>
              <p className="font-mono font-semibold text-foreground mt-0.5">
                {driver.phone}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                SOS: {driver.emergencyPhone}
              </p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Vetting & Experience
              </span>
              <p className="font-semibold text-emerald-700 mt-0.5">
                {driver.experienceYears} Yrs · Police {driver.policeVerification}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Shift: {driver.shiftTiming}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Driver Roster Duty Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DriverDutyStatus)}
              className={fieldClass}
            >
              <option value="On Duty">On Duty (Dispatched)</option>
              <option value="Active">Active Roster</option>
              <option value="Off Duty">Off Duty / Leave</option>
            </select>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-slate-50/60 px-6 py-3 flex items-center justify-end gap-2">
          <ActionButton
            tone="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="primary"
            size="sm"
            onClick={() => {
              if (onUpdateDriverStatus) {
                onUpdateDriverStatus(driver.id, status);
              }
              onOpenChange(false);
            }}
          >
            <Check className="size-3.5" />
            <span>Update Duty Status</span>
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. STUDENT TRANSPORT ALLOCATION PASS MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface StudentAllocationViewModalProps {
  allocation: StudentTransportAllocationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateAllocation?: (
    id: string,
    status: AllocationStatus,
    feeStatus: "Paid" | "Pending"
  ) => void;
}

export function StudentAllocationViewModal({
  allocation,
  open,
  onOpenChange,
  onUpdateAllocation,
}: StudentAllocationViewModalProps) {
  const [status, setStatus] = React.useState<AllocationStatus>("Allocated");
  const [feeStatus, setFeeStatus] = React.useState<"Paid" | "Pending">("Paid");

  React.useEffect(() => {
    if (open && allocation) {
      setStatus(allocation.status);
      setFeeStatus(allocation.feeStatus);
    }
  }, [open, allocation]);

  if (!allocation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {allocation.studentName} — Pass #{allocation.passNo}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                Roll #{allocation.rollNo} · {allocation.className} ·{" "}
                {allocation.campus}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="rounded-xl border border-border/80 bg-slate-50/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#091d3e]">
                {allocation.routeCode} · Vehicle {allocation.vehicleRegNo}
              </span>
              <span className="rounded bg-[#091d3e] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                {allocation.seatNo}
              </span>
            </div>
            <p className="font-semibold text-foreground">
              {allocation.routeName}
            </p>
            <p className="text-muted-foreground">
              Boarding Stop: <strong>{allocation.pickupStop}</strong> (Pickup:{" "}
              {allocation.pickupTime} · Drop: {allocation.dropTime})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-3.5">
            <div>
              <span className="text-muted-foreground">Parent / Guardian:</span>
              <p className="font-semibold text-foreground">
                {allocation.guardianName}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {allocation.guardianPhone}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly Pass Fee:</span>
              <p className="font-mono text-sm font-bold text-emerald-700">
                {formatCurrency(allocation.monthlyTransportFee)}
              </p>
              <StatusBadge status={allocation.feeStatus} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Transport Pass Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AllocationStatus)}
                className={fieldClass}
              >
                <option value="Allocated">Allocated Seat</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Monthly Transport Fee Status
              </label>
              <select
                value={feeStatus}
                onChange={(e) =>
                  setFeeStatus(e.target.value as "Paid" | "Pending")
                }
                className={fieldClass}
              >
                <option value="Paid">Paid (Cleared)</option>
                <option value="Pending">Pending Challan</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-slate-50/60 px-6 py-3 flex items-center justify-end gap-2">
          <ActionButton
            tone="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="primary"
            size="sm"
            onClick={() => {
              if (onUpdateAllocation) {
                onUpdateAllocation(allocation.id, status, feeStatus);
              }
              onOpenChange(false);
            }}
          >
            <Check className="size-3.5" />
            <span>Save Pass Allocation</span>
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
