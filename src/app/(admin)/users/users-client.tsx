"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Status, User } from "@/types";
import {
  Users as UsersIcon,
  UserCheck,
  ShieldCheck,
  Clock,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { UsersTable } from "./users-table";
import { CreateUserDialog } from "./create-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";

interface UsersClientProps {
  initialUsers: User[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [usersList, setUsersList] = React.useState<User[]>(initialUsers);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  // Summary Metrics
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter((u) => u.status === "Active").length;
  const roleCount = new Set(usersList.map((u) => u.role)).size;
  const recentLogins = usersList.filter(
    (u) => u.status === "Active" && u.lastLogin && u.lastLogin !== "Never"
  ).length;

  const handleAddUser = (newUser: User) => {
    setUsersList((prev) => [newUser, ...prev]);

    let detail = "";
    if (newUser.role === "Teacher") {
      detail = newUser.assignedSubjects
        ? `Faculty (${newUser.assignedSubjects})`
        : "Academic Faculty";
    } else if (newUser.role === "Student") {
      detail = newUser.studentRollNo
        ? `Student (${newUser.studentRollNo})`
        : "Student Portal";
    } else if (newUser.role === "Parent") {
      detail = newUser.guardianName
        ? `Parent Portal (Child: ${newUser.guardianName})`
        : "Parent Portal";
    } else if (newUser.role === "HR Admin") {
      detail = newUser.designation || "HR Operations";
    } else if (newUser.role === "Accountant") {
      detail = newUser.designation || "Accounts & Finance";
    } else {
      detail = newUser.role;
    }

    toast.success("User Account Created", {
      description: `${newUser.name} provisioned as ${detail} · ${newUser.campus}.`,
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    // Prevent modifying Super Admin users
    const existing = usersList.find((u) => u.id === updatedUser.id);
    if (existing?.role === "Super Admin" || updatedUser.role === "Super Admin") {
      toast.error("Action Prohibited", {
        description: "Super Admin accounts are root system entities and cannot be modified.",
      });
      return;
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setSelectedUserForEdit(updatedUser);
  };

  const handleStatusChange = (id: string, newStatus: Status) => {
    const user = usersList.find((u) => u.id === id);
    if (!user) return;

    // Strict Super Admin protection
    if (user.role === "Super Admin") {
      toast.error("Protected Master Account", {
        description: "Super Admin accounts cannot be deactivated, suspended, or modified.",
      });
      return;
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );

    setSelectedUserForEdit((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );

    const name = user.name || "User";

    if (newStatus === "Inactive") {
      toast.warning("User Deactivated", {
        description: `${name}'s login access is now suspended. Historical records are retained safely.`,
      });
    } else if (newStatus === "Active") {
      toast.success("User Activated", {
        description: `${name} is now active and permitted to sign in.`,
      });
    } else if (newStatus === "Suspended") {
      toast.error("User Suspended", {
        description: `${name} has been temporarily suspended from all systems.`,
      });
    } else {
      toast.info("Status Updated", {
        description: `${name} status set to ${newStatus}.`,
      });
    }
  };

  const handleOpenEdit = (user: User) => {
    if (user.role === "Super Admin") {
      toast.warning("Root Account Protected", {
        description: "Super Admin profile, credentials, and access permissions are locked against modifications.",
      });
      return;
    }
    setSelectedUserForEdit(user);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Access Control"
        actions={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-brand text-cream hover:bg-brand-600 gap-1.5 cursor-pointer shadow-sm text-xs font-semibold"
          >
            <UserPlus className="size-4" />
            <span>+ Create User</span>
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Users"
          value={formatNumber(totalUsers)}
          icon={UsersIcon}
        />
        <StatCard
          label="Active Users"
          value={formatNumber(activeUsers)}
          icon={UserCheck}
        />
        <StatCard
          label="Roles"
          value={roleCount.toString()}
          icon={ShieldCheck}
        />
        <StatCard
          label="Recent Logins"
          value={formatNumber(recentLogins)}
          icon={Clock}
        />
      </StatGrid>

      <SectionCard flush>
        <UsersTable
          data={usersList}
          onSelectUser={handleOpenEdit}
          onStatusChange={handleStatusChange}
        />
      </SectionCard>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onAddUser={handleAddUser}
        existingCount={usersList.length}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={selectedUserForEdit}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdateUser={handleUpdateUser}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
