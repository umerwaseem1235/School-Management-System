"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import type { Campus } from "@/types";
import {
  PROVINCES_AND_CITIES,
  PROVINCE_OPTIONS,
  getProvinceForCity,
} from "./province-data";

interface EditBranchDialogProps {
  branch: Campus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateBranch: (branch: Campus) => void;
}

type EditBranchFormData = Partial<Omit<Campus, "capacity" | "established">> & {
  capacity?: number | "";
  established?: number | "";
};

export function EditBranchDialog({
  branch,
  open,
  onOpenChange,
  onUpdateBranch,
}: EditBranchDialogProps) {
  const [formData, setFormData] = React.useState<EditBranchFormData>({});

  React.useEffect(() => {
    if (branch) {
      const initialProvince =
        branch.province || getProvinceForCity(branch.city);
      setFormData({
        campusName: branch.campusName,
        campusCode: branch.campusCode,
        province: initialProvince,
        city: branch.city,
        address: branch.address,
        principal: branch.principal,
        phone: branch.phone,
        contactEmail: branch.contactEmail,
        capacity: branch.capacity,
        students: branch.students,
        staff: branch.staff,
        status: branch.status,
        established: branch.established,
      });
    }
  }, [branch]);

  // Dynamically compute available cities for the selected province
  const currentProvince =
    formData.province || (branch ? getProvinceForCity(branch.city) : "Punjab");
  const availableCities = React.useMemo(() => {
    return (
      PROVINCES_AND_CITIES[currentProvince] || PROVINCES_AND_CITIES["Punjab"]
    );
  }, [currentProvince]);

  const handleProvinceChange = (newProvince: string) => {
    const nextCities = PROVINCES_AND_CITIES[newProvince] || [];
    setFormData((prev) => ({
      ...prev,
      province: newProvince,
      city: nextCities.includes(prev.city || "")
        ? prev.city
        : nextCities[0] || "",
    }));
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setFormData((prev) => ({ ...prev, capacity: "" }));
      return;
    }
    const clean = val.replace(/\D/g, "");
    if (clean === "") {
      setFormData((prev) => ({ ...prev, capacity: "" }));
      return;
    }
    const parsed = parseInt(clean, 10);
    setFormData((prev) => ({
      ...prev,
      capacity: isNaN(parsed) ? "" : parsed,
    }));
  };

  const handleStepCapacity = (delta: number) => {
    setFormData((prev) => {
      const baseVal =
        typeof prev.capacity === "number"
          ? prev.capacity
          : prev.capacity === ""
          ? (branch?.capacity || 1000)
          : parseInt(String(prev.capacity), 10) || (branch?.capacity || 1000);
      const next = Math.max(1, baseVal + delta);
      return { ...prev, capacity: next };
    });
  };

  if (!branch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campusName?.trim()) {
      toast.error("Please enter a branch name");
      return;
    }

    if (!formData.campusCode?.trim()) {
      toast.error("Please enter a branch code");
      return;
    }

    if (!formData.city) {
      toast.error("Please select a city");
      return;
    }

    const updated: Campus = {
      ...branch,
      campusName: formData.campusName.trim(),
      campusCode: formData.campusCode.trim().toUpperCase(),
      province: formData.province || branch.province,
      city: formData.city || branch.city,
      address: formData.address?.trim() || branch.address,
      principal: formData.principal?.trim() || branch.principal,
      phone: formData.phone?.trim() || branch.phone,
      contactEmail: formData.contactEmail?.trim() || branch.contactEmail,
      capacity:
        Number(formData.capacity) > 0 ? Number(formData.capacity) : branch.capacity,
      status: formData.status || branch.status,
      established:
        Number(formData.established) > 0 ? Number(formData.established) : branch.established,
    };

    onUpdateBranch(updated);
    toast.success(`Branch "${updated.campusName}" updated successfully`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-brand-soft">
              <Building2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Edit Branch Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update details for {branch.campusName} ({branch.campusCode}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-branch-name" className="text-xs font-medium">
                Branch Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-branch-name"
                value={formData.campusName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, campusName: e.target.value })
                }
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Branch Code */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-code" className="text-xs font-medium">
                Branch Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-branch-code"
                value={formData.campusCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, campusCode: e.target.value })
                }
                className="h-9 text-xs font-mono uppercase"
                required
              />
            </div>

            {/* Operational Status */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-status" className="text-xs font-medium">
                Operational Status
              </Label>
              <Select
                value={formData.status || branch.status}
                onValueChange={(val) => {
                  if (val)
                    setFormData((prev) => ({
                      ...prev,
                      status: val as Campus["status"],
                    }));
                }}
              >
                <SelectTrigger id="edit-branch-status" className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active" className="text-xs">
                    Active
                  </SelectItem>
                  <SelectItem value="Pending" className="text-xs">
                    Pending
                  </SelectItem>
                  <SelectItem value="Inactive" className="text-xs">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Province / Region */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-province" className="text-xs font-medium">
                Province / Region <span className="text-destructive">*</span>
              </Label>
              <Select
                value={currentProvince}
                onValueChange={(val) => {
                  if (val) handleProvinceChange(val);
                }}
              >
                <SelectTrigger id="edit-branch-province" className="h-9 text-xs">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="max-h-48 w-[var(--anchor-width)] min-w-[var(--anchor-width)] max-w-[var(--anchor-width)] overflow-y-auto"
                >
                  {PROVINCE_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      <span className="truncate">{p}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cascading City */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-city" className="text-xs font-medium">
                City <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.city || branch.city}
                onValueChange={(val) => {
                  if (val) setFormData((prev) => ({ ...prev, city: val }));
                }}
              >
                <SelectTrigger id="edit-branch-city" className="h-9 text-xs">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  className="max-h-48 w-[var(--anchor-width)] min-w-[var(--anchor-width)] max-w-[var(--anchor-width)] overflow-y-auto"
                >
                  {availableCities.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      <span className="truncate">{c}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-branch-address" className="text-xs font-medium">
                Branch Address
              </Label>
              <Input
                id="edit-branch-address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Principal */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-principal" className="text-xs font-medium">
                Principal / Head of Branch
              </Label>
              <Input
                id="edit-branch-principal"
                value={formData.principal || ""}
                onChange={(e) =>
                  setFormData({ ...formData, principal: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-phone" className="text-xs font-medium">
                Contact Phone
              </Label>
              <Input
                id="edit-branch-phone"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-email" className="text-xs font-medium">
                Contact Email
              </Label>
              <Input
                id="edit-branch-email"
                type="email"
                value={formData.contactEmail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Student Capacity */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-branch-capacity" className="text-xs font-medium">
                Student Capacity
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="edit-branch-capacity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 1000"
                  value={formData.capacity !== undefined ? formData.capacity : ""}
                  onFocus={(e) => e.target.select()}
                  onChange={handleCapacityChange}
                  className="h-9 text-xs pr-16 font-medium tabular-nums"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={typeof formData.capacity === "number" && formData.capacity <= 1}
                    onClick={() => handleStepCapacity(-1)}
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Decrease capacity by 1"
                  >
                    <Minus className="size-3.5" />
                    <span className="sr-only">Decrease capacity</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStepCapacity(1)}
                    className="size-7 rounded-md text-muted-foreground hover:text-brand hover:bg-brand-50 dark:hover:bg-brand-soft cursor-pointer"
                    title="Increase capacity by 1"
                  >
                    <Plus className="size-3.5" />
                    <span className="sr-only">Increase capacity</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Year Established */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-branch-established" className="text-xs font-medium">
                Year Established
              </Label>
              <Input
                id="edit-branch-established"
                type="number"
                min="1980"
                max="2035"
                placeholder="e.g. 2026"
                value={formData.established !== undefined ? formData.established : ""}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setFormData((prev) => ({ ...prev, established: "" }));
                    return;
                  }
                  const parsed = parseInt(val, 10);
                  setFormData((prev) => ({
                    ...prev,
                    established: isNaN(parsed) ? "" : parsed,
                  }));
                }}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Update Branch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
