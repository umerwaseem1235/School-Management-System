"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/config/navigation";
import { cn } from "@/lib/utils";

// Route to title and group mapping
const ROUTE_MAP: Record<string, { title: string; group: string }> = {
  "/": { title: "Dashboard", group: "Dashboard" },
  "/dashboard": { title: "Dashboard", group: "Dashboard" },
  "/students": { title: "Students", group: "Students" },
  "/reception": { title: "Reception", group: "Reception" },
  "/staff": { title: "Staff", group: "Staff" },
  "/profile": { title: "Administrator Profile", group: "Administration" },
  "/admissions": { title: "Admissions", group: "Administration" },
  "/users": { title: "Users & Roles", group: "Administration" },
  "/academics": { title: "Academic Management", group: "Administration" },
  "/lms": { title: "LMS", group: "Academics" },
  "/examinations": { title: "Examinations", group: "Academics" },
  "/tests-assessments": { title: "Tests & Assessments", group: "Examinations" },
  "/admission-tests": { title: "Admission Tests", group: "Examinations" },
  "/paper-generator": { title: "Paper Generator", group: "Examinations" },
  "/results": { title: "Results", group: "Examinations" },
  "/certificates": { title: "Certificates", group: "Examinations" },
  "/attendance": { title: "Attendance Overview", group: "Attendance" },
  "/attendance/overview": { title: "Attendance Overview", group: "Attendance" },
  "/attendance/students": { title: "Student Attendance", group: "Attendance" },
  "/attendance/staff": { title: "Staff Attendance", group: "Attendance" },
  "/attendance/leave-requests": { title: "Leave Requests", group: "Attendance" },
  "/attendance/leave-policy": { title: "Leave Policy", group: "Attendance" },
  "/attendance/reports": { title: "Attendance Reports", group: "Attendance" },
  "/sports": { title: "Sports", group: "Student Life" },
  "/library": { title: "Library", group: "Student Life" },
  "/hostel": { title: "Hostel Management", group: "Student Life" },
  "/fees": { title: "Fee Collection", group: "Finance" },
  "/reports/fee-reports": { title: "Fee Reports", group: "Reports" },
  "/reports/student-attendance": { title: "Student Attendance Report", group: "Reports" },
  "/reports/staff-attendance": { title: "Staff Attendance Report", group: "Reports" },
  "/reports/teacher-salary": { title: "Teacher Salary Report", group: "Reports" },
  "/accounts": { title: "Accounts", group: "Administration" },
  "/branches": { title: "Branches", group: "Administration" },
  "/campuses": { title: "Branches", group: "Administration" },
  "/expenses": { title: "Expenses", group: "Finance" },
  "/inventory": { title: "Inventory", group: "Operations" },
  "/transport": { title: "Transport", group: "Operations" },
  "/assets": { title: "Assets", group: "Operations" },
  "/announcements": { title: "Announcement", group: "Communication" },
  "/communication": { title: "Communication", group: "Communication" },
  "/settings": { title: "System Configuration", group: "Settings" },
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();

  const current = React.useMemo(() => {
    if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname];
    for (const [route, meta] of Object.entries(ROUTE_MAP)) {
      if (route !== "/" && pathname.startsWith(route)) return meta;
    }
    for (const group of NAV_GROUPS) {
      const match = group.items.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      );
      if (match) {
        return { title: match.title, group: group.label };
      }
    }
    return { title: "Super Admin", group: "Overview" };
  }, [pathname]);

  return (
    <nav aria-label="Breadcrumb" className={cn("flex min-w-0 items-center gap-2", className)}>
      <span className="hidden text-xs font-bold uppercase tracking-wider text-white sm:inline shrink-0 drop-shadow-xs">
        {current.group}
      </span>
      <span className="hidden text-white/70 font-semibold sm:inline shrink-0">/</span>
      <h1 className="truncate font-heading text-[15px] font-extrabold tracking-tight text-white drop-shadow-xs">
        {current.title}
      </h1>
    </nav>
  );
}
