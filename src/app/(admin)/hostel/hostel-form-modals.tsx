"use client";

import * as React from "react";
import { AlertTriangle, BedDouble, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import {
  HOSTEL_ROOM_TYPES,
  computeRoomStatus,
  type HostelRoomRecord,
  type HostelRoomType,
} from "@/lib/mock/hostel";

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const labelClass = "block text-[11px] font-semibold text-foreground/80 mb-1.5";

interface HostelRoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  initialData?: HostelRoomRecord | null;
  onSave: (record: HostelRoomRecord) => void;
}

export function HostelRoomFormModal({
  open,
  onOpenChange,
  totalCount,
  initialData,
  onSave,
}: HostelRoomFormModalProps) {
  const isEditing = Boolean(initialData);

  const [hostel, setHostel] = React.useState("");
  const [block, setBlock] = React.useState("");
  const [roomNo, setRoomNo] = React.useState("");
  const [type, setType] = React.useState<HostelRoomType>("Non-AC");
  const [capacity, setCapacity] = React.useState("4");
  const [occupied, setOccupied] = React.useState("0");
  const [warden, setWarden] = React.useState("");
  const [status, setStatus] = React.useState<"Available" | "Full" | "Maintenance">(
    "Available"
  );
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setHostel(initialData.hostel);
        setBlock(initialData.block);
        setRoomNo(initialData.roomNo);
        setType(initialData.type);
        setCapacity(String(initialData.capacity));
        setOccupied(String(initialData.occupied));
        setWarden(initialData.warden);
        setStatus(initialData.status);
        setRemarks(initialData.remarks);
      } else {
        setHostel("");
        setBlock("");
        setRoomNo("");
        setType("Non-AC");
        setCapacity("4");
        setOccupied("0");
        setWarden("");
        setStatus("Available");
        setRemarks("");
      }
    }
  }, [open, initialData]);

  const canSave =
    hostel.trim() && block.trim() && roomNo.trim() && Number(capacity) > 0;

  const handleSave = () => {
    if (!canSave) return;
    const cap = Math.max(1, Math.round(Number(capacity) || 1));
    const occ = Math.min(cap, Math.max(0, Math.round(Number(occupied) || 0)));
    const finalStatus =
      status === "Maintenance" ? "Maintenance" : computeRoomStatus(occ, cap);
    const record: HostelRoomRecord = {
      id: initialData?.id ?? `hr-${Date.now()}`,
      roomCode:
        initialData?.roomCode ?? `HR-${String(totalCount + 1).padStart(3, "0")}`,
      hostel: hostel.trim(),
      block: block.trim(),
      roomNo: roomNo.trim(),
      type,
      capacity: cap,
      occupied: occ,
      warden: warden.trim(),
      status: finalStatus,
      remarks: remarks.trim(),
    };
    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Room "${record.roomNo}" updated successfully`
        : `Room "${record.roomNo}" added successfully`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
              <BedDouble className="h-4 w-4 text-brand" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {isEditing ? "Edit Room" : "Add Room"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the room details below"
                  : "Fill in the details to register a new room"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hostel</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. Boys Hostel"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Block</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. A"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Room No.</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. 101"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                className={fieldClass}
                value={type}
                onChange={(e) => setType(e.target.value as HostelRoomType)}
              >
                {HOSTEL_ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={fieldClass}
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "Available" | "Full" | "Maintenance")
                }
              >
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Capacity</label>
              <input
                type="number"
                min="1"
                className={fieldClass}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Occupied</label>
              <input
                type="number"
                min="0"
                className={fieldClass}
                value={occupied}
                onChange={(e) => setOccupied(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Warden</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. Mr. Ahmed"
                value={warden}
                onChange={(e) => setWarden(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Remarks</label>
            <input
              type="text"
              className={fieldClass}
              placeholder="Optional notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            tone="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="primary"
            size="md"
            onClick={handleSave}
            disabled={!canSave}
          >
            {isEditing ? "Update" : "Save"}
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteHostelRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  onConfirm: () => void;
}

export function DeleteHostelRoomModal({
  open,
  onOpenChange,
  roomName,
  onConfirm,
}: DeleteHostelRoomModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
        <div className="px-6 pt-6 pb-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="text-sm font-bold text-foreground">
              Delete Room
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Are you sure you want to permanently remove room{" "}
              <span className="font-semibold text-foreground">
                &quot;{roomName}&quot;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="shrink-0 flex items-center justify-center gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            tone="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="danger"
            size="md"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
              toast.success(`Room "${roomName}" deleted`);
            }}
          >
            Delete
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
