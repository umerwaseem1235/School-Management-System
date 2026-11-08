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
import { AlertTriangle } from "lucide-react";
import type { Campus } from "@/types";

interface DeleteBranchDialogProps {
  branch: Campus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (branchId: string) => void;
}

export function DeleteBranchDialog({
  branch,
  open,
  onOpenChange,
  onConfirm,
}: DeleteBranchDialogProps) {
  if (!branch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Remove Branch
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-sm text-muted-foreground leading-relaxed">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">
            {branch.campusName}
          </span>{" "}
          ({branch.campusCode})? This branch location will be removed from active school operations.
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm(branch.id);
              onOpenChange(false);
            }}
          >
            Remove Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
