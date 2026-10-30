"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bus,
  Check,
  ChevronDown,
  Edit,
  Edit3,
  GraduationCap,
  List,
  MapPin,
  Navigation,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  COMMON_BOARDING_STOPS,
  COMMON_DRIVER_NAMES,
  COMMON_VEHICLE_MODELS,
  TRANSPORT_STUDENT_DIRECTORY,
  type TransportAssignmentRecord,
  type TransportRouteRecord,
  type TransportVehicleRecord,
} from "@/lib/mock/transport";

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const ROUTE_SUGGESTIONS = [
  "Route A — DHA & Cantt",
  "Route B — Gulberg & Johar",
  "Route C — Model Town & Faisal Town",
  "Route D — Bahria Town & Canal Bank",
  "Route E — Wapda Town & Valencia",
  "Route F — Allama Iqbal Town & Samanabad",
  "Route G — Askari & Mall Road",
  "Route H — Garden Town & Shadman",
];

const QUICK_FARES = [1500, 1800, 2000, 2200, 2500, 3000];

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. Add / Edit Route Modal                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

interface RouteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  initialData?: TransportRouteRecord | null;
  onSave: (record: TransportRouteRecord) => void;
}

export function RouteFormModal({
  open,
  onOpenChange,
  totalCount,
  initialData,
  onSave,
}: RouteFormModalProps) {
  const isEditing = Boolean(initialData);

  const [routeName, setRouteName] = React.useState("");
  const [monthlyFare, setMonthlyFare] = React.useState("2000");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setRouteName(initialData.routeName);
        setMonthlyFare(String(initialData.monthlyFare));
      } else {
        setRouteName("");
        setMonthlyFare("2000");
      }
    }
  }, [open, initialData]);

  const numericFare = Math.max(0, Math.trunc(Number(monthlyFare) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim()) {
      toast.error("Please enter a route name.");
      return;
    }
    if (numericFare <= 0) {
      toast.error("Please enter a valid monthly fare.");
      return;
    }

    const record: TransportRouteRecord = initialData
      ? {
          ...initialData,
          routeName: routeName.trim(),
          monthlyFare: numericFare,
        }
      : {
          id: `rte-${totalCount + 1}-${ routeName.trim().slice(0, 3).toLowerCase() }`,
          routeCode: `RTE-${String(totalCount + 1).padStart(2, "0")}`,
          routeName: routeName.trim(),
          monthlyFare: numericFare,
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Route "${record.routeName}" updated successfully.`
        : `Route "${record.routeName}" added with Monthly Fare Rs ${formatNumber(numericFare)}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-lg gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
              {isEditing ? (
                <Edit className="size-5" />
              ) : (
                <Navigation className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing
                  ? `Edit Route — ${initialData?.routeCode}`
                  : "Add Routes"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the transport route name and monthly student fare."
                  : "Define a school transport route and its standard monthly fare."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            {/* Two-column layout matching screenshot + executive polish */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Route Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="route-name-suggestions"
                  placeholder="e.g. Gulberg – School"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className={fieldClass}
                />
                <datalist id="route-name-suggestions">
                  {ROUTE_SUGGESTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Monthly Fare <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
                    Rs
                  </span>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="2000"
                    value={monthlyFare}
                    onChange={(e) => setMonthlyFare(e.target.value)}
                    className={cn(fieldClass, "pl-9 font-mono text-sm font-bold")}
                  />
                </div>
              </div>
            </div>

            {/* Quick Fare Preset Pills */}
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">
                Quick Select Monthly Fare:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_FARES.map((preset) => {
                  const active = numericFare === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMonthlyFare(String(preset))}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-all cursor-pointer",
                        active
                          ? "border-[#091d3e] bg-[#091d3e] text-white shadow-2xs"
                          : "border-border/80 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      )}
                    >
                      Rs {formatNumber(preset)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Preview Strip */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs">
              <div className="truncate pr-3">
                <span className="font-medium text-muted-foreground">Route: </span>
                <strong className="font-bold text-foreground">
                  {routeName.trim() || "New Transport Route"}
                </strong>
              </div>
              <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-1 font-mono text-xs font-extrabold text-[#091d3e]">
                Rs {formatNumber(numericFare)} / mo
              </span>
            </div>
          </div>

          {/* Footer with Symmetrical Spacing & Equal Margins */}
          <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
            <ActionButton
              type="button"
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <span>Cancel</span>
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <Check className="size-3.5" />
              <span>{isEditing ? "Save Changes" : "Save"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. Add / Edit Vehicle Modal                                                */
/* ────────────────────────────────────────────────────────────────────────── */

interface VehicleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  routes: TransportRouteRecord[];
  initialData?: TransportVehicleRecord | null;
  onSave: (record: TransportVehicleRecord) => void;
}

export function VehicleFormModal({
  open,
  onOpenChange,
  totalCount,
  routes,
  initialData,
  onSave,
}: VehicleFormModalProps) {
  const isEditing = Boolean(initialData);

  const [vehicleNo, setVehicleNo] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState(
    COMMON_VEHICLE_MODELS[0] ?? "Toyota Coaster 2023"
  );
  const [isManualModel, setIsManualModel] = React.useState(false);
  const [manualModelInput, setManualModelInput] = React.useState("");
  const [capacity, setCapacity] = React.useState("30");
  const [driverName, setDriverName] = React.useState("");
  const [driverPhone, setDriverPhone] = React.useState("");
  const [selectedRouteId, setSelectedRouteId] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setVehicleNo(initialData.vehicleNo);
        setCapacity(String(initialData.capacity));
        setDriverName(initialData.driverName || "");
        setDriverPhone(initialData.driverPhone || "");
        setSelectedRouteId(initialData.routeId || "");
        if (COMMON_VEHICLE_MODELS.includes(initialData.model)) {
          setSelectedModel(initialData.model);
          setIsManualModel(false);
          setManualModelInput("");
        } else {
          setIsManualModel(true);
          setManualModelInput(initialData.model);
          setSelectedModel("__custom__");
        }
      } else {
        setVehicleNo("");
        setSelectedModel(COMMON_VEHICLE_MODELS[0] ?? "Toyota Coaster 2023");
        setIsManualModel(false);
        setManualModelInput("");
        setCapacity("30");
        setDriverName("");
        setDriverPhone("");
        setSelectedRouteId("");
      }
    }
  }, [open, initialData]);

  const resolvedModel = isManualModel
    ? manualModelInput.trim() || "Toyota Coaster"
    : selectedModel;
  const numericCapacity = Math.max(1, Math.trunc(Number(capacity) || 30));
  const matchedRoute = routes.find((r) => r.id === selectedRouteId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo.trim()) {
      toast.error("Please enter the vehicle registration number.");
      return;
    }
    if (isManualModel && !manualModelInput.trim()) {
      toast.error("Please enter the vehicle model name.");
      return;
    }
    if (!driverName.trim()) {
      toast.error("Please enter the assigned driver's name.");
      return;
    }

    const record: TransportVehicleRecord = initialData
      ? {
          ...initialData,
          vehicleNo: vehicleNo.trim().toUpperCase(),
          model: resolvedModel,
          capacity: numericCapacity,
          driverName: driverName.trim(),
          driverPhone: driverPhone.trim() || undefined,
          routeId: matchedRoute ? matchedRoute.id : "",
          routeName: matchedRoute ? matchedRoute.routeName : "",
        }
      : {
          id: `veh-${totalCount + 1}-${vehicleNo.trim().toLowerCase()}`,
          vehicleCode: `VEH-${101 + totalCount}`,
          vehicleNo: vehicleNo.trim().toUpperCase(),
          model: resolvedModel,
          capacity: numericCapacity,
          driverName: driverName.trim(),
          driverPhone: driverPhone.trim() || undefined,
          routeId: matchedRoute ? matchedRoute.id : "",
          routeName: matchedRoute ? matchedRoute.routeName : "",
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Vehicle "${record.vehicleNo}" updated successfully.`
        : `Vehicle "${record.vehicleNo}" (${record.model}) added to fleet.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-lg gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
              {isEditing ? (
                <Edit className="size-5" />
              ) : (
                <Bus className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing
                  ? `Edit Vehicle — ${initialData?.vehicleNo}`
                  : "Add Vehicles"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update vehicle registration number, model, seating capacity, or route."
                  : "Register a fleet vehicle with seating capacity and optional route assignment."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            {/* 2x2 Grid matching Screenshot 4 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 1. Vehicle No */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Vehicle No <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="LHR-001"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  className={cn(fieldClass, "font-mono uppercase")}
                />
              </div>

              {/* 2. Model (Dropdown + Manual Input Toggle) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold text-foreground">
                    Model <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isManualModel) {
                        setIsManualModel(true);
                        setSelectedModel("__custom__");
                      } else {
                        setIsManualModel(false);
                        setSelectedModel(
                          COMMON_VEHICLE_MODELS[0] ?? "Toyota Coaster 2023"
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#091d3e] hover:underline cursor-pointer"
                  >
                    {isManualModel ? (
                      <>
                        <List className="size-3" />
                        <span>Dropdown</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="size-3" />
                        <span>Manual input</span>
                      </>
                    )}
                  </button>
                </div>

                {!isManualModel ? (
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsManualModel(true);
                          setSelectedModel("__custom__");
                        } else {
                          setSelectedModel(e.target.value);
                        }
                      }}
                      className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                    >
                      {COMMON_VEHICLE_MODELS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="__custom__">
                        ✏️ Other Model (Manual Input)...
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Toyota Coaster"
                    value={manualModelInput}
                    onChange={(e) => setManualModelInput(e.target.value)}
                    className={fieldClass}
                  />
                )}
              </div>

              {/* 3. Driver Name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Driver Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="driver-name-suggestions"
                  placeholder="e.g. Muhammad Aslam"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className={fieldClass}
                />
                <datalist id="driver-name-suggestions">
                  {COMMON_DRIVER_NAMES.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              {/* 4. Driver Contact */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Driver Contact
                </label>
                <input
                  type="text"
                  placeholder="0300-4451920"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>

              {/* 5. Capacity */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Capacity <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="30"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
              </div>

              {/* 6. Route Dropdown */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Route
                </label>
                <div className="relative">
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                  >
                    <option value="">Select... (Unassigned)</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.routeName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Live Vehicle Summary Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs">
              <div>
                <strong className="font-mono font-bold text-[#091d3e]">
                  {vehicleNo.trim() || "LHR-XXX"}
                </strong>
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-semibold text-slate-700">
                  {resolvedModel}
                </span>
                {driverName.trim() && (
                  <>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="font-medium text-slate-600">
                      {driverName.trim()}
                    </span>
                  </>
                )}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-mono font-bold text-foreground">
                  {numericCapacity} Seats
                </span>
              </div>
              <span className="rounded-md bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {matchedRoute ? matchedRoute.routeName : "Unassigned"}
              </span>
            </div>
          </div>

          {/* Footer with Symmetrical Spacing & Equal Margins */}
          <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
            <ActionButton
              type="button"
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <span>Cancel</span>
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <Check className="size-3.5" />
              <span>{isEditing ? "Save Changes" : "Save"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. Assign Student / Edit Assignment Modal                                  */
/* ────────────────────────────────────────────────────────────────────────── */

interface AssignmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  routes: TransportRouteRecord[];
  vehicles?: TransportVehicleRecord[];
  initialData?: TransportAssignmentRecord | null;
  onSave: (record: TransportAssignmentRecord) => void;
}

export function AssignmentFormModal({
  open,
  onOpenChange,
  totalCount,
  routes,
  vehicles = [],
  initialData,
  onSave,
}: AssignmentFormModalProps) {
  const isEditing = Boolean(initialData);

  const [isManualStudent, setIsManualStudent] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState(
    TRANSPORT_STUDENT_DIRECTORY[0]?.id ?? ""
  );
  const [manualStudentName, setManualStudentName] = React.useState("");
  const [manualStudentClass, setManualStudentClass] =
    React.useState("Grade 8-A");

  const [selectedRouteId, setSelectedRouteId] = React.useState("");

  const [isManualStop, setIsManualStop] = React.useState(false);
  const [selectedStop, setSelectedStop] = React.useState("");
  const [manualStopInput, setManualStopInput] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        const matchedDir = TRANSPORT_STUDENT_DIRECTORY.find(
          (s) => s.name.toLowerCase() === initialData.studentName.toLowerCase()
        );
        if (matchedDir) {
          setIsManualStudent(false);
          setSelectedStudentId(matchedDir.id);
          setManualStudentName("");
        } else {
          setIsManualStudent(true);
          setManualStudentName(initialData.studentName);
          setManualStudentClass(initialData.className || "Grade 8-A");
        }
        setSelectedRouteId(initialData.routeId || routes[0]?.id || "");
        if (COMMON_BOARDING_STOPS.includes(initialData.boardingStop)) {
          setIsManualStop(false);
          setSelectedStop(initialData.boardingStop);
          setManualStopInput("");
        } else {
          setIsManualStop(true);
          setManualStopInput(initialData.boardingStop);
        }
      } else {
        setIsManualStudent(false);
        setSelectedStudentId(TRANSPORT_STUDENT_DIRECTORY[0]?.id ?? "");
        setManualStudentName("");
        setManualStudentClass("Grade 8-A");
        setSelectedRouteId(routes[0]?.id ?? "");
        setIsManualStop(false);
        setSelectedStop("");
        setManualStopInput("");
      }
    }
  }, [open, initialData, routes]);

  const directoryStudent = TRANSPORT_STUDENT_DIRECTORY.find(
    (s) => s.id === selectedStudentId
  );
  const resolvedStudentName = isManualStudent
    ? manualStudentName.trim()
    : directoryStudent?.name ?? "";
  const resolvedRollNo = isManualStudent
    ? initialData?.studentRollNo || `STD-${1300 + totalCount}`
    : directoryStudent?.rollNo ?? `STD-${1300 + totalCount}`;
  const resolvedClass = isManualStudent
    ? manualStudentClass.trim() || "Grade 8-A"
    : directoryStudent?.className ?? "Grade 8-A";

  const matchedRoute =
    routes.find((r) => r.id === selectedRouteId) ?? routes[0] ?? null;

  const assignedVehicle = vehicles.find(
    (v) =>
      (matchedRoute?.id && v.routeId === matchedRoute.id) ||
      (matchedRoute?.routeName && v.routeName === matchedRoute.routeName)
  );

  const resolvedStop = isManualStop
    ? manualStopInput.trim()
    : selectedStop.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedStudentName) {
      toast.error("Please select or enter a student name.");
      return;
    }
    if (!matchedRoute) {
      toast.error("Please select a transport route.");
      return;
    }
    if (!resolvedStop) {
      toast.error("Please enter or select a boarding stop.");
      return;
    }

    const record: TransportAssignmentRecord = initialData
      ? {
          ...initialData,
          studentName: resolvedStudentName,
          studentRollNo: resolvedRollNo,
          className: resolvedClass,
          routeId: matchedRoute.id,
          routeName: matchedRoute.routeName,
          boardingStop: resolvedStop,
          monthlyFare: matchedRoute.monthlyFare,
          busName: assignedVehicle?.model || initialData.busName,
          vehicleNo: assignedVehicle?.vehicleNo || initialData.vehicleNo,
          driverName: assignedVehicle?.driverName || initialData.driverName,
          driverPhone: assignedVehicle?.driverPhone || initialData.driverPhone,
        }
      : {
          id: `asn-${totalCount + 1}-${resolvedRollNo.toLowerCase()}`,
          assignmentCode: `ASN-${201 + totalCount}`,
          studentName: resolvedStudentName,
          studentRollNo: resolvedRollNo,
          className: resolvedClass,
          routeId: matchedRoute.id,
          routeName: matchedRoute.routeName,
          boardingStop: resolvedStop,
          monthlyFare: matchedRoute.monthlyFare,
          busName: assignedVehicle?.model,
          vehicleNo: assignedVehicle?.vehicleNo,
          driverName: assignedVehicle?.driverName,
          driverPhone: assignedVehicle?.driverPhone,
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Transport assignment for "${record.studentName}" updated.`
        : `"${record.studentName}" assigned to ${record.routeName} (${record.boardingStop}).`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-lg gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
              {isEditing ? (
                <Edit className="size-5" />
              ) : (
                <GraduationCap className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? "Edit Student Assignment" : "Assign Student"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the student's assigned transport route or boarding stop."
                  : "Assign a student to a transport route and specify their boarding stop."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            {/* 1. Student Name (Directory Dropdown + Manual Input Toggle) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold text-foreground">
                  Name <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualStudent((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-[#091d3e] transition-colors hover:bg-slate-200/80 cursor-pointer"
                >
                  {isManualStudent ? (
                    <>
                      <List className="size-3" />
                      <span>Select from student directory</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="size-3" />
                      <span>Manual student input</span>
                    </>
                  )}
                </button>
              </div>

              {!isManualStudent ? (
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      if (e.target.value === "__manual__") {
                        setIsManualStudent(true);
                      } else {
                        setSelectedStudentId(e.target.value);
                      }
                    }}
                    className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                  >
                    {TRANSPORT_STUDENT_DIRECTORY.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.name} — {std.className} ({std.rollNo})
                      </option>
                    ))}
                    <option value="__manual__">
                      ✏️ Enter Student Name Manually...
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter full student name..."
                      value={manualStudentName}
                      onChange={(e) => setManualStudentName(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Class (e.g. Grade 8-A)"
                      value={manualStudentClass}
                      onChange={(e) => setManualStudentClass(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Route */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">
                Route <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                >
                  <option value="" disabled>
                    Select route...
                  </option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routeName} — Rs {formatNumber(r.monthlyFare)}/mo
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {assignedVehicle ? (
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Bus className="size-3.5 text-[#091d3e]" />
                    <span className="font-bold text-slate-800">
                      {assignedVehicle.model}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#091d3e]">
                      ({assignedVehicle.vehicleNo})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground">Driver: </span>
                    <strong className="font-bold text-[#091d3e]">
                      {assignedVehicle.driverName}
                    </strong>
                    {assignedVehicle.driverPhone && (
                      <span className="ml-1.5 font-mono text-[10.5px] text-muted-foreground">
                        ({assignedVehicle.driverPhone})
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 3. Boarding Stop (Dropdown + Manual Input) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold text-foreground">
                  Boarding Stop <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualStop((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-[#091d3e] transition-colors hover:bg-slate-200/80 cursor-pointer"
                >
                  {isManualStop ? (
                    <>
                      <List className="size-3" />
                      <span>Select from common stops</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="size-3" />
                      <span>Manual stop input</span>
                    </>
                  )}
                </button>
              </div>

              {!isManualStop ? (
                <div className="relative">
                  <select
                    value={selectedStop}
                    onChange={(e) => {
                      if (e.target.value === "__manual_stop__") {
                        setIsManualStop(true);
                      } else {
                        setSelectedStop(e.target.value);
                      }
                    }}
                    className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                  >
                    <option value="">e.g. Main Chowk (Select Stop...)</option>
                    {COMMON_BOARDING_STOPS.map((stop) => (
                      <option key={stop} value={stop}>
                        {stop}
                      </option>
                    ))}
                    <option value="__manual_stop__">
                      ✏️ Type Custom Boarding Stop...
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Chowk"
                  value={manualStopInput}
                  onChange={(e) => setManualStopInput(e.target.value)}
                  className={fieldClass}
                />
              )}
            </div>

            {/* Live Assignment Summary Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="size-3.5 shrink-0 text-[#091d3e]" />
                <span className="font-bold text-foreground">
                  {resolvedStudentName || "Select Student"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-muted-foreground">
                  {resolvedStop || "Boarding Stop"}
                </span>
              </div>
              {matchedRoute && (
                <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#091d3e]">
                  Rs {formatNumber(matchedRoute.monthlyFare)} / mo
                </span>
              )}
            </div>
          </div>

          {/* Footer with Symmetrical Spacing & Equal Margins */}
          <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
            <ActionButton
              type="button"
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <span>Cancel</span>
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <Check className="size-3.5" />
              <span>{isEditing ? "Save Changes" : "Assign Student"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 4. Delete Confirmation Modal                                               */
/* ────────────────────────────────────────────────────────────────────────── */

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-md gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-rose-50/50 px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-600 text-white shadow-xs">
              <AlertTriangle className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Footer with Symmetrical Spacing & Equal Margins */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            type="button"
            tone="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <span>Cancel</span>
          </ActionButton>
          <ActionButton
            type="button"
            tone="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
