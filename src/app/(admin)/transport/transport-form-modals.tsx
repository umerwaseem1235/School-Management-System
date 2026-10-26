"use client";

import * as React from "react";
import { Bus, Check, GraduationCap, Navigation, UserPlus } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import type {
  FleetVehicleRecord,
  StudentTransportAllocationRecord,
  TransportDriverRecord,
  TransportRouteRecord,
} from "@/lib/mock/transport";

const CAMPUSES = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

const fieldClass =
  "h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. ADD / EDIT TRANSPORT ROUTE MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface TransportRouteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TransportRouteRecord | null;
  totalCount: number;
  onSave: (route: TransportRouteRecord) => void;
}

export function TransportRouteFormModal({
  open,
  onOpenChange,
  initialData,
  totalCount,
  onSave,
}: TransportRouteFormModalProps) {
  const [routeCode, setRouteCode] = React.useState("");
  const [routeName, setRouteName] = React.useState("");
  const [campus, setCampus] = React.useState("Gulberg");
  const [vehicleRegNo, setVehicleRegNo] = React.useState("");
  const [vehicleModel, setVehicleModel] = React.useState("");
  const [driverName, setDriverName] = React.useState("");
  const [driverPhone, setDriverPhone] = React.useState("");
  const [conductorName, setConductorName] = React.useState("");
  const [distanceKm, setDistanceKm] = React.useState("");
  const [morningDeparture, setMorningDeparture] = React.useState("06:40 AM");
  const [campusArrival, setCampusArrival] = React.useState("07:35 AM");
  const [seatCapacity, setSeatCapacity] = React.useState("29");
  const [monthlyRouteFee, setMonthlyRouteFee] = React.useState("");
  const [primaryStopName, setPrimaryStopName] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setRouteCode(initialData.routeCode);
        setRouteName(initialData.routeName);
        setCampus(initialData.campus);
        setVehicleRegNo(initialData.vehicleRegNo);
        setVehicleModel(initialData.vehicleModel);
        setDriverName(initialData.driverName);
        setDriverPhone(initialData.driverPhone);
        setConductorName(initialData.conductorName);
        setDistanceKm(String(initialData.distanceKm));
        setMorningDeparture(initialData.morningDeparture);
        setCampusArrival(initialData.campusArrival);
        setSeatCapacity(String(initialData.seatCapacity));
        setMonthlyRouteFee(String(initialData.monthlyRouteFee));
        setPrimaryStopName(initialData.stops[0]?.stopName || "");
      } else {
        setRouteCode(
          `RTE-LHR-${String(totalCount + 1).padStart(2, "0")}`
        );
        setRouteName("");
        setCampus("Gulberg");
        setVehicleRegNo("");
        setVehicleModel("");
        setDriverName("");
        setDriverPhone("");
        setConductorName("");
        setDistanceKm("");
        setMorningDeparture("06:40 AM");
        setCampusArrival("07:35 AM");
        setSeatCapacity("29");
        setMonthlyRouteFee("");
        setPrimaryStopName("");
      }
    }
  }, [open, initialData, totalCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim()) {
      toast.error("Please enter the route corridor name.");
      return;
    }

    const record: TransportRouteRecord = {
      id: initialData ? initialData.id : `rte-${Date.now()}`,
      routeCode:
        routeCode.trim() ||
        `RTE-LHR-${String(totalCount + 1).padStart(2, "0")}`,
      routeName: routeName.trim(),
      campus,
      vehicleRegNo: vehicleRegNo.trim() || "LES-26-4910",
      vehicleModel:
        vehicleModel.trim() || "Toyota Coaster 29-Seater Euro-II AC",
      driverName: driverName.trim() || "Subedar (R) Muhammad Akram",
      driverPhone: driverPhone.trim() || "+92 300 4182901",
      conductorName: conductorName.trim() || "Muhammad Irfan",
      distanceKm: Math.max(1, Number(distanceKm) || 18),
      morningDeparture: morningDeparture.trim() || "06:40 AM",
      campusArrival: campusArrival.trim() || "07:35 AM",
      afternoonDeparture: "02:10 PM",
      seatCapacity: Math.max(8, Number(seatCapacity) || 29),
      allocatedStudents: initialData ? initialData.allocatedStudents : 12,
      monthlyRouteFee: Math.max(1000, Number(monthlyRouteFee) || 9500),
      gpsTrackerId: initialData
        ? initialData.gpsTrackerId
        : `GPS-TRK-${901 + totalCount}`,
      status: initialData ? initialData.status : "Active",
      stops: initialData
        ? initialData.stops
        : [
            {
              stopOrder: 1,
              stopName:
                primaryStopName.trim() || "Main Boulevard Commercial Gate",
              landmark: "Service Road Bus Bay",
              morningPickup: morningDeparture.trim() || "06:40 AM",
              afternoonDrop: "02:45 PM",
              studentsCount: 12,
            },
          ],
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      initialData
        ? `Transport route ${record.routeCode} updated.`
        : `New transport route ${record.routeCode} commissioned.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Navigation className="size-4.5 text-brand" />
            <span>
              {initialData
                ? `Edit Transport Route — ${initialData.routeCode}`
                : "Create Institutional Transport Route"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure route corridor, assigned vehicle, crew, timing schedule,
            and monthly route fee.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Route Code" required>
              <input
                type="text"
                required
                placeholder="e.g. RTE-LHR-09"
                value={routeCode}
                onChange={(e) => setRouteCode(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Campus" required>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className={fieldClass}
              >
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="One-Way Distance (km)" required>
              <input
                type="number"
                step="0.1"
                min={1}
                required
                placeholder="e.g. 18.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Route Corridor Title" required>
            <input
              type="text"
              required
              placeholder="e.g. Gulberg Main Blvd — Model Town — Canal Bank Corridor"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Assigned Vehicle Registration #" required>
              <input
                type="text"
                required
                placeholder="e.g. LES-24-8801"
                value={vehicleRegNo}
                onChange={(e) => setVehicleRegNo(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Vehicle Make & Model" required>
              <input
                type="text"
                required
                placeholder="e.g. Toyota Coaster 29-Seater Euro-II AC"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Primary HTV Driver Name" required>
              <input
                type="text"
                required
                placeholder="e.g. Subedar (R) Muhammad Akram"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Driver Mobile Number" required>
              <input
                type="text"
                required
                placeholder="e.g. +92 300 4182901"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Route Conductor Name">
              <input
                type="text"
                placeholder="e.g. Muhammad Irfan"
                value={conductorName}
                onChange={(e) => setConductorName(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Morning Start Time">
              <input
                type="text"
                placeholder="e.g. 06:40 AM"
                value={morningDeparture}
                onChange={(e) => setMorningDeparture(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Campus Arrival Time">
              <input
                type="text"
                placeholder="e.g. 07:35 AM"
                value={campusArrival}
                onChange={(e) => setCampusArrival(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Seating Capacity" required>
              <input
                type="number"
                min={8}
                required
                placeholder="e.g. 29"
                value={seatCapacity}
                onChange={(e) => setSeatCapacity(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Monthly Fee (PKR)" required>
              <input
                type="number"
                min={1000}
                required
                placeholder="e.g. 9500"
                value={monthlyRouteFee}
                onChange={(e) => setMonthlyRouteFee(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          {!initialData && (
            <Field label="Origin / First Pickup Stop Name">
              <input
                type="text"
                placeholder="e.g. Model Town Link Road Gate (Near Amanah Mall)"
                value={primaryStopName}
                onChange={(e) => setPrimaryStopName(e.target.value)}
                className={fieldClass}
              />
            </Field>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <ActionButton
              type="button"
              tone="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check className="size-3.5" />
              <span>{initialData ? "Save Route" : "Commission Route"}</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. ADD FLEET VEHICLE MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface FleetVehicleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  onSave: (vehicle: FleetVehicleRecord) => void;
}

export function FleetVehicleFormModal({
  open,
  onOpenChange,
  totalCount,
  onSave,
}: FleetVehicleFormModalProps) {
  const [registrationNo, setRegistrationNo] = React.useState("");
  const [makeModel, setMakeModel] = React.useState("");
  const [vehicleType, setVehicleType] = React.useState<
    FleetVehicleRecord["vehicleType"]
  >("Coaster (29-Seater)");
  const [campus, setCampus] = React.useState("Gulberg");
  const [assignedRouteCode, setAssignedRouteCode] = React.useState("");
  const [assignedDriver, setAssignedDriver] = React.useState("");
  const [seatingCapacity, setSeatingCapacity] = React.useState("29");
  const [monthlyFuelCost, setMonthlyFuelCost] = React.useState("");
  const [fitnessExpiry, setFitnessExpiry] = React.useState("2027-06-30");

  React.useEffect(() => {
    if (open) {
      setRegistrationNo("");
      setMakeModel("");
      setVehicleType("Coaster (29-Seater)");
      setCampus("Gulberg");
      setAssignedRouteCode("");
      setAssignedDriver("");
      setSeatingCapacity("29");
      setMonthlyFuelCost("");
      setFitnessExpiry("2027-06-30");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNo.trim() || !makeModel.trim()) {
      toast.error("Please enter registration number and vehicle make/model.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newVehicle: FleetVehicleRecord = {
      id: `flt-${Date.now()}`,
      vehicleCode: `FLT-BUS-${101 + totalCount}`,
      registrationNo: registrationNo.trim().toUpperCase(),
      makeModel: makeModel.trim(),
      vehicleType,
      campus,
      assignedRouteCode: assignedRouteCode.trim() || "RTE-LHR-01",
      assignedDriver:
        assignedDriver.trim() || "Subedar (R) Muhammad Akram",
      seatingCapacity: Math.max(8, Number(seatingCapacity) || 29),
      occupiedSeats: 20,
      fuelType: "High-Speed Diesel (HSD)",
      monthlyFuelLitres: 380,
      monthlyFuelCost: Math.max(10000, Number(monthlyFuelCost) || 110000),
      odometerKm: 12400,
      fitnessExpiry,
      lastServiceDate: today,
      gpsDeviceCode: `GPS-TRK-${901 + totalCount}`,
      status: "Operational",
    };

    onSave(newVehicle);
    onOpenChange(false);
    toast.success(
      `Fleet vehicle ${newVehicle.registrationNo} registered in campus pool.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Bus className="size-4.5 text-brand" />
            <span>Register Campus Fleet Vehicle</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a new bus, coaster, or van to the institutional transport fleet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Excise Registration #" required>
              <input
                type="text"
                required
                placeholder="e.g. LES-25-8804"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Vehicle Classification" required>
              <select
                value={vehicleType}
                onChange={(e) =>
                  setVehicleType(
                    e.target.value as FleetVehicleRecord["vehicleType"]
                  )
                }
                className={fieldClass}
              >
                <option value="Coaster (29-Seater)">Coaster (29-Seater)</option>
                <option value="Heavy Bus (52-Seater)">
                  Heavy Bus (52-Seater)
                </option>
                <option value="Mini Coach (28-Seater)">
                  Mini Coach (28-Seater)
                </option>
                <option value="Executive Van (15-Seater)">
                  Executive Van (15-Seater)
                </option>
              </select>
            </Field>
          </div>

          <Field label="Make, Model & Engine Specification" required>
            <input
              type="text"
              required
              placeholder="e.g. Toyota Coaster 29-Seater Euro-II AC"
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Assigned Campus" required>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className={fieldClass}
              >
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assigned Route Code">
              <input
                type="text"
                placeholder="e.g. RTE-LHR-01"
                value={assignedRouteCode}
                onChange={(e) => setAssignedRouteCode(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Assigned Driver">
              <input
                type="text"
                placeholder="e.g. M. Akram"
                value={assignedDriver}
                onChange={(e) => setAssignedDriver(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Seating Capacity" required>
              <input
                type="number"
                min={8}
                required
                placeholder="e.g. 29"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Monthly Fuel (PKR)">
              <input
                type="number"
                min={0}
                placeholder="e.g. 115000"
                value={monthlyFuelCost}
                onChange={(e) => setMonthlyFuelCost(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <ActionButton
              type="button"
              tone="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check className="size-3.5" />
              <span>Register Vehicle</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. REGISTER LICENSED DRIVER MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface DriverFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  onSave: (driver: TransportDriverRecord) => void;
}

export function DriverFormModal({
  open,
  onOpenChange,
  totalCount,
  onSave,
}: DriverFormModalProps) {
  const [fullName, setFullName] = React.useState("");
  const [cnic, setCnic] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [htvLicenseNo, setHtvLicenseNo] = React.useState("");
  const [campus, setCampus] = React.useState("Gulberg");
  const [assignedVehicleReg, setAssignedVehicleReg] = React.useState("");
  const [assignedRouteCode, setAssignedRouteCode] = React.useState("");
  const [conductorName, setConductorName] = React.useState("");
  const [experienceYears, setExperienceYears] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setFullName("");
      setCnic("");
      setPhone("");
      setHtvLicenseNo("");
      setCampus("Gulberg");
      setAssignedVehicleReg("");
      setAssignedRouteCode("");
      setConductorName("");
      setExperienceYears("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !htvLicenseNo.trim()) {
      toast.error("Please enter driver full name and HTV license number.");
      return;
    }

    const newDriver: TransportDriverRecord = {
      id: `drv-${Date.now()}`,
      driverCode: `DRV-2026-${String(totalCount + 1).padStart(2, "0")}`,
      fullName: fullName.trim(),
      cnic: cnic.trim() || "35202-4182910-9",
      phone: phone.trim() || "+92 300 4182901",
      emergencyPhone: "+92 321 4182999",
      htvLicenseNo: htvLicenseNo.trim().toUpperCase(),
      licenseCategory: "HTV + PSV Certified",
      licenseExpiry: "2029-12-31",
      campus,
      assignedVehicleReg: assignedVehicleReg.trim() || "LES-24-8801",
      assignedRouteCode: assignedRouteCode.trim() || "RTE-LHR-01",
      conductorName: conductorName.trim() || "Muhammad Irfan",
      experienceYears: Math.max(1, Number(experienceYears) || 10),
      shiftTiming: "06:15 AM – 03:15 PM",
      policeVerification: "Verified",
      medicalFitness: "Cleared",
      status: "On Duty",
    };

    onSave(newDriver);
    onOpenChange(false);
    toast.success(`Driver ${newDriver.fullName} added to fleet roster.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <UserPlus className="size-4.5 text-brand" />
            <span>Assign Licensed Transport Driver</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Register an HTV/PSV certified driver and assign to a campus route.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Driver Full Name" required>
              <input
                type="text"
                required
                placeholder="e.g. Subedar (R) Muhammad Akram"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="NADRA CNIC Number" required>
              <input
                type="text"
                required
                placeholder="e.g. 35202-4182910-1"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="HTV / PSV Driving License #" required>
              <input
                type="text"
                required
                placeholder="e.g. LHR-HTV-884920"
                value={htvLicenseNo}
                onChange={(e) => setHtvLicenseNo(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Primary Mobile Number" required>
              <input
                type="text"
                required
                placeholder="e.g. +92 300 4182901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Campus" required>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className={fieldClass}
              >
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vehicle Reg #">
              <input
                type="text"
                placeholder="e.g. LES-24-8801"
                value={assignedVehicleReg}
                onChange={(e) => setAssignedVehicleReg(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Route Code">
              <input
                type="text"
                placeholder="e.g. RTE-LHR-01"
                value={assignedRouteCode}
                onChange={(e) => setAssignedRouteCode(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Exp (Years)">
              <input
                type="number"
                min={1}
                placeholder="e.g. 15"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Assigned Bus Conductor Name">
            <input
              type="text"
              placeholder="e.g. Muhammad Irfan"
              value={conductorName}
              onChange={(e) => setConductorName(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <ActionButton
              type="button"
              tone="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check className="size-3.5" />
              <span>Assign Driver</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. STUDENT ROUTE ALLOCATION MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface StudentAllocationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routes: TransportRouteRecord[];
  totalCount: number;
  onSave: (allocation: StudentTransportAllocationRecord) => void;
}

export function StudentAllocationFormModal({
  open,
  onOpenChange,
  routes,
  totalCount,
  onSave,
}: StudentAllocationFormModalProps) {
  const [studentName, setStudentName] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [className, setClassName] = React.useState("Grade 9-A");
  const [guardianName, setGuardianName] = React.useState("");
  const [guardianPhone, setGuardianPhone] = React.useState("");
  const [selectedRouteCode, setSelectedRouteCode] = React.useState(
    routes[0]?.routeCode || "RTE-LHR-01"
  );
  const [pickupStop, setPickupStop] = React.useState("");
  const [seatNo, setSeatNo] = React.useState("");

  const activeRoute =
    routes.find((r) => r.routeCode === selectedRouteCode) || routes[0] || null;

  React.useEffect(() => {
    if (open) {
      setStudentName("");
      setRollNo("");
      setClassName("Grade 9-A");
      setGuardianName("");
      setGuardianPhone("");
      setSelectedRouteCode(routes[0]?.routeCode || "RTE-LHR-01");
      setPickupStop("");
      setSeatNo("");
    }
  }, [open, routes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !activeRoute) {
      toast.error("Please enter the student name and select a route.");
      return;
    }

    const newAlloc: StudentTransportAllocationRecord = {
      id: `trp-${Date.now()}`,
      passNo: `TRP-2610-${401 + totalCount}`,
      studentName: studentName.trim(),
      rollNo: rollNo.trim() || "128",
      className,
      campus: activeRoute.campus,
      guardianName: guardianName.trim() || "Mr. Tariq Mehmood",
      guardianPhone: guardianPhone.trim() || "+92 300 4129834",
      routeCode: activeRoute.routeCode,
      routeName: activeRoute.routeName,
      pickupStop:
        pickupStop.trim() ||
        activeRoute.stops[0]?.stopName ||
        "Main Boulevard Gate",
      pickupTime: activeRoute.stops[0]?.morningPickup || "06:45 AM",
      dropTime: activeRoute.stops[0]?.afternoonDrop || "02:45 PM",
      vehicleRegNo: activeRoute.vehicleRegNo,
      seatNo: seatNo.trim() || `Seat ${activeRoute.allocatedStudents + 1}-A`,
      monthlyTransportFee: activeRoute.monthlyRouteFee,
      feeStatus: "Paid",
      status: "Allocated",
    };

    onSave(newAlloc);
    onOpenChange(false);
    toast.success(
      `Transport Pass ${newAlloc.passNo} issued to ${newAlloc.studentName}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <GraduationCap className="size-4.5 text-brand" />
            <span>Allocate Student Transport Pass</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Assign a student to a campus bus corridor, boarding stop, and
            reserved seat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Student Full Name" required>
              <input
                type="text"
                required
                placeholder="e.g. Ahmed Raza"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Roll Number" required>
              <input
                type="text"
                required
                placeholder="e.g. 101 or STU-2024-0101"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Class / Section" required>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className={fieldClass}
              >
                <option>Grade 6-A</option>
                <option>Grade 7-A</option>
                <option>Grade 8-A</option>
                <option>Grade 9-A</option>
                <option>Grade 10-A</option>
                <option>Grade 11-A</option>
                <option>Grade 12-A</option>
              </select>
            </Field>
          </div>

          <Field label="Select Transport Route Corridor" required>
            <select
              value={selectedRouteCode}
              onChange={(e) => setSelectedRouteCode(e.target.value)}
              className={fieldClass}
            >
              {routes.map((r) => (
                <option key={r.id} value={r.routeCode}>
                  {r.routeCode} — {r.routeName} ({r.allocatedStudents}/
                  {r.seatCapacity} Seats · {r.campus})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Designated Boarding Stop" required>
              <input
                type="text"
                required
                placeholder="e.g. Model Town Link Road Gate"
                value={pickupStop}
                onChange={(e) => setPickupStop(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Assigned Seat Number" required>
              <input
                type="text"
                required
                placeholder="e.g. Seat 14-A"
                value={seatNo}
                onChange={(e) => setSeatNo(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Parent / Guardian Name" required>
              <input
                type="text"
                required
                placeholder="e.g. Mr. Tariq Raza (Father)"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Emergency Guardian Mobile" required>
              <input
                type="text"
                required
                placeholder="e.g. +92 300 4129834"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          {activeRoute && (
            <div className="rounded-xl border border-brand/20 bg-brand-50/50 px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Vehicle {activeRoute.vehicleRegNo} · Monthly Route Fee:
              </span>
              <span className="font-mono text-sm font-extrabold text-emerald-700">
                {formatCurrency(activeRoute.monthlyRouteFee)} / Month
              </span>
            </div>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <ActionButton
              type="button"
              tone="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check className="size-3.5" />
              <span>Issue Transport Pass</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
