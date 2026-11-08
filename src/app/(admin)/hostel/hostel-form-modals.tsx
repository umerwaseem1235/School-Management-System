"use client";

import * as React from "react";
import {
  AlertTriangle,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Edit3,
  List,
  Trash2,
  UserRound,
  UtensilsCrossed,
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
import { formatCurrency, formatDate } from "@/lib/format";
import {
  HOSTEL_BUILDING_TYPES,
  HOSTEL_CAMPUSES,
  HOSTEL_FACILITY_OPTIONS,
  HOSTEL_MEAL_OPTIONS,
  HOSTEL_ROOM_TYPES,
  HOSTEL_STUDENT_DIRECTORY,
  type HostelAllocationRecord,
  type HostelAttendanceRecord,
  type HostelAttendanceStatus,
  type HostelBuildingRecord,
  type HostelBuildingType,
  type HostelMessPlanRecord,
  type HostelResidentStatus,
  type HostelRoomRecord,
  type HostelRoomType,
  type HostelVisitorRecord,
  type HostelVisitorStatus,
  type HostelWardenRecord,
  type HostelWardenRole,
  type HostelWardenShift,
  type HostelWardenStatus,
} from "@/lib/mock/hostel";

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const dialogClass =
  "flex flex-col sm:max-w-lg gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white";

const dialogHeaderClass =
  "shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5";

const dialogFooterClass =
  "shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4";

const summaryClass =
  "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs";

const todayIso = () => new Date().toISOString().slice(0, 10);

function countActiveInRoom(
  allocations: HostelAllocationRecord[],
  roomId: string,
  excludeId?: string
) {
  return allocations.filter(
    (allocation) =>
      allocation.status === "Active" &&
      allocation.roomId === roomId &&
      allocation.id !== excludeId
  ).length;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. Building form                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

interface BuildingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  wardens: HostelWardenRecord[];
  initialData?: HostelBuildingRecord | null;
  onSave: (record: HostelBuildingRecord) => void;
}

export function BuildingFormModal({
  open,
  onOpenChange,
  totalCount,
  wardens,
  initialData,
  onSave,
}: BuildingFormModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<HostelBuildingType>("Boys");
  const [campus, setCampus] = React.useState<string>(HOSTEL_CAMPUSES[0]);
  const [address, setAddress] = React.useState("");
  const [floors, setFloors] = React.useState("2");
  const [establishedYear, setEstablishedYear] = React.useState("2020");
  const [wardenId, setWardenId] = React.useState("");
  const [facilities, setFacilities] = React.useState<string[]>([
    "Wi-Fi",
    "Laundry",
    "CCTV",
  ]);
  const [customFacility, setCustomFacility] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setType(initialData.type);
      setCampus(initialData.campus);
      setAddress(initialData.address);
      setFloors(String(initialData.floors));
      setEstablishedYear(String(initialData.establishedYear));
      setWardenId(initialData.wardenId);
      setFacilities(initialData.facilities);
    } else {
      setName("");
      setCode("");
      setType("Boys");
      setCampus(HOSTEL_CAMPUSES[0]);
      setAddress("");
      setFloors("2");
      setEstablishedYear("2020");
      setWardenId("");
      setFacilities(["Wi-Fi", "Laundry", "CCTV"]);
    }
    setCustomFacility("");
  }, [open, initialData]);

  const toggleFacility = (facility: string) => {
    setFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility]
    );
  };

  const addCustomFacility = () => {
    const trimmed = customFacility.trim();
    if (!trimmed) return;
    setFacilities((current) =>
      current.includes(trimmed) ? current : [...current, trimmed]
    );
    setCustomFacility("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter the building name.");
      return;
    }
    if (!code.trim()) {
      toast.error("Please enter a short building code.");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter the building address.");
      return;
    }

    const matchedWarden = wardens.find((warden) => warden.id === wardenId);
    const record: HostelBuildingRecord = initialData
      ? {
          ...initialData,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          type,
          campus,
          address: address.trim(),
          floors: Math.max(1, Math.trunc(Number(floors) || 1)),
          establishedYear: Math.max(
            1900,
            Math.trunc(Number(establishedYear) || 2020)
          ),
          wardenId: matchedWarden?.id ?? "",
          facilities,
        }
      : {
          id: `bld-${totalCount + 1}-${code.trim().toLowerCase()}`,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          type,
          campus,
          address: address.trim(),
          floors: Math.max(1, Math.trunc(Number(floors) || 1)),
          establishedYear: Math.max(
            1900,
            Math.trunc(Number(establishedYear) || 2020)
          ),
          wardenId: matchedWarden?.id ?? "",
          facilities,
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Building "${record.name}" updated successfully.`
        : `Building "${record.name}" added to the hostel portfolio.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeaderClass}>
          <div className="flex items-center gap-3.5 pr-6">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing
                  ? `Edit Building — ${initialData?.code}`
                  : "Add Hostel Building"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the hostel building profile, warden and facilities."
                  : "Register a hostel building with campus, warden and facilities."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Building Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Biruni Boys Hostel"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Building Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="AHB"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  className={cn(fieldClass, "font-mono uppercase")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Hostel Type <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value as HostelBuildingType)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    {HOSTEL_BUILDING_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Campus <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={campus}
                    onChange={(event) => setCampus(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    {HOSTEL_CAMPUSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Chief Warden
                </label>
                <div className="relative">
                  <select
                    value={wardenId}
                    onChange={(event) => setWardenId(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="">Unassigned</option>
                    {wardens.map((warden) => (
                      <option key={warden.id} value={warden.id}>
                        {warden.name} — {warden.role}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Address <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Gate 2, Gulberg Campus, Lahore"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Floors
                </label>
                <input
                  type="number"
                  min={1}
                  value={floors}
                  onChange={(event) => setFloors(event.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Established Year
                </label>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={establishedYear}
                  onChange={(event) => setEstablishedYear(event.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-bold text-foreground">
                Facilities & Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(
                  new Set([...HOSTEL_FACILITY_OPTIONS, ...facilities])
                ).map((facility) => {
                  const active = facilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      className={cn(
                        "cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all",
                        active
                          ? "border-[#091d3e] bg-[#091d3e] text-white shadow-2xs"
                          : "border-border/80 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      )}
                    >
                      {facility}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add custom facility…"
                  value={customFacility}
                  onChange={(event) => setCustomFacility(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomFacility();
                    }
                  }}
                  className={cn(fieldClass, "h-9")}
                />
                <ActionButton
                  type="button"
                  tone="outline"
                  size="sm"
                  onClick={addCustomFacility}
                >
                  Add
                </ActionButton>
              </div>
            </div>

            <div className={summaryClass}>
              <div className="truncate pr-3">
                <span className="font-medium text-muted-foreground">Building: </span>
                <strong className="font-bold text-foreground">
                  {name.trim() || "New Hostel Building"}
                </strong>
              </div>
              <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-1 font-mono text-xs font-extrabold text-[#091d3e]">
                {code.trim().toUpperCase() || "CODE"} · {type} · {campus}
              </span>
            </div>
          </div>

          <div className={dialogFooterClass}>
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
              <span>{isEditing ? "Save Changes" : "Add Building"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. Room form                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  buildings: HostelBuildingRecord[];
  allocations: HostelAllocationRecord[];
  initialData?: HostelRoomRecord | null;
  onSave: (record: HostelRoomRecord) => void;
}

const ROOM_TYPE_CAPACITY: Record<HostelRoomType, number> = {
  Single: 1,
  Twin: 2,
  Triple: 3,
  Quad: 4,
  Dormitory: 6,
};

export function RoomFormModal({
  open,
  onOpenChange,
  totalCount,
  buildings,
  allocations,
  initialData,
  onSave,
}: RoomFormModalProps) {
  const isEditing = Boolean(initialData);

  const [buildingId, setBuildingId] = React.useState("");
  const [roomNo, setRoomNo] = React.useState("");
  const [floor, setFloor] = React.useState("1");
  const [roomType, setRoomType] = React.useState<HostelRoomType>("Quad");
  const [capacity, setCapacity] = React.useState("4");
  const [monthlyFee, setMonthlyFee] = React.useState("18000");
  const [maintenance, setMaintenance] = React.useState(false);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setBuildingId(initialData.buildingId);
      setRoomNo(initialData.roomNo);
      setFloor(String(initialData.floor));
      setRoomType(initialData.roomType);
      setCapacity(String(initialData.capacity));
      setMonthlyFee(String(initialData.monthlyFee));
      setMaintenance(initialData.maintenance);
      setNotes(initialData.notes ?? "");
    } else {
      setBuildingId(buildings[0]?.id ?? "");
      setRoomNo("");
      setFloor("1");
      setRoomType("Quad");
      setCapacity("4");
      setMonthlyFee("18000");
      setMaintenance(false);
      setNotes("");
    }
  }, [open, initialData, buildings]);

  const matchedBuilding = buildings.find(
    (building) => building.id === buildingId
  );
  const occupied = initialData
    ? countActiveInRoom(allocations, initialData.id)
    : 0;
  const numericCapacity = Math.max(1, Math.trunc(Number(capacity) || 1));
  const numericFee = Math.max(0, Math.trunc(Number(monthlyFee) || 0));

  const handleRoomTypeChange = (value: HostelRoomType) => {
    setRoomType(value);
    if (!isEditing) {
      setCapacity(String(ROOM_TYPE_CAPACITY[value]));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!matchedBuilding) {
      toast.error("Please select a hostel building.");
      return;
    }
    if (!roomNo.trim()) {
      toast.error("Please enter a room number.");
      return;
    }
    if (numericFee <= 0) {
      toast.error("Please enter a valid monthly room fee.");
      return;
    }
    if (numericCapacity < occupied) {
      toast.error(
        `This room already has ${occupied} active residents. Capacity cannot be reduced below that.`
      );
      return;
    }

    const record: HostelRoomRecord = initialData
      ? {
          ...initialData,
          buildingId: matchedBuilding.id,
          buildingName: matchedBuilding.name,
          roomNo: roomNo.trim().toUpperCase(),
          floor: Math.max(0, Math.trunc(Number(floor) || 0)),
          roomType,
          capacity: numericCapacity,
          monthlyFee: numericFee,
          maintenance,
          notes: notes.trim() || undefined,
        }
      : {
          id: `room-${totalCount + 1}-${roomNo.trim().toLowerCase()}`,
          buildingId: matchedBuilding.id,
          buildingName: matchedBuilding.name,
          roomNo: roomNo.trim().toUpperCase(),
          floor: Math.max(0, Math.trunc(Number(floor) || 0)),
          roomType,
          capacity: numericCapacity,
          monthlyFee: numericFee,
          maintenance,
          notes: notes.trim() || undefined,
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Room "${record.roomNo}" updated successfully.`
        : `Room "${record.roomNo}" added to ${record.buildingName}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeaderClass}>
          <div className="flex items-center gap-3.5 pr-6">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <BedDouble className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? `Edit Room — ${initialData?.roomNo}` : "Add Hostel Room"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update room capacity, type, fee or maintenance status."
                  : "Add a room to a hostel building with capacity and monthly fee."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Building <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={buildingId}
                    onChange={(event) => setBuildingId(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="" disabled>
                      Select building...
                    </option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Room Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="A-106"
                  value={roomNo}
                  onChange={(event) =>
                    setRoomNo(event.target.value.toUpperCase())
                  }
                  className={cn(fieldClass, "font-mono uppercase")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Floor
                </label>
                <input
                  type="number"
                  min={0}
                  value={floor}
                  onChange={(event) => setFloor(event.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Room Type <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={roomType}
                    onChange={(event) =>
                      handleRoomTypeChange(event.target.value as HostelRoomType)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    {HOSTEL_ROOM_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Bed Capacity <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
                {isEditing && (
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                    {occupied} beds currently occupied.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Monthly Fee <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
                    Rs
                  </span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={monthlyFee}
                    onChange={(event) => setMonthlyFee(event.target.value)}
                    className={cn(fieldClass, "pl-9 font-mono text-sm font-bold")}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Maintenance Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional — repair, renovation or out-of-service details"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMaintenance((current) => !current)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                maintenance
                  ? "border-warning/40 bg-warning-soft/50"
                  : "border-slate-200/90 bg-slate-50/70 hover:bg-slate-100/70"
              )}
            >
              <span className="flex items-center gap-2.5">
                <AlertTriangle
                  className={cn(
                    "size-4",
                    maintenance ? "text-warning" : "text-slate-400"
                  )}
                />
                <span>
                  <span className="block text-xs font-bold text-foreground">
                    Room under maintenance
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                    Maintenance rooms are excluded from occupancy and allocation.
                  </span>
                </span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                  maintenance ? "bg-warning" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all",
                    maintenance ? "left-[18px]" : "left-0.5"
                  )}
                />
              </span>
            </button>

            <div className={summaryClass}>
              <div className="truncate pr-3">
                <span className="font-medium text-muted-foreground">Room: </span>
                <strong className="font-bold text-foreground">
                  {roomNo.trim() || "New Room"}
                </strong>
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-semibold text-slate-700">
                  {matchedBuilding?.name ?? "Select building"}
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-1 font-mono text-xs font-extrabold text-[#091d3e]">
                {roomType} · {numericCapacity} beds · {formatCurrency(numericFee)}
              </span>
            </div>
          </div>

          <div className={dialogFooterClass}>
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
              <span>{isEditing ? "Save Changes" : "Add Room"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. Resident allocation form                                               */
/* ────────────────────────────────────────────────────────────────────────── */

interface AllocationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  buildings: HostelBuildingRecord[];
  rooms: HostelRoomRecord[];
  allocations: HostelAllocationRecord[];
  messPlans: HostelMessPlanRecord[];
  initialData?: HostelAllocationRecord | null;
  onSave: (record: HostelAllocationRecord) => void;
}

export function AllocationFormModal({
  open,
  onOpenChange,
  totalCount,
  buildings,
  rooms,
  allocations,
  messPlans,
  initialData,
  onSave,
}: AllocationFormModalProps) {
  const isEditing = Boolean(initialData);

  const [isManualStudent, setIsManualStudent] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState(
    HOSTEL_STUDENT_DIRECTORY[0]?.id ?? ""
  );
  const [manualName, setManualName] = React.useState("");
  const [manualClass, setManualClass] = React.useState("Grade 9-A");
  const [selectedBuildingId, setSelectedBuildingId] = React.useState("");
  const [selectedRoomId, setSelectedRoomId] = React.useState("");
  const [bedNumber, setBedNumber] = React.useState("1");
  const [checkInDate, setCheckInDate] = React.useState("");
  const [status, setStatus] = React.useState<HostelResidentStatus>("Active");
  const [messPlanId, setMessPlanId] = React.useState("");
  const [guardianPhone, setGuardianPhone] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      const directoryMatch = HOSTEL_STUDENT_DIRECTORY.find(
        (student) =>
          student.name.toLowerCase() === initialData.studentName.toLowerCase()
      );
      if (directoryMatch) {
        setIsManualStudent(false);
        setSelectedStudentId(directoryMatch.id);
        setManualName("");
      } else {
        setIsManualStudent(true);
        setManualName(initialData.studentName);
      }
      setManualClass(initialData.className);
      setSelectedBuildingId(initialData.buildingId || buildings[0]?.id || "");
      setSelectedRoomId(initialData.roomId);
      setBedNumber(
        initialData.bedNo ? initialData.bedNo.replace(/[^0-9]/g, "") || "1" : "1"
      );
      setCheckInDate(initialData.checkInDate || todayIso());
      setStatus(initialData.status);
      setMessPlanId(initialData.messPlanId);
      setGuardianPhone(initialData.guardianPhone);
    } else {
      const defaultBuilding = buildings[0];
      setIsManualStudent(false);
      setSelectedBuildingId(defaultBuilding?.id ?? "");
      setSelectedStudentId(
        HOSTEL_STUDENT_DIRECTORY.find(
          (student) =>
            !defaultBuilding || student.gender === defaultBuilding.type
        )?.id ?? ""
      );
      setManualName("");
      setManualClass("Grade 9-A");
      setSelectedRoomId("");
      setBedNumber("1");
      setCheckInDate(todayIso());
      setStatus("Active");
      setMessPlanId(
        messPlans.find((plan) => plan.buildingId === defaultBuilding?.id)?.id ??
          ""
      );
      setGuardianPhone("");
    }
  }, [open, initialData, buildings, messPlans]);

  const matchedBuilding = buildings.find(
    (building) => building.id === selectedBuildingId
  );

  const eligibleDirectory = React.useMemo(
    () =>
      HOSTEL_STUDENT_DIRECTORY.filter(
        (student) => !matchedBuilding || student.gender === matchedBuilding.type
      ),
    [matchedBuilding]
  );

  const directoryStudent = HOSTEL_STUDENT_DIRECTORY.find(
    (student) => student.id === selectedStudentId
  );
  const resolvedName = isManualStudent
    ? manualName.trim()
    : directoryStudent?.name ?? "";
  const resolvedRollNo = isManualStudent
    ? initialData?.studentRollNo || `STD-${1500 + totalCount}`
    : directoryStudent?.rollNo ?? `STD-${1500 + totalCount}`;
  const resolvedClass = isManualStudent
    ? manualClass.trim() || "Grade 9-A"
    : directoryStudent?.className ?? "Grade 9-A";

  const availableRooms = React.useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.buildingId === selectedBuildingId && !room.maintenance
      ),
    [rooms, selectedBuildingId]
  );

  const matchedRoom = availableRooms.find((room) => room.id === selectedRoomId);

  const buildingPlans = React.useMemo(
    () => messPlans.filter((plan) => plan.buildingId === selectedBuildingId),
    [messPlans, selectedBuildingId]
  );

  const occupiedBeds = React.useMemo(() => {
    if (!matchedRoom) return new Set<number>();
    return new Set(
      allocations
        .filter(
          (allocation) =>
            allocation.status === "Active" &&
            allocation.roomId === matchedRoom.id &&
            allocation.id !== initialData?.id
        )
        .map((allocation) =>
          Number(allocation.bedNo.replace(/[^0-9]/g, "") || 0)
        )
    );
  }, [allocations, matchedRoom, initialData?.id]);

  const bedOptions = React.useMemo(() => {
    if (!matchedRoom) return [] as number[];
    return Array.from({ length: matchedRoom.capacity }, (_, index) => index + 1);
  }, [matchedRoom]);

  const firstAvailableBed = bedOptions.find((bed) => !occupiedBeds.has(bed));
  const resolvedBed = Number(bedNumber) || firstAvailableBed || 1;
  const isBedTaken = occupiedBeds.has(resolvedBed);

  const handleToggleManualStudent = () => {
    if (isManualStudent) {
      const currentStudent = HOSTEL_STUDENT_DIRECTORY.find(
        (student) => student.id === selectedStudentId
      );
      if (
        !currentStudent ||
        (matchedBuilding && currentStudent.gender !== matchedBuilding.type)
      ) {
        setSelectedStudentId(eligibleDirectory[0]?.id ?? "");
      }
    } else if (!manualName.trim()) {
      setManualName(resolvedName);
      setManualClass(resolvedClass);
    }
    setIsManualStudent((current) => !current);
  };

  const handleBuildingChange = (value: string) => {
    setSelectedBuildingId(value);
    setSelectedRoomId("");
    setBedNumber("1");
    const plan = messPlans.find((item) => item.buildingId === value);
    setMessPlanId(plan?.id ?? "");

    if (!isManualStudent) {
      const nextBuilding = buildings.find((building) => building.id === value);
      const currentStudent = HOSTEL_STUDENT_DIRECTORY.find(
        (student) => student.id === selectedStudentId
      );
      if (!currentStudent || currentStudent.gender !== nextBuilding?.type) {
        setSelectedStudentId(
          HOSTEL_STUDENT_DIRECTORY.find(
            (student) =>
              !nextBuilding || student.gender === nextBuilding.type
          )?.id ?? ""
        );
      }
    }
  };

  const handleRoomChange = (value: string) => {
    setSelectedRoomId(value);
    const room = rooms.find((item) => item.id === value);
    const used = new Set(
      allocations
        .filter(
          (allocation) =>
            allocation.status === "Active" &&
            allocation.roomId === value &&
            allocation.id !== initialData?.id
        )
        .map((allocation) => Number(allocation.bedNo.replace(/[^0-9]/g, "") || 0))
    );
    const nextBed =
      Array.from({ length: room?.capacity ?? 1 }, (_, index) => index + 1).find(
        (bed) => !used.has(bed)
      ) ?? 1;
    setBedNumber(String(nextBed));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!resolvedName) {
      toast.error("Please select or enter a resident name.");
      return;
    }
    const duplicate = allocations.find(
      (allocation) =>
        allocation.id !== initialData?.id &&
        allocation.studentName.trim().toLowerCase() ===
          resolvedName.trim().toLowerCase() &&
        (allocation.status === "Active" ||
          allocation.status === "Waitlisted")
    );
    if (duplicate) {
      toast.error(
        duplicate.status === "Active"
          ? `${resolvedName} already has an active hostel allocation.`
          : `${resolvedName} is already on the waitlist. Open that record to allocate a room.`
      );
      return;
    }
    if (
      !isManualStudent &&
      directoryStudent &&
      matchedBuilding &&
      directoryStudent.gender !== matchedBuilding.type
    ) {
      toast.error(
        `${resolvedName} is eligible for ${directoryStudent.gender.toLowerCase()} hostels only.`
      );
      return;
    }
    if (status === "Active") {
      if (!matchedRoom) {
        toast.error("Please select an available room.");
        return;
      }
      if (isBedTaken) {
        toast.error(`Bed ${resolvedBed} is already occupied in ${matchedRoom.roomNo}.`);
        return;
      }
    }

    const record: HostelAllocationRecord = {
      id: initialData?.id ?? `alloc-${totalCount + 1}-${resolvedRollNo}`,
      allocationCode:
        initialData?.allocationCode ??
        `HST-${String(101 + totalCount).padStart(3, "0")}`,
      studentName: resolvedName,
      studentRollNo: resolvedRollNo,
      className: resolvedClass,
      buildingId: matchedBuilding?.id ?? "",
      buildingName: matchedBuilding?.name ?? "",
      roomId: status === "Active" ? matchedRoom?.id ?? "" : "",
      roomNo: status === "Active" ? matchedRoom?.roomNo ?? "" : "",
      bedNo: status === "Active" ? `Bed ${resolvedBed}` : "",
      roomType: status === "Active" ? matchedRoom?.roomType ?? "" : "",
      checkInDate: status === "Active" || status === "Checked Out" ? checkInDate : "",
      status,
      monthlyFee: status === "Active" ? matchedRoom?.monthlyFee ?? 0 : 0,
      messPlanId:
        status === "Active"
          ? buildingPlans.some((plan) => plan.id === messPlanId)
            ? messPlanId
            : buildingPlans[0]?.id ?? ""
          : "",
      guardianPhone: guardianPhone.trim(),
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Resident allocation for "${record.studentName}" updated.`
        : status === "Waitlisted"
        ? `"${record.studentName}" added to the hostel waitlist.`
        : `"${record.studentName}" allocated to ${record.buildingName} — ${record.roomNo} (${record.bedNo}).`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeaderClass}>
          <div className="flex items-center gap-3.5 pr-6">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? "Edit Resident Allocation" : "Allocate Resident"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the resident's room, bed, mess plan or residency status."
                  : "Allocate a student to a hostel room and mess plan."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold text-foreground">
                  Resident Name <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleToggleManualStudent}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-[#091d3e] transition-colors hover:bg-slate-200/80"
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
                    onChange={(event) => {
                      if (event.target.value === "__manual__") {
                        setIsManualStudent(true);
                      } else {
                        const nextStudent = HOSTEL_STUDENT_DIRECTORY.find(
                          (student) => student.id === event.target.value
                        );
                        if (
                          nextStudent &&
                          matchedBuilding &&
                          nextStudent.gender !== matchedBuilding.type
                        ) {
                          const nextBuilding = buildings.find(
                            (building) => building.type === nextStudent.gender
                          );
                          if (nextBuilding) {
                            setSelectedBuildingId(nextBuilding.id);
                            setSelectedRoomId("");
                            setBedNumber("1");
                            setMessPlanId(
                              messPlans.find(
                                (plan) => plan.buildingId === nextBuilding.id
                              )?.id ?? ""
                            );
                          }
                        }
                        setSelectedStudentId(event.target.value);
                      }
                    }}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    {eligibleDirectory.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} — {student.className} ({student.rollNo})
                      </option>
                    ))}
                    <option value="__manual__">
                      ✏️ Enter resident name manually...
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
                      placeholder="Enter full resident name..."
                      value={manualName}
                      onChange={(event) => setManualName(event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Class (e.g. Grade 9-A)"
                      value={manualClass}
                      onChange={(event) => setManualClass(event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Hostel Building <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedBuildingId}
                    onChange={(event) => handleBuildingChange(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="" disabled>
                      Select building...
                    </option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name} ({building.type})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Residency Status <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as HostelResidentStatus)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="Active">Active</option>
                    <option value="Waitlisted">Waitlisted</option>
                    <option value="Checked Out">Checked Out</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {status === "Active" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-foreground">
                      Room <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={selectedRoomId}
                        onChange={(event) => handleRoomChange(event.target.value)}
                        className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                      >
                        <option value="" disabled>
                          Select room...
                        </option>
                        {availableRooms.map((room) => {
                          const used = countActiveInRoom(
                            allocations,
                            room.id,
                            initialData?.id
                          );
                          const free = Math.max(0, room.capacity - used);
                          return (
                            <option
                              key={room.id}
                              value={room.id}
                              disabled={free === 0 && room.id !== selectedRoomId}
                            >
                              {room.roomNo} — {room.roomType} · {free} bed
                              {free === 1 ? "" : "s"} free ·{" "}
                              {formatCurrency(room.monthlyFee)}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-foreground">
                      Bed Number <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={String(resolvedBed)}
                        onChange={(event) => setBedNumber(event.target.value)}
                        className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                      >
                        {bedOptions.length === 0 ? (
                          <option value="1">Select a room first</option>
                        ) : (
                          bedOptions.map((bed) => (
                            <option
                              key={bed}
                              value={bed}
                              disabled={occupiedBeds.has(bed)}
                            >
                              Bed {bed}
                              {occupiedBeds.has(bed) ? " (occupied)" : ""}
                            </option>
                          ))
                        )}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-foreground">
                      Check-in Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(event) => setCheckInDate(event.target.value)}
                      className={cn(fieldClass, "font-mono")}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-foreground">
                      Mess Plan
                    </label>
                    <div className="relative">
                      <select
                        value={messPlanId}
                        onChange={(event) => setMessPlanId(event.target.value)}
                        className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                      >
                        <option value="">No mess subscription</option>
                        {buildingPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.planName} — {formatCurrency(plan.monthlyRate)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </>
              )}

              <div className={status === "Active" ? "sm:col-span-2" : "sm:col-span-2"}>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Guardian Contact
                </label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={guardianPhone}
                  onChange={(event) => setGuardianPhone(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>
            </div>

            <div className={summaryClass}>
              <div className="flex items-center gap-2 truncate">
                <BedDouble className="size-3.5 shrink-0 text-[#091d3e]" />
                <span className="font-bold text-foreground">
                  {resolvedName || "Select Resident"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-muted-foreground">
                  {status === "Active"
                    ? `${matchedRoom?.roomNo ?? "Room"} · Bed ${resolvedBed} · ${matchedBuilding?.name ?? "Building"}`
                    : status}
                </span>
              </div>
              {status === "Active" && matchedRoom && (
                <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#091d3e]">
                  {formatCurrency(matchedRoom.monthlyFee)} / mo
                </span>
              )}
            </div>
          </div>

          <div className={dialogFooterClass}>
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
              <span>{isEditing ? "Save Changes" : "Allocate Resident"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 4. Warden form                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

interface WardenFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  buildings: HostelBuildingRecord[];
  initialData?: HostelWardenRecord | null;
  onSave: (record: HostelWardenRecord) => void;
}

export function WardenFormModal({
  open,
  onOpenChange,
  totalCount,
  buildings,
  initialData,
  onSave,
}: WardenFormModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<HostelWardenRole>("Warden");
  const [buildingId, setBuildingId] = React.useState("");
  const [shift, setShift] = React.useState<HostelWardenShift>("Resident");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [joinedDate, setJoinedDate] = React.useState("");
  const [status, setStatus] = React.useState<HostelWardenStatus>("On Duty");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setBuildingId(initialData.buildingId);
      setShift(initialData.shift);
      setPhone(initialData.phone);
      setEmail(initialData.email);
      setJoinedDate(initialData.joinedDate);
      setStatus(initialData.status);
    } else {
      setName("");
      setRole("Warden");
      setBuildingId(buildings[0]?.id ?? "");
      setShift("Resident");
      setPhone("");
      setEmail("");
      setJoinedDate(todayIso());
      setStatus("On Duty");
    }
  }, [open, initialData, buildings]);

  const matchedBuilding = buildings.find(
    (building) => building.id === buildingId
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter the warden's full name.");
      return;
    }
    if (!matchedBuilding) {
      toast.error("Please select the building this warden supervises.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter a contact number.");
      return;
    }

    const record: HostelWardenRecord = initialData
      ? {
          ...initialData,
          name: name.trim(),
          role,
          buildingId: matchedBuilding.id,
          buildingName: matchedBuilding.name,
          shift,
          phone: phone.trim(),
          email: email.trim(),
          joinedDate,
          status,
        }
      : {
          id: `wdn-${totalCount + 1}-${name.trim().toLowerCase()}`,
          wardenCode: `WDN-${String(totalCount + 1).padStart(2, "0")}`,
          name: name.trim(),
          role,
          buildingId: matchedBuilding.id,
          buildingName: matchedBuilding.name,
          shift,
          phone: phone.trim(),
          email: email.trim(),
          joinedDate,
          status,
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Warden "${record.name}" updated successfully.`
        : `Warden "${record.name}" assigned to ${record.buildingName}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeaderClass}>
          <div className="flex items-center gap-3.5 pr-6">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? `Edit Warden — ${initialData?.wardenCode}` : "Add Warden"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the warden's building, shift, contact or duty status."
                  : "Assign a warden to a hostel building with shift and contact details."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Imran Khalid"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Role <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as HostelWardenRole)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="Chief Warden">Chief Warden</option>
                    <option value="Warden">Warden</option>
                    <option value="Assistant Warden">Assistant Warden</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Building <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={buildingId}
                    onChange={(event) => setBuildingId(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="" disabled>
                      Select building...
                    </option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Shift
                </label>
                <div className="relative">
                  <select
                    value={shift}
                    onChange={(event) =>
                      setShift(event.target.value as HostelWardenShift)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="Resident">Resident</option>
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Duty Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as HostelWardenStatus)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Phone <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="warden@opus.edu.pk"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Joined Date
                </label>
                <input
                  type="date"
                  value={joinedDate}
                  onChange={(event) => setJoinedDate(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>
            </div>

            <div className={summaryClass}>
              <div className="flex items-center gap-2 truncate">
                <Building2 className="size-3.5 shrink-0 text-[#091d3e]" />
                <span className="font-bold text-foreground">
                  {name.trim() || "New Warden"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-muted-foreground">
                  {role} · {matchedBuilding?.name ?? "No building"}
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#091d3e]">
                {shift} · {status}
              </span>
            </div>
          </div>

          <div className={dialogFooterClass}>
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
              <span>{isEditing ? "Save Changes" : "Add Warden"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 5. Mess plan form                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

interface MessPlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  buildings: HostelBuildingRecord[];
  initialData?: HostelMessPlanRecord | null;
  onSave: (record: HostelMessPlanRecord) => void;
}

export function MessPlanFormModal({
  open,
  onOpenChange,
  totalCount,
  buildings,
  initialData,
  onSave,
}: MessPlanFormModalProps) {
  const isEditing = Boolean(initialData);

  const [planName, setPlanName] = React.useState("");
  const [buildingId, setBuildingId] = React.useState("");
  const [vendor, setVendor] = React.useState("");
  const [monthlyRate, setMonthlyRate] = React.useState("9500");
  const [meals, setMeals] = React.useState<string[]>([
    "Breakfast",
    "Lunch",
    "Dinner",
  ]);
  const [serviceDays, setServiceDays] = React.useState("30");
  const [status, setStatus] = React.useState<"Active" | "Paused">("Active");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setPlanName(initialData.planName);
      setBuildingId(initialData.buildingId);
      setVendor(initialData.vendor);
      setMonthlyRate(String(initialData.monthlyRate));
      setMeals(initialData.meals);
      setServiceDays(String(initialData.serviceDays));
      setStatus(initialData.status);
    } else {
      setPlanName("");
      setBuildingId(buildings[0]?.id ?? "");
      setVendor("");
      setMonthlyRate("9500");
      setMeals(["Breakfast", "Lunch", "Dinner"]);
      setServiceDays("30");
      setStatus("Active");
    }
  }, [open, initialData, buildings]);

  const matchedBuilding = buildings.find(
    (building) => building.id === buildingId
  );
  const numericRate = Math.max(0, Math.trunc(Number(monthlyRate) || 0));

  const toggleMeal = (meal: string) => {
    setMeals((current) =>
      current.includes(meal)
        ? current.filter((item) => item !== meal)
        : [...current, meal]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!planName.trim()) {
      toast.error("Please enter a mess plan name.");
      return;
    }
    if (!matchedBuilding) {
      toast.error("Please select the building served by this mess plan.");
      return;
    }
    if (!vendor.trim()) {
      toast.error("Please enter the catering vendor.");
      return;
    }
    if (numericRate <= 0) {
      toast.error("Please enter a valid monthly mess rate.");
      return;
    }
    if (meals.length === 0) {
      toast.error("Please select at least one meal.");
      return;
    }

    const record: HostelMessPlanRecord = initialData
      ? {
          ...initialData,
          planName: planName.trim(),
          buildingId: matchedBuilding.id,
          buildingName: matchedBuilding.name,
          vendor: vendor.trim(),
          monthlyRate: numericRate,
          meals,
          serviceDays: Math.max(1, Math.trunc(Number(serviceDays) || 30)),
          status,
        }
      : {
          id: `mess-${totalCount + 1}-${planName.trim().toLowerCase()}`,
          planCode: `MESS-${String(totalCount + 1).padStart(2, "0")}`,
          planName: planName.trim(),
          buildingId: matchedBuilding.id,
          buildingName: matchedBuilding.name,
          vendor: vendor.trim(),
          monthlyRate: numericRate,
          meals,
          serviceDays: Math.max(1, Math.trunc(Number(serviceDays) || 30)),
          status,
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Mess plan "${record.planName}" updated.`
        : `Mess plan "${record.planName}" created for ${record.buildingName}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeaderClass}>
          <div className="flex items-center gap-3.5 pr-6">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <UtensilsCrossed className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? `Edit Mess Plan — ${initialData?.planCode}` : "Add Mess Plan"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the mess plan vendor, rate, meals or service status."
                  : "Define a mess plan with vendor, monthly rate and meal coverage."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Plan Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Boys Mess — Al-Biruni"
                  value={planName}
                  onChange={(event) => setPlanName(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Building <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={buildingId}
                    onChange={(event) => setBuildingId(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="" disabled>
                      Select building...
                    </option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Vendor <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Catering partner"
                  value={vendor}
                  onChange={(event) => setVendor(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Monthly Rate <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
                    Rs
                  </span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={monthlyRate}
                    onChange={(event) => setMonthlyRate(event.target.value)}
                    className={cn(fieldClass, "pl-9 font-mono text-sm font-bold")}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Service Days / Month
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={serviceDays}
                  onChange={(event) => setServiceDays(event.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-bold text-foreground">
                Meals Covered <span className="text-danger">*</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {HOSTEL_MEAL_OPTIONS.map((meal) => {
                  const active = meals.includes(meal);
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => toggleMeal(meal)}
                      className={cn(
                        "cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all",
                        active
                          ? "border-[#091d3e] bg-[#091d3e] text-white shadow-2xs"
                          : "border-border/80 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      )}
                    >
                      {meal}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">
                Plan Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "Active" | "Paused")
                  }
                  className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className={summaryClass}>
              <div className="truncate pr-3">
                <span className="font-medium text-muted-foreground">Plan: </span>
                <strong className="font-bold text-foreground">
                  {planName.trim() || "New Mess Plan"}
                </strong>
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-semibold text-slate-700">
                  {meals.length} meals · {serviceDays || 30} days
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-1 font-mono text-xs font-extrabold text-[#091d3e]">
                {formatCurrency(numericRate)} / mo
              </span>
            </div>
          </div>

          <div className={dialogFooterClass}>
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
              <span>{isEditing ? "Save Changes" : "Add Mess Plan"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 6. Attendance form                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

interface AttendanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  residents: HostelAllocationRecord[];
  initialData?: HostelAttendanceRecord | null;
  onSave: (record: HostelAttendanceRecord) => void;
}

export function AttendanceFormModal({
  open,
  onOpenChange,
  totalCount,
  residents,
  initialData,
  onSave,
}: AttendanceFormModalProps) {
  const isEditing = Boolean(initialData);

  const [residentId, setResidentId] = React.useState(residents[0]?.id ?? "");
  const [date, setDate] = React.useState("");
  const [status, setStatus] = React.useState<HostelAttendanceStatus>("Present");
  const [checkInTime, setCheckInTime] = React.useState("19:00");
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      const matched = residents.find(
        (resident) =>
          resident.studentRollNo === initialData.studentRollNo ||
          resident.studentName === initialData.studentName
      );
      setResidentId(matched?.id ?? residents[0]?.id ?? "");
      setDate(initialData.date);
      setStatus(initialData.status);
      setCheckInTime(initialData.checkInTime);
      setRemarks(initialData.remarks ?? "");
    } else {
      setResidentId(residents[0]?.id ?? "");
      setDate(todayIso());
      setStatus("Present");
      setCheckInTime("19:00");
      setRemarks("");
    }
  }, [open, initialData, residents]);

  const resident = residents.find((item) => item.id === residentId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!resident) {
      toast.error("Please select a resident.");
      return;
    }
    if (!date) {
      toast.error("Please select the attendance date.");
      return;
    }

    const isAway = status === "Absent" || status === "On Leave";
    const record: HostelAttendanceRecord = {
      id: initialData?.id ?? `att-${totalCount + 1}-${resident.studentRollNo}`,
      date,
      studentName: resident.studentName,
      studentRollNo: resident.studentRollNo,
      buildingName: resident.buildingName,
      roomNo: resident.roomNo,
      status,
      checkInTime: isAway ? "—" : checkInTime || "—",
      remarks: remarks.trim() || undefined,
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Attendance for "${record.studentName}" updated.`
        : `Attendance marked ${status.toLowerCase()} for ${record.studentName}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeaderClass}>
          <div className="flex items-center gap-3.5 pr-6">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <CalendarDays className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? "Edit Hostel Attendance" : "Mark Hostel Attendance"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the resident's attendance status, time or remarks."
                  : "Record a resident's hostel attendance for the selected date."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">
                Resident <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={residentId}
                  onChange={(event) => setResidentId(event.target.value)}
                  className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                >
                  {residents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.studentName} — {item.roomNo} ({item.studentRollNo})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Status <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as HostelAttendanceStatus)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(event) => setCheckInTime(event.target.value)}
                  disabled={status === "Absent" || status === "On Leave"}
                  className={cn(
                    fieldClass,
                    "font-mono disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted-foreground"
                  )}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="Optional note"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className={summaryClass}>
              <div className="flex items-center gap-2 truncate">
                <BedDouble className="size-3.5 shrink-0 text-[#091d3e]" />
                <span className="font-bold text-foreground">
                  {resident?.studentName ?? "Select resident"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-muted-foreground">
                  {resident ? `${resident.roomNo} · ${resident.buildingName}` : ""}
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#091d3e]">
                {date ? formatDate(date) : "Select date"} · {status}
              </span>
            </div>
          </div>

          <div className={dialogFooterClass}>
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
              <span>{isEditing ? "Save Changes" : "Mark Attendance"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 7. Visitor form                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

interface VisitorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  residents: HostelAllocationRecord[];
  initialData?: HostelVisitorRecord | null;
  onSave: (record: HostelVisitorRecord) => void;
}

export function VisitorFormModal({
  open,
  onOpenChange,
  totalCount,
  residents,
  initialData,
  onSave,
}: VisitorFormModalProps) {
  const isEditing = Boolean(initialData);

  const [visitorName, setVisitorName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [cnic, setCnic] = React.useState("");
  const [residentName, setResidentName] = React.useState(
    residents[0]?.studentName ?? ""
  );
  const [relationship, setRelationship] = React.useState("Parent");
  const [purpose, setPurpose] = React.useState("");
  const [visitDate, setVisitDate] = React.useState("");
  const [checkInTime, setCheckInTime] = React.useState("—");
  const [checkOutTime, setCheckOutTime] = React.useState("");
  const [status, setStatus] = React.useState<HostelVisitorStatus>("Approved");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setVisitorName(initialData.visitorName);
      setPhone(initialData.phone);
      setCnic(initialData.cnic);
      setResidentName(initialData.residentName);
      setRelationship(initialData.relationship);
      setPurpose(initialData.purpose);
      setVisitDate(initialData.visitDate);
      setCheckInTime(initialData.checkInTime);
      setCheckOutTime(initialData.checkOutTime ?? "");
      setStatus(initialData.status);
    } else {
      setVisitorName("");
      setPhone("");
      setCnic("");
      setResidentName(residents[0]?.studentName ?? "");
      setRelationship("Parent");
      setPurpose("");
      setVisitDate(todayIso());
      setCheckInTime("—");
      setCheckOutTime("");
      setStatus("Approved");
    }
  }, [open, initialData, residents]);

  const resident = residents.find(
    (item) =>
      item.studentName === residentName ||
      item.studentRollNo === initialData?.residentRollNo
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!visitorName.trim()) {
      toast.error("Please enter the visitor's name.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter the visitor's contact number.");
      return;
    }
    if (!resident) {
      toast.error("Please select the resident being visited.");
      return;
    }
    if (!purpose.trim()) {
      toast.error("Please record the purpose of the visit.");
      return;
    }

    const record: HostelVisitorRecord = {
      id: initialData?.id ?? `vis-${totalCount + 1}-${visitorName.trim().toLowerCase()}`,
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      cnic: cnic.trim(),
      residentName: resident.studentName,
      residentRollNo: resident.studentRollNo,
      buildingName: resident.buildingName,
      roomNo: resident.roomNo,
      relationship,
      purpose: purpose.trim(),
      visitDate,
      checkInTime:
        status === "Pending" ? "—" : checkInTime === "—" ? "—" : checkInTime,
      checkOutTime:
        status === "Checked Out" ? checkOutTime || "—" : checkOutTime || undefined,
      status,
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Visitor entry for "${record.visitorName}" updated.`
        : `Visitor "${record.visitorName}" logged for ${record.residentName}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeaderClass}>
          <div className="flex items-center gap-3.5 pr-6">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? "Edit Visitor Entry" : "Log Hostel Visitor"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update visitor details, resident, purpose or gate status."
                  : "Record a visitor at the hostel gate with resident and purpose details."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Visitor Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={visitorName}
                  onChange={(event) => setVisitorName(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Phone <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  CNIC
                </label>
                <input
                  type="text"
                  placeholder="35202-1234567-1"
                  value={cnic}
                  onChange={(event) => setCnic(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Relationship
                </label>
                <div className="relative">
                  <select
                    value={relationship}
                    onChange={(event) => setRelationship(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Family Friend">Family Friend</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Resident Being Visited <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={residentName}
                    onChange={(event) => setResidentName(event.target.value)}
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    {residents.map((item) => (
                      <option key={item.id} value={item.studentName}>
                        {item.studentName} — {item.roomNo} ({item.studentRollNo})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Purpose of Visit <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly visit, fee submission, medical appointment"
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Gate Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as HostelVisitorStatus)
                    }
                    className={cn(fieldClass, "cursor-pointer appearance-none pr-9")}
                  >
                    <option value="Approved">Approved / Checked In</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Checked Out">Checked Out</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={checkInTime === "—" ? "" : checkInTime}
                  onChange={(event) => setCheckInTime(event.target.value)}
                  disabled={status === "Pending"}
                  className={cn(
                    fieldClass,
                    "font-mono disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted-foreground"
                  )}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(event) => setCheckOutTime(event.target.value)}
                  className={cn(fieldClass, "font-mono")}
                />
              </div>
            </div>

            <div className={summaryClass}>
              <div className="flex items-center gap-2 truncate">
                <UserRound className="size-3.5 shrink-0 text-[#091d3e]" />
                <span className="font-bold text-foreground">
                  {visitorName.trim() || "Visitor"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-muted-foreground">
                  visiting {resident?.studentName ?? (residentName || "resident")}
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-[#091d3e]/10 px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#091d3e]">
                {visitDate || "Date"} · {status}
              </span>
            </div>
          </div>

          <div className={dialogFooterClass}>
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
              <span>{isEditing ? "Save Changes" : "Log Visitor"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 8. Delete confirmation                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => boolean | void;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-md gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-rose-50/50 px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          <div className="flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/60 p-3.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
            <p className="text-xs leading-relaxed text-slate-700">
              {description}
            </p>
          </div>
        </div>

        <div className={dialogFooterClass}>
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
              const result = onConfirm();
              if (result !== false) onOpenChange(false);
            }}
          >
            <Trash2 className="size-3.5" />
            <span>{confirmLabel}</span>
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
