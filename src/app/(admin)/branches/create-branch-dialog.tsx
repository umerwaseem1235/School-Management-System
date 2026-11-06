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
} from "./province-data";

interface CreateBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBranch: (branch: Campus) => void;
}

export function CreateBranchDialog({
  open,
  onOpenChange,
  onAddBranch,
}: CreateBranchDialogProps) {
  const [formData, setFormData] = React.useState<{
    campusName: string;
    campusCode: string;
    province: string;
    city: string;
    address: string;
    principal: string;
    phone: string;
    contactEmail: string;
    capacity: number | "";
    students: number;
    staff: number;
    established: number | "";
    status: Campus["status"];
  }>({
    campusName: "",
    campusCode: "",
    province: "Punjab",
    city: "Lahore",
    address: "",
    principal: "",
    phone: "",
    contactEmail: "",
    capacity: 1000,
    students: 0,
    staff: 0,
    established: 2026,
    status: "Active",
  });

  // Dynamically compute the cities list for the currently selected province
  const availableCities = React.useMemo(() => {
    return PROVINCES_AND_CITIES[formData.province] || PROVINCES_AND_CITIES["Punjab"];
  }, [formData.province]);

  const handleProvinceChange = (newProvince: string) => {
    const nextCities = PROVINCES_AND_CITIES[newProvince] || [];
    setFormData((prev) => ({
      ...prev,
      province: newProvince,
      // If previous city belongs to the new province keep it, otherwise default to first city of selected province
      city: nextCities.includes(prev.city) ? prev.city : nextCities[0] || "",
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
      const current =
        typeof prev.capacity === "number"
          ? prev.capacity
          : prev.capacity === ""
          ? 1000
          : parseInt(String(prev.capacity), 10) || 1000;
      const next = Math.max(1, current + delta);
      return { ...prev, capacity: next };
    });
  };

  const resetForm = () => {
    setFormData({
      campusName: "",
      campusCode: "",
      province: "Punjab",
      city: "Lahore",
      address: "",
      principal: "",
      phone: "",
      contactEmail: "",
      capacity: 1000,
      students: 0,
      staff: 0,
      established: 2026,
      status: "Active",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campusName.trim()) {
      toast.error("Please enter a branch name");
      return;
    }

    if (!formData.campusCode.trim()) {
      toast.error("Please enter a branch code");
      return;
    }

    if (!formData.city) {
      toast.error("Please select a city");
      return;
    }

    const newBranch: Campus = {
      id: `branch-${Math.floor(1000 + Math.random() * 9000)}`,
      campusName: formData.campusName.trim(),
      campusCode: formData.campusCode.trim().toUpperCase(),
      city: formData.city,
      province: formData.province,
      address: formData.address.trim() || `${formData.city} Campus Address`,
      principal: formData.principal.trim() || "Unassigned",
      phone: formData.phone.trim() || "+92 42 0000 000",
      contactEmail:
        formData.contactEmail.trim() ||
        `${formData.campusCode.toLowerCase()}@edusphere.edu.pk`,
      capacity:
        typeof formData.capacity === "number" && formData.capacity > 0
          ? formData.capacity
          : 1000,
      students: Number(formData.students) || 0,
      staff: Number(formData.staff) || 0,
      feeCollectionRate: 90,
      status: formData.status,
      established:
        typeof formData.established === "number" && formData.established > 0
          ? formData.established
          : 2026,
    };

    onAddBranch(newBranch);
    toast.success(`Branch "${newBranch.campusName}" added successfully`);
    resetForm();
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
                Add New Branch
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Register a new school branch or campus location.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="branch-name" className="text-xs font-medium">
                Branch Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="branch-name"
                placeholder="e.g. Johar Town Campus"
                value={formData.campusName}
                onChange={(e) =>
                  setFormData({ ...formData, campusName: e.target.value })
                }
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Branch Code */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-code" className="text-xs font-medium">
                Branch Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="branch-code"
                placeholder="e.g. LHR-03"
                value={formData.campusCode}
                onChange={(e) =>
                  setFormData({ ...formData, campusCode: e.target.value.toUpperCase() })
                }
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            {/* Operational Status */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-status" className="text-xs font-medium">
                Operational Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(val) => {
                  if (val) setFormData((prev) => ({ ...prev, status: val as Campus["status"] }));
                }}
              >
                <SelectTrigger id="branch-status" className="h-9 text-xs">
                  <SelectValue placeholder="Select Status" />
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
              <Label htmlFor="branch-province" className="text-xs font-medium">
                Province / Region <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.province}
                onValueChange={(val) => {
                  if (val) handleProvinceChange(val);
                }}
              >
                <SelectTrigger id="branch-province" className="h-9 text-xs">
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
              <Label htmlFor="branch-city" className="text-xs font-medium">
                City <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.city}
                onValueChange={(val) => {
                  if (val) setFormData((prev) => ({ ...prev, city: val }));
                }}
              >
                <SelectTrigger id="branch-city" className="h-9 text-xs">
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

            {/* Street Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="branch-address" className="text-xs font-medium">
                Street Address
              </Label>
              <Input
                id="branch-address"
                placeholder="e.g. Plot 42, Block R-1, M.A. Johar Town"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Principal */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-principal" className="text-xs font-medium">
                Principal / Campus Head
              </Label>
              <Input
                id="branch-principal"
                placeholder="e.g. Dr. Rashid Mehmood"
                value={formData.principal}
                onChange={(e) =>
                  setFormData({ ...formData, principal: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-phone" className="text-xs font-medium">
                Contact Phone
              </Label>
              <Input
                id="branch-phone"
                placeholder="e.g. +92 42 3589 1234"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-email" className="text-xs font-medium">
                Contact Email
              </Label>
              <Input
                id="branch-email"
                type="email"
                placeholder="e.g. johar@edusphere.edu.pk"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Student Capacity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="branch-capacity" className="text-xs font-medium">
                  Student Capacity
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Default: 1000
                </span>
              </div>
              <div className="relative flex items-center">
                <Input
                  id="branch-capacity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 1000"
                  value={formData.capacity}
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
              <Label htmlFor="branch-established" className="text-xs font-medium">
                Year Established
              </Label>
              <Input
                id="branch-established"
                type="number"
                min="1980"
                max="2035"
                placeholder="e.g. 2026"
                value={formData.established}
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
              Save Branch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
