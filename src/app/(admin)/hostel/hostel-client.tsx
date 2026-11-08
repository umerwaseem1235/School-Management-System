"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  Edit,
  FileDown,
  IdCard,
  LayoutDashboard,
  LogOut,
  Plus,
  Printer,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
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
import { ActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabBadge,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import {
  HOSTEL_ALLOCATIONS,
  HOSTEL_ATTENDANCE,
  HOSTEL_BUILDINGS,
  HOSTEL_CAMPUSES,
  HOSTEL_MESS_PLANS,
  HOSTEL_ROOMS,
  HOSTEL_ROOM_TYPES,
  HOSTEL_VISITORS,
  HOSTEL_WARDENS,
  type HostelAllocationRecord,
  type HostelAttendanceRecord,
  type HostelBuildingRecord,
  type HostelMessPlanRecord,
  type HostelRoomRecord,
  type HostelRoomStatus,
  type HostelVisitorRecord,
  type HostelWardenRecord,
} from "@/lib/mock/hostel";
import {
  exportAttendancePdf,
  exportBuildingRosterPdf,
  exportBuildingsPdf,
  exportHostelOverviewPdf,
  exportMessPdf,
  exportResidentHostelCardPdf,
  exportResidentsPdf,
  exportRoomsPdf,
  exportVisitorsPdf,
  exportWardensPdf,
  printHostelOverview,
} from "./hostel-export";
import {
  AllocationFormModal,
  AttendanceFormModal,
  BuildingFormModal,
  DeleteConfirmModal,
  MessPlanFormModal,
  RoomFormModal,
  VisitorFormModal,
  WardenFormModal,
} from "./hostel-form-modals";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types & helpers                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

type HostelTab =
  | "overview"
  | "buildings"
  | "rooms"
  | "residents"
  | "wardens"
  | "mess"
  | "attendance"
  | "visitors";

interface BuildingRow {
  building: HostelBuildingRecord;
  rooms: HostelRoomRecord[];
  usableBeds: number;
  maintenanceRooms: number;
  occupiedBeds: number;
  percent: number;
  warden?: HostelWardenRecord;
}

interface RoomRow extends HostelRoomRecord {
  occupied: number;
  computedStatus: HostelRoomStatus;
}

interface DeleteTarget {
  type: HostelTab;
  id: string;
  label: string;
  description: string;
}

const TAB_META: Array<{
  value: HostelTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "buildings", label: "Buildings", icon: Building2 },
  { value: "rooms", label: "Rooms", icon: BedDouble },
  { value: "residents", label: "Residents", icon: Users },
  { value: "wardens", label: "Wardens", icon: ShieldCheck },
  { value: "mess", label: "Mess", icon: UtensilsCrossed },
  { value: "attendance", label: "Attendance", icon: ClipboardCheck },
  { value: "visitors", label: "Visitors", icon: IdCard },
];

const PRIMARY_LABEL: Record<HostelTab, string> = {
  overview: "Allocate Resident",
  buildings: "Add Building",
  rooms: "Add Room",
  residents: "Allocate Resident",
  wardens: "Add Warden",
  mess: "Add Mess Plan",
  attendance: "Mark Attendance",
  visitors: "Log Visitor",
};

const iconActionClass =
  "size-7 rounded-lg border-amber-200 bg-amber-50/70 px-0 text-amber-700 shadow-2xs transition-colors hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800 [&_svg]:text-amber-600";

const pdfActionClass =
  "size-7 rounded-lg border-indigo-200 bg-indigo-50/70 px-0 text-indigo-700 shadow-2xs transition-colors hover:border-indigo-400 hover:bg-indigo-100 hover:text-indigo-800 [&_svg]:text-indigo-600";

const dangerActionClass =
  "size-7 rounded-lg border-rose-200 bg-rose-50/70 px-0 text-rose-700 shadow-2xs transition-colors hover:border-rose-400 hover:bg-rose-100 hover:text-rose-800 [&_svg]:text-rose-600";

function upsertRecord<T extends { id: string }>(items: T[], record: T): T[] {
  return items.some((item) => item.id === record.id)
    ? items.map((item) => (item.id === record.id ? record : item))
    : [record, ...items];
}

function shortBuildingName(name: string): string {
  return name
    .replace(/\s+Hostel$/i, "")
    .replace(/\s+(Boys|Girls)$/i, "");
}

function currentTimeLabel(): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function occupancyTone(percent: number) {
  if (percent >= 90) return "warning" as const;
  if (percent >= 60) return "brand" as const;
  return "info" as const;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Workspace                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export function HostelClient() {
  const [activeTab, setActiveTab] = React.useState<HostelTab>("overview");

  React.useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (TAB_META.some((tab) => tab.value === hash)) {
      setActiveTab(hash as HostelTab);
    }
  }, []);

  const selectTab = React.useCallback((tab: HostelTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tab}`);
    }
  }, []);

  const [buildings, setBuildings] =
    React.useState<HostelBuildingRecord[]>(HOSTEL_BUILDINGS);
  const [rooms, setRooms] = React.useState<HostelRoomRecord[]>(HOSTEL_ROOMS);
  const [allocations, setAllocations] =
    React.useState<HostelAllocationRecord[]>(HOSTEL_ALLOCATIONS);
  const [wardens, setWardens] =
    React.useState<HostelWardenRecord[]>(HOSTEL_WARDENS);
  const [messPlans, setMessPlans] =
    React.useState<HostelMessPlanRecord[]>(HOSTEL_MESS_PLANS);
  const [attendance, setAttendance] =
    React.useState<HostelAttendanceRecord[]>(HOSTEL_ATTENDANCE);
  const [visitors, setVisitors] =
    React.useState<HostelVisitorRecord[]>(HOSTEL_VISITORS);

  const [buildingModalOpen, setBuildingModalOpen] = React.useState(false);
  const [roomModalOpen, setRoomModalOpen] = React.useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = React.useState(false);
  const [wardenModalOpen, setWardenModalOpen] = React.useState(false);
  const [messModalOpen, setMessModalOpen] = React.useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = React.useState(false);
  const [visitorModalOpen, setVisitorModalOpen] = React.useState(false);

  const [editingBuilding, setEditingBuilding] =
    React.useState<HostelBuildingRecord | null>(null);
  const [editingRoom, setEditingRoom] =
    React.useState<HostelRoomRecord | null>(null);
  const [editingAllocation, setEditingAllocation] =
    React.useState<HostelAllocationRecord | null>(null);
  const [editingWarden, setEditingWarden] =
    React.useState<HostelWardenRecord | null>(null);
  const [editingMessPlan, setEditingMessPlan] =
    React.useState<HostelMessPlanRecord | null>(null);
  const [editingAttendance, setEditingAttendance] =
    React.useState<HostelAttendanceRecord | null>(null);
  const [editingVisitor, setEditingVisitor] =
    React.useState<HostelVisitorRecord | null>(null);

  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(
    null
  );

  /* ───────────────────── Derived data ───────────────────── */

  const activeAllocations = React.useMemo(
    () => allocations.filter((allocation) => allocation.status === "Active"),
    [allocations]
  );

  const waitlistedAllocations = React.useMemo(
    () =>
      allocations.filter((allocation) => allocation.status === "Waitlisted"),
    [allocations]
  );

  const roomOccupancy = React.useMemo(() => {
    const map = new Map<string, number>();
    activeAllocations.forEach((allocation) => {
      if (!allocation.roomId) return;
      map.set(allocation.roomId, (map.get(allocation.roomId) ?? 0) + 1);
    });
    return map;
  }, [activeAllocations]);

  const roomRows: RoomRow[] = React.useMemo(
    () =>
      rooms.map((room) => {
        const occupied = roomOccupancy.get(room.id) ?? 0;
        const computedStatus: HostelRoomStatus = room.maintenance
          ? "Maintenance"
          : occupied >= room.capacity
          ? "Full"
          : "Available";
        return { ...room, occupied, computedStatus };
      }),
    [rooms, roomOccupancy]
  );

  const buildingRows: BuildingRow[] = React.useMemo(
    () =>
      buildings.map((building) => {
        const buildingRooms = rooms.filter(
          (room) => room.buildingId === building.id
        );
        const usableRooms = buildingRooms.filter((room) => !room.maintenance);
        const usableBeds = usableRooms.reduce(
          (sum, room) => sum + room.capacity,
          0
        );
        const occupiedBeds = activeAllocations.filter(
          (allocation) => allocation.buildingId === building.id
        ).length;
        const percent =
          usableBeds > 0 ? Math.round((occupiedBeds / usableBeds) * 100) : 0;
        const warden =
          wardens.find((item) => item.id === building.wardenId) ??
          wardens.find(
            (item) =>
              item.buildingId === building.id && item.role === "Chief Warden"
          ) ??
          wardens.find((item) => item.buildingId === building.id);

        return {
          building,
          rooms: buildingRooms,
          usableBeds,
          maintenanceRooms: buildingRooms.filter((room) => room.maintenance)
            .length,
          occupiedBeds,
          percent,
          warden,
        };
      }),
    [buildings, rooms, activeAllocations, wardens]
  );

  const totalRooms = rooms.length;
  const usableBeds = React.useMemo(
    () =>
      rooms
        .filter((room) => !room.maintenance)
        .reduce((sum, room) => sum + room.capacity, 0),
    [rooms]
  );
  const maintenanceRooms = rooms.filter((room) => room.maintenance).length;
  const availableBeds = Math.max(0, usableBeds - activeAllocations.length);
  const occupancyPercent =
    usableBeds > 0
      ? Number(((activeAllocations.length / usableBeds) * 100).toFixed(1))
      : 0;
  const wardensOnDuty = wardens.filter(
    (warden) => warden.status === "On Duty"
  ).length;

  const messRevenue = React.useMemo(
    () =>
      activeAllocations.reduce((sum, allocation) => {
        const plan = messPlans.find(
          (item) => item.id === allocation.messPlanId
        );
        return sum + (plan?.monthlyRate ?? 0);
      }, 0),
    [activeAllocations, messPlans]
  );

  const openVisitors = visitors.filter(
    (visitor) => visitor.status === "Approved"
  );

  const latestAttendanceDate = React.useMemo(
    () =>
      attendance.reduce(
        (latest, record) => (record.date > latest ? record.date : latest),
        ""
      ),
    [attendance]
  );

  const latestAttendance = React.useMemo(
    () =>
      attendance.filter((record) => record.date === latestAttendanceDate),
    [attendance, latestAttendanceDate]
  );

  const attendanceStats = React.useMemo(
    () => ({
      present: latestAttendance.filter((record) => record.status === "Present")
        .length,
      late: latestAttendance.filter((record) => record.status === "Late")
        .length,
      absent: latestAttendance.filter((record) => record.status === "Absent")
        .length,
      leave: latestAttendance.filter((record) => record.status === "On Leave")
        .length,
    }),
    [latestAttendance]
  );

  const latestCheckIns = React.useMemo(
    () =>
      [...activeAllocations]
        .sort((a, b) => b.checkInDate.localeCompare(a.checkInDate))
        .slice(0, 6),
    [activeAllocations]
  );

  const alerts = React.useMemo(() => {
    const items: Array<{
      tone: "warning" | "danger" | "info" | "success";
      icon: typeof AlertTriangle;
      title: string;
      detail: string;
    }> = [];

    if (maintenanceRooms > 0) {
      items.push({
        tone: "warning",
        icon: Wrench,
        title: `${maintenanceRooms} room${maintenanceRooms === 1 ? "" : "s"} out of service`,
        detail:
          "Maintenance rooms are excluded from bed capacity until cleared.",
      });
    }

    if (waitlistedAllocations.length > 0) {
      items.push({
        tone: "info",
        icon: Clock3,
        title: `${waitlistedAllocations.length} student${
          waitlistedAllocations.length === 1 ? "" : "s"
        } on the waitlist`,
        detail: "Review available beds and confirm pending allocations.",
      });
    }

    const nearCapacity = buildingRows.find((row) => row.percent >= 90);
    if (nearCapacity) {
      items.push({
        tone: "danger",
        icon: AlertTriangle,
        title: `${shortBuildingName(nearCapacity.building.name)} near capacity`,
        detail: `${nearCapacity.occupiedBeds} of ${nearCapacity.usableBeds} usable beds are occupied.`,
      });
    }

    const coverageGap = wardens.filter(
      (warden) => warden.status !== "On Duty"
    ).length;
    if (coverageGap > 0) {
      items.push({
        tone: "warning",
        icon: ShieldCheck,
        title: `${coverageGap} warden${coverageGap === 1 ? "" : "s"} off duty or on leave`,
        detail: "Confirm shift coverage before the evening roll call.",
      });
    }

    if (openVisitors.length > 0) {
      items.push({
        tone: "success",
        icon: IdCard,
        title: `${openVisitors.length} visitor pass${
          openVisitors.length === 1 ? "" : "es"
        } currently open`,
        detail: "Ensure all visitors are checked out at the main gate.",
      });
    }

    return items.slice(0, 4);
  }, [
    maintenanceRooms,
    waitlistedAllocations.length,
    buildingRows,
    wardens,
    openVisitors.length,
  ]);

  /* ───────────────────── Save handlers ───────────────────── */

  const handleSaveBuilding = (record: HostelBuildingRecord) => {
    setBuildings((current) =>
      upsertRecord(current, record).map((building) =>
        building.id !== record.id &&
        record.wardenId &&
        building.wardenId === record.wardenId
          ? { ...building, wardenId: "" }
          : building
      )
    );

    setRooms((current) =>
      current.map((room) =>
        room.buildingId === record.id
          ? { ...room, buildingName: record.name }
          : room
      )
    );
    setAllocations((current) =>
      current.map((allocation) =>
        allocation.buildingId === record.id
          ? { ...allocation, buildingName: record.name }
          : allocation
      )
    );
    setMessPlans((current) =>
      current.map((plan) =>
        plan.buildingId === record.id
          ? { ...plan, buildingName: record.name }
          : plan
      )
    );
    setWardens((current) =>
      current.map((warden) => {
        if (warden.id === record.wardenId && record.wardenId) {
          return {
            ...warden,
            buildingId: record.id,
            buildingName: record.name,
          };
        }
        if (warden.buildingId === record.id) {
          return { ...warden, buildingName: record.name };
        }
        return warden;
      })
    );
  };

  const handleSaveRoom = (record: HostelRoomRecord) => {
    const occupied = activeAllocations.filter(
      (allocation) => allocation.roomId === record.id
    ).length;

    if (record.capacity < occupied) {
      toast.error(
        `Room ${record.roomNo} has ${occupied} active residents. Capacity cannot be below that.`
      );
      return;
    }
    if (record.maintenance && occupied > 0) {
      toast.error(
        `Reassign the ${occupied} resident${occupied === 1 ? "" : "s"} in ${
          record.roomNo
        } before marking it under maintenance.`
      );
      return;
    }

    setRooms((current) => upsertRecord(current, record));
    setAllocations((current) =>
      current.map((allocation) =>
        allocation.roomId === record.id && allocation.status === "Active"
          ? {
              ...allocation,
              roomNo: record.roomNo,
              roomType: record.roomType,
              monthlyFee: record.monthlyFee,
              buildingId: record.buildingId,
              buildingName: record.buildingName,
            }
          : allocation
      )
    );
  };

  const handleSaveAllocation = (record: HostelAllocationRecord) => {
    if (record.status === "Active") {
      const room = rooms.find((item) => item.id === record.roomId);
      if (!room) {
        toast.error("Select a valid room before allocating this resident.");
        return;
      }
      const occupants = allocations.filter(
        (allocation) =>
          allocation.status === "Active" &&
          allocation.roomId === record.roomId &&
          allocation.id !== record.id
      );
      if (occupants.length >= room.capacity) {
        toast.error(
          `Room ${room.roomNo} is already full. Choose another room or bed.`
        );
        return;
      }
      if (occupants.some((item) => item.bedNo === record.bedNo)) {
        toast.error(`${record.bedNo} is already occupied in ${room.roomNo}.`);
        return;
      }
    }

    setAllocations((current) => upsertRecord(current, record));
  };

  const handleSaveWarden = (record: HostelWardenRecord) => {
    setWardens((current) => upsertRecord(current, record));
    setBuildings((current) =>
      current.map((building) => {
        if (
          building.wardenId === record.id &&
          (building.id !== record.buildingId || record.role !== "Chief Warden")
        ) {
          return { ...building, wardenId: "" };
        }
        if (
          record.role === "Chief Warden" &&
          building.id === record.buildingId
        ) {
          return { ...building, wardenId: record.id };
        }
        return building;
      })
    );
  };

  const handleSaveMessPlan = (record: HostelMessPlanRecord) => {
    setMessPlans((current) => upsertRecord(current, record));
  };

  const handleSaveAttendance = (record: HostelAttendanceRecord) => {
    setAttendance((current) => upsertRecord(current, record));
  };

  const handleSaveVisitor = (record: HostelVisitorRecord) => {
    setVisitors((current) => upsertRecord(current, record));
  };

  const handleCheckOutResident = (allocation: HostelAllocationRecord) => {
    setAllocations((current) =>
      current.map((item) =>
        item.id === allocation.id
          ? {
              ...item,
              status: "Checked Out",
              monthlyFee: 0,
              messPlanId: "",
            }
          : item
      )
    );
    toast.success(
      `${allocation.studentName} checked out. The bed is now available.`
    );
  };

  const handleCheckOutVisitor = (visitor: HostelVisitorRecord) => {
    const checkOutTime = currentTimeLabel();
    setVisitors((current) =>
      current.map((item) =>
        item.id === visitor.id
          ? { ...item, status: "Checked Out", checkOutTime }
          : item
      )
    );
    toast.success(`${visitor.visitorName} checked out at ${checkOutTime}.`);
  };

  /* ───────────────────── Delete handling ───────────────────── */

  const confirmDelete = (): boolean => {
    if (!deleteTarget) return false;

    const { type, id, label } = deleteTarget;

    if (type === "buildings") {
      const hasResidents = allocations.some(
        (allocation) =>
          allocation.buildingId === id && allocation.status === "Active"
      );
      if (hasResidents) {
        toast.error(
          "This building still has active residents. Check them out before deleting."
        );
        return false;
      }
      setBuildings((current) => current.filter((item) => item.id !== id));
      setRooms((current) =>
        current.filter((room) => room.buildingId !== id)
      );
      setAllocations((current) =>
        current.filter((allocation) => allocation.buildingId !== id)
      );
      setMessPlans((current) =>
        current.filter((plan) => plan.buildingId !== id)
      );
      setWardens((current) =>
        current.map((warden) =>
          warden.buildingId === id
            ? { ...warden, buildingId: "", buildingName: "" }
            : warden
        )
      );
      setAttendance((current) =>
        current.filter((record) => record.buildingName !== label)
      );
      setVisitors((current) =>
        current.filter((visitor) => visitor.buildingName !== label)
      );
      toast.success(`Building "${label}" removed from the hostel portfolio.`);
      return true;
    }

    if (type === "rooms") {
      const occupied = activeAllocations.some(
        (allocation) => allocation.roomId === id
      );
      if (occupied) {
        toast.error(
          "This room has active residents. Reassign them before deleting the room."
        );
        return false;
      }
      setRooms((current) => current.filter((room) => room.id !== id));
      toast.success(`Room "${label}" removed from inventory.`);
      return true;
    }

    if (type === "residents") {
      setAllocations((current) =>
        current.filter((allocation) => allocation.id !== id)
      );
      toast.success(`Resident allocation "${label}" deleted.`);
      return true;
    }

    if (type === "wardens") {
      setWardens((current) => current.filter((warden) => warden.id !== id));
      setBuildings((current) =>
        current.map((building) =>
          building.wardenId === id ? { ...building, wardenId: "" } : building
        )
      );
      toast.success(`Warden "${label}" removed.`);
      return true;
    }

    if (type === "mess") {
      const subscribers = activeAllocations.filter(
        (allocation) => allocation.messPlanId === id
      ).length;
      if (subscribers > 0) {
        toast.error(
          `This mess plan has ${subscribers} subscribed resident${
            subscribers === 1 ? "" : "s"
          }. Reassign them before deleting the plan.`
        );
        return false;
      }
      setMessPlans((current) => current.filter((plan) => plan.id !== id));
      toast.success(`Mess plan "${label}" removed.`);
      return true;
    }

    if (type === "attendance") {
      setAttendance((current) =>
        current.filter((record) => record.id !== id)
      );
      toast.success("Attendance record deleted.");
      return true;
    }

    if (type === "visitors") {
      setVisitors((current) =>
        current.filter((visitor) => visitor.id !== id)
      );
      toast.success("Visitor entry deleted.");
      return true;
    }

    return false;
  };

  /* ───────────────────── Header actions ───────────────────── */

  const handlePrimaryAction = () => {
    if (activeTab === "buildings") {
      setEditingBuilding(null);
      setBuildingModalOpen(true);
      return;
    }
    if (activeTab === "rooms") {
      setEditingRoom(null);
      setRoomModalOpen(true);
      return;
    }
    if (activeTab === "wardens") {
      setEditingWarden(null);
      setWardenModalOpen(true);
      return;
    }
    if (activeTab === "mess") {
      setEditingMessPlan(null);
      setMessModalOpen(true);
      return;
    }
    if (activeTab === "attendance") {
      setEditingAttendance(null);
      setAttendanceModalOpen(true);
      return;
    }
    if (activeTab === "visitors") {
      setEditingVisitor(null);
      setVisitorModalOpen(true);
      return;
    }
    setEditingAllocation(null);
    setAllocationModalOpen(true);
  };

  const handleExportPdf = () => {
    if (activeTab === "overview") {
      exportHostelOverviewPdf(
        buildings,
        rooms,
        allocations,
        wardens,
        messPlans,
        visitors
      );
    } else if (activeTab === "buildings") {
      exportBuildingsPdf(buildings, rooms, allocations, wardens);
    } else if (activeTab === "rooms") {
      exportRoomsPdf(rooms, allocations);
    } else if (activeTab === "residents") {
      exportResidentsPdf(allocations, messPlans);
    } else if (activeTab === "wardens") {
      exportWardensPdf(wardens);
    } else if (activeTab === "mess") {
      exportMessPdf(messPlans, allocations);
    } else if (activeTab === "attendance") {
      exportAttendancePdf(attendance);
    } else if (activeTab === "visitors") {
      exportVisitorsPdf(visitors);
    }
    toast.success("Hostel register PDF downloaded.");
  };

  const handlePrint = () => {
    const printed = printHostelOverview(
      buildings,
      rooms,
      allocations,
      wardens,
      messPlans,
      visitors
    );
    if (printed) toast.success("Opening print preview for the hostel snapshot.");
    else toast.error("Unable to open print preview. Please try again.");
  };

  const handleBuildingRoster = (building: HostelBuildingRecord) => {
    exportBuildingRosterPdf(building, rooms, allocations, wardens);
    toast.success(`Building roster for ${building.name} downloaded.`);
  };

  const handleResidentCard = (allocation: HostelAllocationRecord) => {
    const room = rooms.find((item) => item.id === allocation.roomId);
    const building = buildings.find(
      (item) => item.id === allocation.buildingId
    );
    const messPlan = messPlans.find(
      (item) => item.id === allocation.messPlanId
    );
    exportResidentHostelCardPdf(allocation, room, building, messPlan);
    toast.success(`Resident card for ${allocation.studentName} downloaded.`);
  };

  /* ───────────────────── Column definitions ───────────────────── */

  const buildingColumns: Column<BuildingRow>[] = [
    {
      key: "building",
      header: "Building",
      icon: Building2,
      sortValue: (row) => row.building.name,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0 max-w-[290px]">
            <p className="truncate text-[13px] font-bold text-foreground">
              {row.building.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              {row.building.code} · {row.building.address}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      align: "center",
      sortValue: (row) => row.building.type,
      cell: (row) => (
        <div className="flex flex-col items-center gap-1">
          <StatusBadge
            status={row.building.type}
            tone={row.building.type === "Boys" ? "info" : "brand"}
          />
          <span className="text-[10.5px] font-medium text-muted-foreground">
            {row.building.campus}
          </span>
        </div>
      ),
    },
    {
      key: "warden",
      header: "Warden",
      icon: UserCheck,
      sortValue: (row) => row.warden?.name ?? "",
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-foreground">
            {row.warden?.name ?? "Unassigned"}
          </span>
          <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {row.warden?.phone ?? "—"}
          </span>
        </div>
      ),
    },
    {
      key: "inventory",
      header: "Inventory",
      align: "center",
      sortValue: (row) => row.usableBeds,
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-foreground">
            {row.rooms.length} rooms
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {row.usableBeds} usable beds
          </span>
        </div>
      ),
    },
    {
      key: "occupancy",
      header: "Occupancy",
      align: "center",
      sortValue: (row) => row.percent,
      cell: (row) => (
        <div className="mx-auto w-full max-w-[140px]">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-foreground">
              {row.occupiedBeds}/{row.usableBeds}
            </span>
            <span className="font-mono font-bold text-[#091d3e]">
              {row.percent}%
            </span>
          </div>
          <Meter
            value={row.percent}
            tone={occupancyTone(row.percent)}
            size="sm"
          />
        </div>
      ),
    },
    {
      key: "facilities",
      header: "Facilities",
      align: "center",
      cell: (row) => (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {row.building.facilities.slice(0, 2).map((facility) => (
            <span
              key={facility}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
            >
              {facility}
            </span>
          ))}
          {row.building.facilities.length > 2 && (
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand">
              +{row.building.facilities.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton
            tone="outline"
            size="xs"
            title="Download building resident roster"
            aria-label={`Download roster for ${row.building.name}`}
            onClick={() => handleBuildingRoster(row.building)}
            className={pdfActionClass}
          >
            <FileDown className="size-3.5" />
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit building"
            aria-label={`Edit ${row.building.name}`}
            onClick={() => {
              setEditingBuilding(row.building);
              setBuildingModalOpen(true);
            }}
            className={iconActionClass}
          >
            <Edit className="size-3.5" />
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Delete building"
            aria-label={`Delete ${row.building.name}`}
            onClick={() =>
              setDeleteTarget({
                type: "buildings",
                id: row.building.id,
                label: row.building.name,
                description: `Delete "${row.building.name}" and its room inventory? Buildings with active residents cannot be deleted.`,
              })
            }
            className={dangerActionClass}
          >
            <Trash2 className="size-3.5" />
          </ActionButton>
        </div>
      ),
    },
  ];

  const roomColumns: Column<RoomRow>[] = [
    {
      key: "room",
      header: "Room",
      icon: BedDouble,
      sortValue: (row) => row.roomNo,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/70">
            <BedDouble className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[13px] font-extrabold tracking-tight text-foreground">
              {row.roomNo}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              {row.buildingName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "floor",
      header: "Floor",
      align: "center",
      sortValue: (row) => row.floor,
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">
          Floor {row.floor}
        </span>
      ),
    },
    {
      key: "type",
      header: "Room Type",
      align: "center",
      sortValue: (row) => row.roomType,
      cell: (row) => (
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200/70">
          {row.roomType}
        </span>
      ),
    },
    {
      key: "occupancy",
      header: "Occupancy",
      align: "center",
      sortValue: (row) => row.occupied,
      cell: (row) => {
        const percent = Math.round((row.occupied / row.capacity) * 100);
        return (
          <div className="mx-auto w-full max-w-[130px]">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">
                {row.occupied}/{row.capacity} beds
              </span>
              <span className="font-mono font-bold text-[#091d3e]">
                {percent}%
              </span>
            </div>
            <Meter
              value={percent}
              tone={row.computedStatus === "Maintenance" ? "warning" : "brand"}
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: "fee",
      header: "Monthly Fee",
      align: "center",
      sortValue: (row) => row.monthlyFee,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatCurrency(row.monthlyFee)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortValue: (row) => row.computedStatus,
      cell: (row) => <StatusBadge status={row.computedStatus} dot />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => {
        const building = buildings.find(
          (item) => item.id === row.buildingId
        );
        return (
          <div className="flex items-center justify-center gap-1">
            <ActionButton
              tone="outline"
              size="xs"
              title="Download building roster"
              aria-label={`Download roster for ${row.buildingName}`}
              onClick={() => building && handleBuildingRoster(building)}
              className={pdfActionClass}
            >
              <FileDown className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              title="Edit room"
              aria-label={`Edit room ${row.roomNo}`}
              onClick={() => {
                setEditingRoom(row);
                setRoomModalOpen(true);
              }}
              className={iconActionClass}
            >
              <Edit className="size-3.5" />
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              title="Delete room"
              aria-label={`Delete room ${row.roomNo}`}
              onClick={() =>
                setDeleteTarget({
                  type: "rooms",
                  id: row.id,
                  label: row.roomNo,
                  description: `Delete room "${row.roomNo}" from ${row.buildingName}? Rooms with active residents cannot be deleted.`,
                })
              }
              className={dangerActionClass}
            >
              <Trash2 className="size-3.5" />
            </ActionButton>
          </div>
        );
      },
    },
  ];

  const residentColumns: Column<HostelAllocationRecord>[] = [
    {
      key: "resident",
      header: "Resident",
      icon: Users,
      sortValue: (row) => row.studentName,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.studentName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-foreground">
              {row.studentName}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              {row.studentRollNo} · {row.className}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "room",
      header: "Building / Room",
      icon: BedDouble,
      align: "center",
      sortValue: (row) => `${row.buildingName} ${row.roomNo}`,
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-foreground">
            {row.roomNo ? `${row.roomNo} · ${row.bedNo}` : "Not allocated"}
          </span>
          <span className="mt-0.5 max-w-[150px] truncate text-[11px] font-medium text-muted-foreground">
            {row.buildingName
              ? shortBuildingName(row.buildingName)
              : "No building"}
          </span>
        </div>
      ),
    },
    {
      key: "checkIn",
      header: "Check-in",
      icon: CalendarDays,
      align: "center",
      sortValue: (row) => row.checkInDate,
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">
          {row.checkInDate ? formatDate(row.checkInDate) : "—"}
        </span>
      ),
    },
    {
      key: "mess",
      header: "Mess Plan",
      icon: UtensilsCrossed,
      align: "center",
      sortValue: (row) => {
        const plan = messPlans.find((item) => item.id === row.messPlanId);
        return plan?.planCode ?? "";
      },
      cell: (row) => {
        const plan = messPlans.find((item) => item.id === row.messPlanId);
        return (
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-foreground">
              {plan?.planCode ?? "No mess"}
            </span>
            <span className="mt-0.5 text-[10.5px] font-medium text-muted-foreground">
              {plan ? `${formatCurrency(plan.monthlyRate)} / mo` : "—"}
            </span>
          </div>
        );
      },
    },
    {
      key: "fee",
      header: "Room Fee",
      align: "center",
      sortValue: (row) => row.monthlyFee,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {row.monthlyFee > 0 ? formatCurrency(row.monthlyFee) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} dot />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton
            tone="outline"
            size="xs"
            title="Download resident hostel card"
            aria-label={`Download hostel card for ${row.studentName}`}
            onClick={() => handleResidentCard(row)}
            className={pdfActionClass}
          >
            <FileDown className="size-3.5" />
          </ActionButton>
          {row.status === "Active" && (
            <ActionButton
              tone="outline"
              size="xs"
              title="Check out resident"
              aria-label={`Check out ${row.studentName}`}
              onClick={() => handleCheckOutResident(row)}
              className={iconActionClass}
            >
              <LogOut className="size-3.5" />
            </ActionButton>
          )}
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit allocation"
            aria-label={`Edit allocation for ${row.studentName}`}
            onClick={() => {
              setEditingAllocation(row);
              setAllocationModalOpen(true);
            }}
            className={iconActionClass}
          >
            <Edit className="size-3.5" />
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Delete allocation"
            aria-label={`Delete allocation for ${row.studentName}`}
            onClick={() =>
              setDeleteTarget({
                type: "residents",
                id: row.id,
                label: row.studentName,
                description: `Delete the hostel allocation for "${row.studentName}"? The bed will be released immediately.`,
              })
            }
            className={dangerActionClass}
          >
            <Trash2 className="size-3.5" />
          </ActionButton>
        </div>
      ),
    },
  ];

  const wardenColumns: Column<HostelWardenRecord>[] = [
    {
      key: "warden",
      header: "Warden",
      icon: ShieldCheck,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-foreground">
              {row.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              {row.wardenCode} · {row.role}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "building",
      header: "Building",
      icon: Building2,
      align: "center",
      sortValue: (row) => row.buildingName,
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">
          {row.buildingName || "Unassigned"}
        </span>
      ),
    },
    {
      key: "shift",
      header: "Shift",
      align: "center",
      sortValue: (row) => row.shift,
      cell: (row) => (
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200/70">
          {row.shift}
        </span>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      align: "center",
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="font-mono text-xs font-semibold text-foreground">
            {row.phone}
          </span>
          <span className="mt-0.5 max-w-[180px] truncate text-[10.5px] font-medium text-muted-foreground">
            {row.email || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      align: "center",
      sortValue: (row) => row.joinedDate,
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">
          {formatDate(row.joinedDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} dot />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit warden"
            aria-label={`Edit warden ${row.name}`}
            onClick={() => {
              setEditingWarden(row);
              setWardenModalOpen(true);
            }}
            className={iconActionClass}
          >
            <Edit className="size-3.5" />
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Delete warden"
            aria-label={`Delete warden ${row.name}`}
            onClick={() =>
              setDeleteTarget({
                type: "wardens",
                id: row.id,
                label: row.name,
                description: `Remove warden "${row.name}" from the roster? Their building assignment will be cleared.`,
              })
            }
            className={dangerActionClass}
          >
            <Trash2 className="size-3.5" />
          </ActionButton>
        </div>
      ),
    },
  ];

  const messColumns: Column<HostelMessPlanRecord>[] = [
    {
      key: "plan",
      header: "Mess Plan",
      icon: UtensilsCrossed,
      sortValue: (row) => row.planName,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/70">
            <UtensilsCrossed className="size-4" />
          </span>
          <div className="min-w-0 max-w-[250px]">
            <p className="truncate text-[13px] font-bold text-foreground">
              {row.planName}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              {row.planCode} · {row.vendor}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "building",
      header: "Building",
      icon: Building2,
      align: "center",
      sortValue: (row) => row.buildingName,
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">
          {shortBuildingName(row.buildingName)}
        </span>
      ),
    },
    {
      key: "meals",
      header: "Meals",
      align: "center",
      cell: (row) => (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {row.meals.map((meal) => (
            <span
              key={meal}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
            >
              {meal}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "subscribers",
      header: "Subscribers",
      align: "center",
      sortValue: (row) =>
        activeAllocations.filter(
          (allocation) => allocation.messPlanId === row.id
        ).length,
      cell: (row) => {
        const subscribers = activeAllocations.filter(
          (allocation) => allocation.messPlanId === row.id
        ).length;
        const buildingResidents = activeAllocations.filter(
          (allocation) => allocation.buildingId === row.buildingId
        ).length;
        const percent =
          buildingResidents > 0
            ? Math.round((subscribers / buildingResidents) * 100)
            : 0;
        return (
          <div className="mx-auto w-full max-w-[110px]">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">
                {subscribers} residents
              </span>
              <span className="font-mono font-bold text-[#091d3e]">
                {percent}%
              </span>
            </div>
            <Meter value={percent} tone="success" size="sm" />
          </div>
        );
      },
    },
    {
      key: "rate",
      header: "Monthly Rate",
      align: "center",
      sortValue: (row) => row.monthlyRate,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatCurrency(row.monthlyRate)}
        </span>
      ),
    },
    {
      key: "value",
      header: "Monthly Value",
      align: "center",
      sortValue: (row) =>
        row.monthlyRate *
        activeAllocations.filter(
          (allocation) => allocation.messPlanId === row.id
        ).length,
      cell: (row) => {
        const subscribers = activeAllocations.filter(
          (allocation) => allocation.messPlanId === row.id
        ).length;
        return (
          <span className="font-mono text-xs font-extrabold text-success">
            {formatCurrency(row.monthlyRate * subscribers)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} dot />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit mess plan"
            aria-label={`Edit ${row.planName}`}
            onClick={() => {
              setEditingMessPlan(row);
              setMessModalOpen(true);
            }}
            className={iconActionClass}
          >
            <Edit className="size-3.5" />
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Delete mess plan"
            aria-label={`Delete ${row.planName}`}
            onClick={() =>
              setDeleteTarget({
                type: "mess",
                id: row.id,
                label: row.planName,
                description: `Delete the mess plan "${row.planName}"? Plans with subscribed residents cannot be deleted.`,
              })
            }
            className={dangerActionClass}
          >
            <Trash2 className="size-3.5" />
          </ActionButton>
        </div>
      ),
    },
  ];

  const attendanceColumns: Column<HostelAttendanceRecord>[] = [
    {
      key: "date",
      header: "Date",
      icon: CalendarDays,
      align: "center",
      sortValue: (row) => row.date,
      cell: (row) => (
        <span className="text-xs font-bold text-foreground">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      key: "resident",
      header: "Resident",
      icon: Users,
      sortValue: (row) => row.studentName,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.studentName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-foreground">
              {row.studentName}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              {row.studentRollNo}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "room",
      header: "Building / Room",
      icon: BedDouble,
      align: "center",
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="font-mono text-xs font-bold text-foreground">
            {row.roomNo}
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {shortBuildingName(row.buildingName)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} dot />,
    },
    {
      key: "checkIn",
      header: "Check-in",
      align: "center",
      sortValue: (row) => row.checkInTime,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {row.checkInTime}
        </span>
      ),
    },
    {
      key: "remarks",
      header: "Remarks",
      align: "center",
      cell: (row) => (
        <span className="text-[11px] font-medium text-muted-foreground">
          {row.remarks ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit attendance"
            aria-label={`Edit attendance for ${row.studentName}`}
            onClick={() => {
              setEditingAttendance(row);
              setAttendanceModalOpen(true);
            }}
            className={iconActionClass}
          >
            <Edit className="size-3.5" />
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Delete attendance record"
            aria-label={`Delete attendance for ${row.studentName}`}
            onClick={() =>
              setDeleteTarget({
                type: "attendance",
                id: row.id,
                label: `${row.studentName} — ${row.date}`,
                description: `Delete the attendance record for "${row.studentName}" dated ${formatDate(
                  row.date
                )}?`,
              })
            }
            className={dangerActionClass}
          >
            <Trash2 className="size-3.5" />
          </ActionButton>
        </div>
      ),
    },
  ];

  const visitorColumns: Column<HostelVisitorRecord>[] = [
    {
      key: "visitor",
      header: "Visitor",
      icon: IdCard,
      sortValue: (row) => row.visitorName,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.visitorName} size="sm" />
          <div className="min-w-0 max-w-[210px]">
            <p className="truncate text-[13px] font-bold text-foreground">
              {row.visitorName}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] font-medium text-muted-foreground">
              {row.phone} · {row.cnic || "CNIC not recorded"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "resident",
      header: "Visiting",
      icon: Users,
      align: "center",
      sortValue: (row) => row.residentName,
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-foreground">
            {row.residentName}
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {row.roomNo ? `${row.roomNo} · ${shortBuildingName(row.buildingName)}` : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "relationship",
      header: "Relation",
      align: "center",
      sortValue: (row) => row.relationship,
      cell: (row) => (
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200/70">
          {row.relationship}
        </span>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      align: "center",
      cell: (row) => (
        <span className="text-[11px] font-medium text-muted-foreground">
          {row.purpose}
        </span>
      ),
    },
    {
      key: "visit",
      header: "Visit / Gate Times",
      icon: Clock3,
      align: "center",
      sortValue: (row) => `${row.visitDate} ${row.checkInTime}`,
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-foreground">
            {formatDate(row.visitDate)}
          </span>
          <span className="mt-0.5 font-mono text-[11px] font-medium text-muted-foreground">
            {row.checkInTime} → {row.checkOutTime ?? "—"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} dot />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          {row.status === "Approved" && (
            <ActionButton
              tone="outline"
              size="xs"
              title="Check out visitor"
              aria-label={`Check out ${row.visitorName}`}
              onClick={() => handleCheckOutVisitor(row)}
              className={iconActionClass}
            >
              <LogOut className="size-3.5" />
            </ActionButton>
          )}
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit visitor entry"
            aria-label={`Edit visitor ${row.visitorName}`}
            onClick={() => {
              setEditingVisitor(row);
              setVisitorModalOpen(true);
            }}
            className={iconActionClass}
          >
            <Edit className="size-3.5" />
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Delete visitor entry"
            aria-label={`Delete visitor ${row.visitorName}`}
            onClick={() =>
              setDeleteTarget({
                type: "visitors",
                id: row.id,
                label: row.visitorName,
                description: `Delete the visitor entry for "${row.visitorName}" dated ${formatDate(
                  row.visitDate
                )}?`,
              })
            }
            className={dangerActionClass}
          >
            <Trash2 className="size-3.5" />
          </ActionButton>
        </div>
      ),
    },
  ];

  /* ───────────────────── Filters ───────────────────── */

  const buildingFilters: FilterDef<BuildingRow>[] = [
    {
      key: "campus",
      label: "Campus",
      allLabel: "All Campuses",
      triggerClassName: "w-[168px]",
      icon: Building2,
      options: [...HOSTEL_CAMPUSES],
      getValue: (row) => row.building.campus,
    },
  ];

  const roomFilters: FilterDef<RoomRow>[] = [
    {
      key: "building",
      label: "Building",
      allLabel: "All Buildings",
      triggerClassName: "w-[168px]",
      icon: Building2,
      options: buildings.map((building) => building.name),
      getValue: (row) => row.buildingName,
    },
    {
      key: "type",
      label: "Room Type",
      allLabel: "All Types",
      options: [...HOSTEL_ROOM_TYPES],
      getValue: (row) => row.roomType,
    },
    {
      key: "status",
      label: "Status",
      allLabel: "All Statuses",
      options: ["Available", "Full", "Maintenance"],
      getValue: (row) => row.computedStatus,
    },
  ];

  const residentFilters: FilterDef<HostelAllocationRecord>[] = [
    {
      key: "building",
      label: "Building",
      allLabel: "All Buildings",
      triggerClassName: "w-[168px]",
      icon: Building2,
      options: buildings.map((building) => building.name),
      getValue: (row) => row.buildingName,
    },
    {
      key: "status",
      label: "Status",
      allLabel: "All Statuses",
      options: ["Active", "Waitlisted", "Checked Out"],
      getValue: (row) => row.status,
    },
    {
      key: "mess",
      label: "Mess Plan",
      allLabel: "All Plans",
      options: [
        "No Mess",
        ...messPlans.map((plan) => plan.planCode),
      ],
      getValue: (row) => {
        const plan = messPlans.find((item) => item.id === row.messPlanId);
        return plan?.planCode ?? "No Mess";
      },
    },
  ];

  const wardenFilters: FilterDef<HostelWardenRecord>[] = [
    {
      key: "building",
      label: "Building",
      allLabel: "All Buildings",
      triggerClassName: "w-[168px]",
      icon: Building2,
      options: buildings.map((building) => building.name),
      getValue: (row) => row.buildingName,
    },
    {
      key: "status",
      label: "Status",
      allLabel: "All Statuses",
      options: ["On Duty", "Off Duty", "On Leave"],
      getValue: (row) => row.status,
    },
    {
      key: "shift",
      label: "Shift",
      allLabel: "All Shifts",
      options: ["Day", "Night", "Resident"],
      getValue: (row) => row.shift,
    },
  ];

  const messFilters: FilterDef<HostelMessPlanRecord>[] = [
    {
      key: "building",
      label: "Building",
      allLabel: "All Buildings",
      triggerClassName: "w-[168px]",
      icon: Building2,
      options: buildings.map((building) => building.name),
      getValue: (row) => row.buildingName,
    },
    {
      key: "status",
      label: "Status",
      allLabel: "All Statuses",
      options: ["Active", "Paused"],
      getValue: (row) => row.status,
    },
  ];

  const attendanceFilters: FilterDef<HostelAttendanceRecord>[] = [
    {
      key: "building",
      label: "Building",
      allLabel: "All Buildings",
      triggerClassName: "w-[168px]",
      icon: Building2,
      options: buildings.map((building) => building.name),
      getValue: (row) => row.buildingName,
    },
    {
      key: "status",
      label: "Status",
      allLabel: "All Statuses",
      options: ["Present", "Late", "Absent", "On Leave"],
      getValue: (row) => row.status,
    },
  ];

  const visitorFilters: FilterDef<HostelVisitorRecord>[] = [
    {
      key: "status",
      label: "Status",
      allLabel: "All Statuses",
      options: ["Approved", "Pending", "Checked Out"],
      getValue: (row) => row.status,
    },
  ];

  const tabCounts: Record<HostelTab, number | null> = {
    overview: null,
    buildings: buildings.length,
    rooms: rooms.length,
    residents: activeAllocations.length,
    wardens: wardens.length,
    mess: messPlans.length,
    attendance: latestAttendance.length,
    visitors: visitors.length,
  };

  const alertToneClass: Record<string, string> = {
    warning: "border-warning/25 bg-warning-soft/45 text-warning",
    danger: "border-danger/25 bg-danger-soft/45 text-danger",
    info: "border-info/25 bg-info-soft/45 text-info",
    success: "border-success/25 bg-success-soft/45 text-success",
  };

  return (
    <>
      <PageHeader
        title="Hostel Management"
        actions={
          <>
            <ActionButton
              tone="outline"
              size="sm"
              onClick={handlePrint}
              title="Print hostel snapshot"
            >
              <Printer className="size-3.5" />
              <span className="hidden sm:inline">Print</span>
            </ActionButton>
            <ActionButton
              tone="outline"
              size="sm"
              onClick={handleExportPdf}
              title="Export current register as PDF"
            >
              <Download className="size-3.5" />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="sm"
              onClick={handlePrimaryAction}
            >
              <Plus className="size-3.5" />
              <span>{PRIMARY_LABEL[activeTab]}</span>
            </ActionButton>
          </>
        }
      />

      <StatGrid className="mb-5">
        <StatCard
          label="Bed Occupancy"
          value={formatPercent(occupancyPercent, 0)}
          icon={BedDouble}
          title={`${activeAllocations.length} of ${usableBeds} usable beds occupied`}
        />
        <StatCard
          label="Active Residents"
          value={formatNumber(activeAllocations.length)}
          icon={Users}
          title={`${waitlistedAllocations.length} waitlisted · ${formatNumber(
            totalRooms
          )} rooms in portfolio`}
        />
        <StatCard
          label="Hostel Buildings"
          value={formatNumber(buildings.length)}
          icon={Building2}
          title={`${wardensOnDuty} of ${wardens.length} wardens on duty`}
        />
        <StatCard
          label="Mess Revenue / Month"
          value={formatCurrency(messRevenue)}
          icon={Wallet}
          title={`${
            activeAllocations.filter((allocation) => allocation.messPlanId)
              .length
          } residents subscribed to mess`}
        />
      </StatGrid>

      <Tabs
        value={activeTab}
        onValueChange={(value) => selectTab(value as HostelTab)}
        className="gap-5"
      >
        <TabsList className="flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-brand/10 bg-white p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(53_57_85/0.06),0_12px_32px_-24px_rgb(53_57_85/0.28)]">
          {TAB_META.map((tab) => {
            const Icon = tab.icon;
            const count = tabCounts[tab.value];
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 px-3"
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
                {count !== null && <TabBadge>{count}</TabBadge>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ───────────────────────── Overview ───────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            <SectionCard
              title="Building Occupancy"
              description="Live bed capacity, occupancy pressure and warden coverage across every hostel building."
              action={
                <span className="rounded-md bg-brand-50 px-2 py-1 text-[10.5px] font-bold text-brand ring-1 ring-brand/10">
                  {buildings.length} buildings · {rooms.length} rooms
                </span>
              }
            >
              <div className="-mt-1 space-y-2.5">
                {buildingRows.map((row) => (
                  <div
                    key={row.building.id}
                    className="group rounded-xl border border-slate-200/80 bg-white p-3.5 transition-colors hover:border-brand/20 hover:bg-brand-50/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
                          <Building2 className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-[13px] font-bold text-foreground">
                              {row.building.name}
                            </p>
                            <StatusBadge
                              status={row.building.type}
                              tone={
                                row.building.type === "Boys" ? "info" : "brand"
                              }
                            />
                          </div>
                          <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                            {row.building.campus} ·{" "}
                            {row.warden?.name ?? "Warden unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={cn(
                            "font-heading text-base font-bold",
                            row.percent >= 90
                              ? "text-warning"
                              : "text-[#091d3e]"
                          )}
                        >
                          {row.percent}%
                        </p>
                        <p className="text-[10.5px] font-semibold text-muted-foreground">
                          {row.occupiedBeds}/{row.usableBeds} beds
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Meter
                        value={row.percent}
                        tone={occupancyTone(row.percent)}
                        size="sm"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => selectTab("rooms")}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold text-brand opacity-70 transition-opacity hover:opacity-100"
                      >
                        View rooms
                        <ArrowUpRight className="size-3" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[10.5px] font-medium text-muted-foreground">
                      <span>
                        {row.rooms.length} room
                        {row.rooms.length === 1 ? "" : "s"}
                      </span>
                      <span className="size-1 rounded-full bg-slate-300" />
                      <span>{row.usableBeds} usable beds</span>
                      <span className="size-1 rounded-full bg-slate-300" />
                      <span
                        className={cn(
                          row.maintenanceRooms > 0 && "font-bold text-warning"
                        )}
                      >
                        {row.maintenanceRooms} in maintenance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="flex flex-col gap-5">
              <SectionCard
                title="Operations Snapshot"
                description="Today's operational position across the hostel network."
              >
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      label: "Available beds",
                      value: formatNumber(availableBeds),
                      detail: "Ready for allocation",
                      icon: BedDouble,
                    },
                    {
                      label: "Waitlisted",
                      value: formatNumber(waitlistedAllocations.length),
                      detail: "Awaiting a bed",
                      icon: Clock3,
                    },
                    {
                      label: "Maintenance",
                      value: formatNumber(maintenanceRooms),
                      detail: "Rooms out of service",
                      icon: Wrench,
                    },
                    {
                      label: "Wardens on duty",
                      value: `${wardensOnDuty}/${wardens.length}`,
                      detail: "Shift coverage",
                      icon: ShieldCheck,
                    },
                    {
                      label: "Visitor passes",
                      value: formatNumber(openVisitors.length),
                      detail: "Currently checked in",
                      icon: IdCard,
                    },
                    {
                      label: "Latest roll call",
                      value:
                        latestAttendance.length > 0
                          ? `${attendanceStats.present}/${latestAttendance.length}`
                          : "—",
                      detail: latestAttendanceDate
                        ? formatDate(latestAttendanceDate)
                        : "No records",
                      icon: ClipboardCheck,
                    },
                  ].map((metric) => {
                    const MetricIcon = metric.icon;
                    return (
                      <div
                        key={metric.label}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5"
                      >
                        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                          <MetricIcon className="size-3" />
                          <span>{metric.label}</span>
                        </div>
                        <p className="mt-1 font-heading text-base font-bold text-foreground">
                          {metric.value}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground">
                          {metric.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2">
                  {alerts.map((alert) => {
                    const AlertIcon = alert.icon;
                    return (
                      <div
                        key={alert.title}
                        className={cn(
                          "flex items-start gap-2.5 rounded-xl border p-2.5",
                          alertToneClass[alert.tone]
                        )}
                      >
                        <AlertIcon className="mt-0.5 size-3.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold leading-tight">
                            {alert.title}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium leading-relaxed opacity-80">
                            {alert.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {alerts.length === 0 && (
                    <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success-soft/45 p-3 text-success">
                      <CheckCircle2 className="size-4" />
                      <p className="text-[11px] font-bold">
                        All hostels are operating within normal parameters.
                      </p>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
            <SectionCard
              title="Latest Check-ins"
              description="Most recent residents to join the hostel community."
              action={
                <button
                  type="button"
                  onClick={() => selectTab("residents")}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-bold text-brand transition-colors hover:bg-brand-50"
                >
                  View all residents
                  <ArrowUpRight className="size-3" />
                </button>
              }
            >
              <div className="-mt-1 divide-y divide-border/60">
                {latestCheckIns.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <UserAvatar name={allocation.studentName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">
                          {allocation.studentName}
                        </p>
                        <p className="mt-0.5 truncate text-[10.5px] font-medium text-muted-foreground">
                          {allocation.studentRollNo} · {allocation.className}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="hidden text-right sm:block">
                        <p className="text-[11px] font-bold text-foreground">
                          {allocation.roomNo} · {allocation.bedNo}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground">
                          {shortBuildingName(allocation.buildingName)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10.5px] font-semibold text-foreground">
                          {allocation.checkInDate
                            ? formatDate(allocation.checkInDate)
                            : "—"}
                        </p>
                        <p className="mt-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-success">
                          Checked in
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {latestCheckIns.length === 0 && (
                  <p className="py-8 text-center text-xs font-medium text-muted-foreground">
                    No active residents yet.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Mess Plan Performance"
              description="Subscriber base and monthly billing value by plan."
              action={
                <button
                  type="button"
                  onClick={() => selectTab("mess")}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-bold text-brand transition-colors hover:bg-brand-50"
                >
                  Manage
                  <ArrowUpRight className="size-3" />
                </button>
              }
            >
              <div className="space-y-2.5">
                {messPlans.map((plan) => {
                  const subscribers = activeAllocations.filter(
                    (allocation) => allocation.messPlanId === plan.id
                  ).length;
                  const buildingResidents = activeAllocations.filter(
                    (allocation) => allocation.buildingId === plan.buildingId
                  ).length;
                  const percent =
                    buildingResidents > 0
                      ? Math.round((subscribers / buildingResidents) * 100)
                      : 0;
                  return (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-slate-200/80 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[11.5px] font-bold text-foreground">
                            {plan.planName}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                            {plan.vendor} · {plan.meals.length} meals
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-brand-50 px-2 py-0.5 font-mono text-[10.5px] font-extrabold text-brand">
                          {subscribers}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[10.5px] font-semibold">
                        <span className="text-muted-foreground">
                          {formatCurrency(plan.monthlyRate)} / resident
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(plan.monthlyRate * subscribers)}
                        </span>
                      </div>
                      <Meter
                        value={percent}
                        tone="success"
                        size="xs"
                        className="mt-2"
                      />
                    </div>
                  );
                })}
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#091d3e] to-[#16345f] px-3.5 py-2.5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
                  <div>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-white/65">
                      Total mess billing
                    </p>
                    <p className="font-heading text-sm font-bold">
                      {formatCurrency(messRevenue)}
                    </p>
                  </div>
                  <p className="text-right text-[10px] font-medium text-white/70">
                    per month
                    <br />
                    {
                      activeAllocations.filter(
                        (allocation) => allocation.messPlanId
                      ).length
                    }{" "}
                    subscribers
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ───────────────────────── Buildings ───────────────────────── */}
        <TabsContent value="buildings">
          <SectionCard
            title="Hostel Buildings"
            description="Building profiles, room inventory, warden coverage and live occupancy."
            action={
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600">
                {buildings.length} buildings · {usableBeds} usable beds
              </span>
            }
          >
            <DataTable
              data={buildingRows}
              columns={buildingColumns}
              getRowId={(row) => row.building.id}
              searchPlaceholder="Search buildings or wardens…"
              searchFn={(row, query) =>
                [
                  row.building.name,
                  row.building.code,
                  row.building.type,
                  row.building.campus,
                  row.building.address,
                  row.warden?.name ?? "",
                  ...row.building.facilities,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase())
              }
              filters={buildingFilters}
              pageSize={8}
              tableClassName="min-w-[1120px]"
            />
          </SectionCard>
        </TabsContent>

        {/* ───────────────────────── Rooms ───────────────────────── */}
        <TabsContent value="rooms">
          <SectionCard
            title="Room Inventory"
            description="Bed capacity, room categories, monthly fees and maintenance state."
            action={
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600">
                {rooms.length} rooms · {maintenanceRooms} under maintenance
              </span>
            }
          >
            <DataTable
              data={roomRows}
              columns={roomColumns}
              getRowId={(row) => row.id}
              searchPlaceholder="Search rooms or buildings…"
              searchFn={(row, query) =>
                [
                  row.roomNo,
                  row.buildingName,
                  row.roomType,
                  row.computedStatus,
                  String(row.floor),
                  String(row.capacity),
                  String(row.monthlyFee),
                  row.notes ?? "",
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase())
              }
              filters={roomFilters}
              pageSize={8}
              tableClassName="min-w-[1000px]"
            />
          </SectionCard>
        </TabsContent>

        {/* ───────────────────────── Residents ───────────────────────── */}
        <TabsContent value="residents">
          <SectionCard
            title="Resident Allocations"
            description="Room and bed assignments, mess subscriptions and residency status."
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-success-soft px-2 py-1 text-[10.5px] font-bold text-success ring-1 ring-success/15">
                  {activeAllocations.length} active
                </span>
                <span className="rounded-md bg-warning-soft px-2 py-1 text-[10.5px] font-bold text-warning ring-1 ring-warning/15">
                  {waitlistedAllocations.length} waitlisted
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600">
                  {allocations.length} total records
                </span>
              </div>
            }
          >
            <DataTable
              data={allocations}
              columns={residentColumns}
              getRowId={(row) => row.id}
              searchPlaceholder="Search residents or rooms…"
              searchFn={(row, query) =>
                [
                  row.studentName,
                  row.studentRollNo,
                  row.className,
                  row.buildingName,
                  row.roomNo,
                  row.bedNo,
                  row.guardianPhone,
                  row.status,
                  messPlans.find((plan) => plan.id === row.messPlanId)
                    ?.planCode ?? "",
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase())
              }
              filters={residentFilters}
              pageSize={8}
              tableClassName="min-w-[1140px]"
            />
          </SectionCard>
        </TabsContent>

        {/* ───────────────────────── Wardens ───────────────────────── */}
        <TabsContent value="wardens">
          <SectionCard
            title="Warden Roster"
            description="Building supervision, shift coverage, duty status and emergency contacts."
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-success-soft px-2 py-1 text-[10.5px] font-bold text-success ring-1 ring-success/15">
                  {wardensOnDuty} on duty
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600">
                  {wardens.length} total wardens
                </span>
              </div>
            }
          >
            <DataTable
              data={wardens}
              columns={wardenColumns}
              getRowId={(row) => row.id}
              searchPlaceholder="Search wardens or buildings…"
              searchFn={(row, query) =>
                [
                  row.name,
                  row.wardenCode,
                  row.role,
                  row.buildingName,
                  row.shift,
                  row.phone,
                  row.email,
                  row.status,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase())
              }
              filters={wardenFilters}
              pageSize={8}
              tableClassName="min-w-[1060px]"
            />
          </SectionCard>
        </TabsContent>

        {/* ───────────────────────── Mess ───────────────────────── */}
        <TabsContent value="mess">
          <SectionCard
            title="Mess Plans"
            description="Catering partners, meal coverage, monthly rates and subscriber billing."
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-brand-50 px-2 py-1 text-[10.5px] font-bold text-brand ring-1 ring-brand/10">
                  {formatCurrency(messRevenue)} / month
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600">
                  {messPlans.length} plans
                </span>
              </div>
            }
          >
            <DataTable
              data={messPlans}
              columns={messColumns}
              getRowId={(row) => row.id}
              searchPlaceholder="Search plans or vendors…"
              searchFn={(row, query) =>
                [
                  row.planName,
                  row.planCode,
                  row.vendor,
                  row.buildingName,
                  row.status,
                  ...row.meals,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase())
              }
              filters={messFilters}
              pageSize={8}
              tableClassName="min-w-[1150px]"
            />
          </SectionCard>
        </TabsContent>

        {/* ───────────────────────── Attendance ───────────────────────── */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              {
                label: "Present",
                value: attendanceStats.present,
                icon: CheckCircle2,
                classes:
                  "border-success/20 bg-success-soft/45 text-success",
              },
              {
                label: "Late",
                value: attendanceStats.late,
                icon: Clock3,
                classes:
                  "border-warning/20 bg-warning-soft/45 text-warning",
              },
              {
                label: "Absent",
                value: attendanceStats.absent,
                icon: AlertTriangle,
                classes: "border-danger/20 bg-danger-soft/45 text-danger",
              },
              {
                label: "On Leave",
                value: attendanceStats.leave,
                icon: CalendarDays,
                classes: "border-info/20 bg-info-soft/45 text-info",
              },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3",
                    item.classes
                  )}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] opacity-75">
                      {item.label}
                    </p>
                    <p className="mt-0.5 font-heading text-xl font-bold">
                      {item.value}
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-xl bg-white/70 ring-1 ring-current/10">
                    <ItemIcon className="size-4" />
                  </span>
                </div>
              );
            })}
          </div>

          <SectionCard
            title="Hostel Attendance"
            description="Evening roll call, late returns and approved leave for resident students."
            action={
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600">
                {latestAttendanceDate
                  ? formatDate(latestAttendanceDate)
                  : "No records"}{" "}
                · {latestAttendance.length} records
              </span>
            }
          >
            <DataTable
              data={attendance}
              columns={attendanceColumns}
              getRowId={(row) => row.id}
              searchPlaceholder="Search residents or rooms…"
              searchFn={(row, query) =>
                [
                  row.studentName,
                  row.studentRollNo,
                  row.buildingName,
                  row.roomNo,
                  row.status,
                  row.remarks ?? "",
                  row.date,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase())
              }
              filters={attendanceFilters}
              pageSize={8}
              tableClassName="min-w-[1080px]"
            />
          </SectionCard>
        </TabsContent>

        {/* ───────────────────────── Visitors ───────────────────────── */}
        <TabsContent value="visitors">
          <SectionCard
            title="Visitor Log"
            description="Gate register for parents and guardians, with purpose, time and approval status."
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-info-soft px-2 py-1 text-[10.5px] font-bold text-info ring-1 ring-info/15">
                  {openVisitors.length} checked in
                </span>
                <span className="rounded-md bg-warning-soft px-2 py-1 text-[10.5px] font-bold text-warning ring-1 ring-warning/15">
                  {
                    visitors.filter((visitor) => visitor.status === "Pending")
                      .length
                  }{" "}
                  pending
                </span>
              </div>
            }
          >
            <DataTable
              data={visitors}
              columns={visitorColumns}
              getRowId={(row) => row.id}
              searchPlaceholder="Search visitors or residents…"
              searchFn={(row, query) =>
                [
                  row.visitorName,
                  row.phone,
                  row.cnic,
                  row.residentName,
                  row.residentRollNo,
                  row.buildingName,
                  row.roomNo,
                  row.relationship,
                  row.purpose,
                  row.status,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase())
              }
              filters={visitorFilters}
              pageSize={8}
              tableClassName="min-w-[1180px]"
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <BuildingFormModal
        open={buildingModalOpen}
        onOpenChange={setBuildingModalOpen}
        totalCount={buildings.length}
        wardens={wardens}
        initialData={editingBuilding}
        onSave={handleSaveBuilding}
      />

      <RoomFormModal
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
        totalCount={rooms.length}
        buildings={buildings}
        allocations={allocations}
        initialData={editingRoom}
        onSave={handleSaveRoom}
      />

      <AllocationFormModal
        open={allocationModalOpen}
        onOpenChange={setAllocationModalOpen}
        totalCount={allocations.length}
        buildings={buildings}
        rooms={rooms}
        allocations={allocations}
        messPlans={messPlans}
        initialData={editingAllocation}
        onSave={handleSaveAllocation}
      />

      <WardenFormModal
        open={wardenModalOpen}
        onOpenChange={setWardenModalOpen}
        totalCount={wardens.length}
        buildings={buildings}
        initialData={editingWarden}
        onSave={handleSaveWarden}
      />

      <MessPlanFormModal
        open={messModalOpen}
        onOpenChange={setMessModalOpen}
        totalCount={messPlans.length}
        buildings={buildings}
        initialData={editingMessPlan}
        onSave={handleSaveMessPlan}
      />

      <AttendanceFormModal
        open={attendanceModalOpen}
        onOpenChange={setAttendanceModalOpen}
        totalCount={attendance.length}
        residents={activeAllocations}
        initialData={editingAttendance}
        onSave={handleSaveAttendance}
      />

      <VisitorFormModal
        open={visitorModalOpen}
        onOpenChange={setVisitorModalOpen}
        totalCount={visitors.length}
        residents={activeAllocations}
        initialData={editingVisitor}
        onSave={handleSaveVisitor}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === "buildings"
            ? "Delete Building"
            : deleteTarget?.type === "rooms"
            ? "Delete Room"
            : deleteTarget?.type === "residents"
            ? "Delete Resident Allocation"
            : deleteTarget?.type === "wardens"
            ? "Remove Warden"
            : deleteTarget?.type === "mess"
            ? "Delete Mess Plan"
            : deleteTarget?.type === "attendance"
            ? "Delete Attendance Record"
            : "Delete Visitor Entry"
        }
        description={deleteTarget?.description ?? ""}
        confirmLabel={
          deleteTarget?.type === "wardens" ? "Remove" : "Delete"
        }
        onConfirm={confirmDelete}
      />
    </>
  );
}
