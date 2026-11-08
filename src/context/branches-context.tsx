"use client";

import * as React from "react";
import { CAMPUSES } from "@/lib/mock/institution";
import type { Campus } from "@/types";

const STORAGE_KEY = "sms.branches.v1";

export interface BranchesContextType {
  /** Complete list of all registered branches */
  branches: Campus[];
  /** Filtered list of branches with status === "Active" */
  activeBranches: Campus[];
  /** Array of all branch/campus names */
  campusOptions: string[];
  /** Array of active branch/campus names */
  activeCampusOptions: string[];
  /** Add a new branch and propagate application-wide */
  addBranch: (branch: Campus) => void;
  /** Update an existing branch by id */
  updateBranch: (branch: Campus) => void;
  /** Remove a branch by id application-wide */
  deleteBranch: (id: string) => void;
  /** Toggle branch operational status between Active and Inactive */
  toggleBranchStatus: (id: string) => void;
  /** Look up branch by ID */
  getBranchById: (id: string) => Campus | undefined;
  /** Look up branch by exact or partial name */
  getBranchByName: (name: string) => Campus | undefined;
  /** Check if a branch is currently active */
  isBranchActive: (nameOrId: string) => boolean;
  /** Reset all branches back to institutional defaults */
  resetBranches: () => void;
}

const BranchesContext = React.createContext<BranchesContextType | null>(null);

export function BranchesProvider({ children }: { children: React.ReactNode }) {
  // Initialize with CAMPUSES so SSR and initial client hydration match identically
  const [branches, setBranches] = React.useState<Campus[]>(CAMPUSES);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate from localStorage once on client mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBranches(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(CAMPUSES));
      }
    } catch (e) {
      console.warn("Could not load branches from localStorage:", e);
    }
    setIsHydrated(true);
  }, []);

  // Listen for storage events from other tabs or windows
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBranches(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Helper to persist state to localStorage
  const persistBranches = React.useCallback((next: Campus[]) => {
    setBranches(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to save branches to localStorage:", e);
    }
  }, []);

  const addBranch = React.useCallback(
    (newBranch: Campus) => {
      setBranches((prev) => {
        // Prevent duplicate IDs
        const exists = prev.some((b) => b.id === newBranch.id);
        const next = exists
          ? prev.map((b) => (b.id === newBranch.id ? newBranch : b))
          : [newBranch, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const updateBranch = React.useCallback(
    (updated: Campus) => {
      setBranches((prev) => {
        const next = prev.map((b) => (b.id === updated.id ? updated : b));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const deleteBranch = React.useCallback(
    (id: string) => {
      setBranches((prev) => {
        const next = prev.filter((b) => b.id !== id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const toggleBranchStatus = React.useCallback(
    (id: string) => {
      setBranches((prev) => {
        const next = prev.map((b) => {
          if (b.id === id) {
            const nextStatus: Campus["status"] =
              b.status === "Active" ? "Inactive" : "Active";
            return { ...b, status: nextStatus };
          }
          return b;
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const resetBranches = React.useCallback(() => {
    persistBranches(CAMPUSES);
  }, [persistBranches]);

  const activeBranches = React.useMemo(
    () => branches.filter((b) => b.status === "Active"),
    [branches]
  );

  const campusOptions = React.useMemo(
    () => branches.map((b) => b.campusName),
    [branches]
  );

  const activeCampusOptions = React.useMemo(
    () => activeBranches.map((b) => b.campusName),
    [activeBranches]
  );

  const getBranchById = React.useCallback(
    (id: string) => branches.find((b) => b.id === id),
    [branches]
  );

  const getBranchByName = React.useCallback(
    (name: string) =>
      branches.find(
        (b) =>
          b.campusName.toLowerCase() === name.toLowerCase() ||
          b.campusCode.toLowerCase() === name.toLowerCase()
      ),
    [branches]
  );

  const isBranchActive = React.useCallback(
    (nameOrId: string) => {
      const found = branches.find(
        (b) =>
          b.id === nameOrId ||
          b.campusName.toLowerCase() === nameOrId.toLowerCase() ||
          b.campusCode.toLowerCase() === nameOrId.toLowerCase()
      );
      return found ? found.status === "Active" : true;
    },
    [branches]
  );

  const value = React.useMemo<BranchesContextType>(
    () => ({
      branches,
      activeBranches,
      campusOptions,
      activeCampusOptions,
      addBranch,
      updateBranch,
      deleteBranch,
      toggleBranchStatus,
      getBranchById,
      getBranchByName,
      isBranchActive,
      resetBranches,
    }),
    [
      branches,
      activeBranches,
      campusOptions,
      activeCampusOptions,
      addBranch,
      updateBranch,
      deleteBranch,
      toggleBranchStatus,
      getBranchById,
      getBranchByName,
      isBranchActive,
      resetBranches,
    ]
  );

  return (
    <BranchesContext.Provider value={value}>
      {children}
    </BranchesContext.Provider>
  );
}

export function useBranches(): BranchesContextType {
  const ctx = React.useContext(BranchesContext);
  if (!ctx) {
    throw new Error("useBranches must be used within a <BranchesProvider>");
  }
  return ctx;
}
