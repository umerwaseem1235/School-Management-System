"use client";

import * as React from "react";
import { BedDouble, Building2, Edit, Plus, Trash2, Users } from "lucide-react";
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
import { formatNumber } from "@/lib/format";
import {
  INITIAL_HOSTEL_ROOMS,
  type HostelRoomRecord,
} from "@/lib/mock/hostel";
import { HostelRoomFormModal, DeleteHostelRoomModal } from "./hostel-form-modals";

export function HostelClient() {
  const [rooms, setRooms] = React.useState<HostelRoomRecord[]>(
    INITIAL_HOSTEL_ROOMS
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<HostelRoomRecord | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const kpis = React.useMemo(() => {
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((s, r) => s + r.capacity, 0);
    const occupiedBeds = rooms.reduce((s, r) => s + r.occupied, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const fullRooms = rooms.filter((r) => r.status === "Full").length;
    const maintenanceRooms = rooms.filter(
      (r) => r.status === "Maintenance"
    ).length;
    return {
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      fullRooms,
      maintenanceRooms,
    };
  }, [rooms]);

  const handleSave = React.useCallback((record: HostelRoomRecord) => {
    setRooms((prev) => {
      const exists = prev.some((r) => r.id === record.id);
      return exists
        ? prev.map((r) => (r.id === record.id ? record : r))
        : [record, ...prev];
    });
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const columns = React.useMemo<Column<HostelRoomRecord>[]>(
    () => [
      {
        key: "roomCode",
        header: "Code",
        cell: (r) => (
          <span className="font-mono text-[11px] font-semibold text-brand/80">
            {r.roomCode}
          </span>
        ),
        className: "w-[90px]",
      },
      {
        key: "hostel",
        header: "Hostel / Block",
        cell: (r) => (
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {r.hostel}
            </div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
              Block {r.block}
            </div>
          </div>
        ),
      },
      {
        key: "roomNo",
        header: "Room No.",
        cell: (r) => (
          <span className="font-mono text-xs font-semibold text-foreground">
            {r.roomNo}
          </span>
        ),
        className: "w-[90px]",
      },
      {
        key: "type",
        header: "Type",
        cell: (r) => (
          <span className="text-xs text-foreground/80">{r.type}</span>
        ),
        className: "w-[80px]",
      },
      {
        key: "occupancy",
        header: "Occupancy",
        align: "center",
        headerAlign: "center",
        cell: (r) => (
          <span className="font-mono text-sm font-extrabold tabular-nums text-[#091d3e]">
            {r.occupied} / {r.capacity}
          </span>
        ),
        className: "w-[110px]",
      },
      {
        key: "warden",
        header: "Warden",
        cell: (r) => (
          <span className="text-xs text-foreground/80">{r.warden || "—"}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        headerAlign: "center",
        cell: (r) => (
          <StatusBadge
            status={r.status}
            tone={
              r.status === "Available"
                ? "success"
                : r.status === "Full"
                ? "brand"
                : "warning"
            }
          />
        ),
        className: "w-[120px]",
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        headerAlign: "center",
        className: "w-[100px]",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1">
            <ActionButton
              tone="outline"
              size="xs"
              onClick={() => {
                setEditingRoom(r);
                setFormOpen(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </ActionButton>
            <ActionButton
              tone="danger"
              size="xs"
              onClick={() =>
                setDeleteTarget({ id: r.id, name: `${r.hostel} ${r.roomNo}` })
              }
            >
              <Trash2 className="h-3 w-3" />
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const filters = React.useMemo<FilterDef<HostelRoomRecord>[]>(
    () => [
      {
        key: "hostel",
        label: "Hostel",
        allLabel: "All Hostels",
        options: [...new Set(rooms.map((r) => r.hostel))],
        getValue: (r: HostelRoomRecord) => r.hostel,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Available", "Full", "Maintenance"],
        getValue: (r: HostelRoomRecord) => r.status,
      },
    ],
    [rooms]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hostel Management"
        className="mb-0 lg:mb-0"
        actions={
          <ActionButton
            tone="primary"
            size="md"
            onClick={() => {
              setEditingRoom(null);
              setFormOpen(true);
            }}
          >
            <Plus />
            <span>Add Room</span>
          </ActionButton>
        }
      />

      <StatGrid>
        <StatCard
          icon={Building2}
          label="Total Rooms"
          value={formatNumber(kpis.totalRooms)}
          title={`${kpis.totalRooms} rooms registered`}
        />
        <StatCard
          icon={BedDouble}
          label="Total Beds"
          value={formatNumber(kpis.totalBeds)}
          title={`${formatNumber(kpis.totalBeds)} total bed capacity`}
        />
        <StatCard
          icon={Users}
          label="Occupied"
          value={formatNumber(kpis.occupiedBeds)}
          title={`${kpis.fullRooms} full rooms`}
        />
        <StatCard
          icon={BedDouble}
          label="Available Beds"
          value={formatNumber(kpis.availableBeds)}
          title={`${kpis.maintenanceRooms} rooms under maintenance`}
        />
      </StatGrid>

      <SectionCard flush contentClassName="pt-5">
        <DataTable<HostelRoomRecord>
          data={rooms}
          columns={columns}
          getRowId={(r) => r.id}
          filters={filters}
          searchFn={(r, q) => {
            const lower = q.toLowerCase();
            return (
              r.hostel.toLowerCase().includes(lower) ||
              r.block.toLowerCase().includes(lower) ||
              r.roomNo.toLowerCase().includes(lower) ||
              r.roomCode.toLowerCase().includes(lower) ||
              r.warden.toLowerCase().includes(lower)
            );
          }}
          searchPlaceholder="Search hostel, block, room or warden…"
          pageSize={10}
          emptyMessage="No rooms match your search."
        />
      </SectionCard>

      <HostelRoomFormModal
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingRoom(null);
        }}
        totalCount={rooms.length}
        initialData={editingRoom}
        onSave={handleSave}
      />

      {deleteTarget && (
        <DeleteHostelRoomModal
          open={true}
          onOpenChange={(v) => {
            if (!v) setDeleteTarget(null);
          }}
          roomName={deleteTarget.name}
          onConfirm={() => {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
