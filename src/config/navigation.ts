import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  MonitorPlay,
  ClipboardCheck,
  FileQuestion,
  FileText,
  Award,
  CalendarCheck,
  UserCheck,
  CalendarClock,
  BarChart3,
  Trophy,
  Library,
  Building2,
  Wallet,
  Banknote,
  Calculator,
  CreditCard,
  Package,
  Bus,
  Box,
  Megaphone,
  Mail,
  Settings,
  Phone,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  AlertCircle,
  Scale,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  defaultExpanded?: boolean;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
    defaultExpanded: false,
  },
  {
    label: "Administration",
    icon: Users,
    items: [
      { title: "Reception", href: "/reception", icon: Phone },
      { title: "Students", href: "/students", icon: GraduationCap },
      { title: "Staff", href: "/staff", icon: Users },
      { title: "Users & Roles", href: "/users", icon: UserCog },
    ],
    defaultExpanded: false,
  },
  {
    label: "Academics",
    icon: BookOpen,
    items: [
      { title: "Academic Management", href: "/academics", icon: BookOpen },
      { title: "LMS", href: "/lms", icon: MonitorPlay },
    ],
    defaultExpanded: false,
  },
  {
    label: "Attendance",
    icon: CalendarCheck,
    items: [
      { title: "Overview", href: "/attendance", icon: LayoutDashboard, exact: true },
      { title: "Student Attendance", href: "/attendance/students", icon: GraduationCap },
      { title: "Staff Attendance", href: "/attendance/staff", icon: UserCheck },
      { title: "Leave Requests", href: "/attendance/leave-requests", icon: CalendarClock, badge: "5" },
      { title: "Leave Policy", href: "/attendance/leave-policy", icon: ShieldCheck },
      { title: "Student Attendance Report", href: "/attendance/reports", icon: BarChart3 },
      { title: "Staff Attendance Report", href: "/attendance/staff-reports", icon: FileText },
    ],
    defaultExpanded: false,
  },
  {
    label: "Examinations",
    icon: ClipboardCheck,
    items: [
      { title: "Examinations", href: "/examinations", icon: ClipboardCheck },
      { title: "Tests & Assessments", href: "/tests-assessments", icon: FileQuestion },
      { title: "Admission Tests", href: "/admission-tests", icon: FileText },
      { title: "Paper Generator", href: "/paper-generator", icon: FileText },
      { title: "Results", href: "/results", icon: Award },
      { title: "Certificates", href: "/certificates", icon: Award },
    ],
    defaultExpanded: false,
  },
  {
    label: "Student Life",
    icon: GraduationCap,
    items: [
      { title: "Sports", href: "/sports", icon: Trophy },
      { title: "Library", href: "/library", icon: Library },
      { title: "Hostel Management", href: "/hostel", icon: Building2 },
    ],
    defaultExpanded: false,
  },
  {
    label: "Finance",
    icon: Wallet,
    items: [
      { title: "Fee Management", href: "/fees", icon: Wallet, exact: true },
      { title: "Staff Payroll", href: "/fees/payroll", icon: Banknote },
      { title: "Refund", href: "/fees/refund", icon: RotateCcw },
      { title: "Update Fee", href: "/fees/update-fee", icon: SlidersHorizontal },
      { title: "Fines", href: "/fees/fines", icon: AlertCircle },
      { title: "Scholarship", href: "/fees/scholarships", icon: Award },
      { title: "Adjustment", href: "/fees/adjustments", icon: Scale },
      { title: "Reports", href: "/fees/reports", icon: BarChart3 },
      { title: "Accounts", href: "/accounts", icon: Calculator },
      { title: "Expenses", href: "/expenses", icon: CreditCard },
      { title: "Inventory", href: "/inventory", icon: Package },
    ],
    defaultExpanded: false,
  },
  {
    label: "Operations",
    icon: Bus,
    items: [
      { title: "Transport", href: "/transport", icon: Bus },
      { title: "Assets", href: "/assets", icon: Box },
    ],
    defaultExpanded: false,
  },
  {
    label: "Communication",
    icon: Megaphone,
    items: [
      { title: "Announcement", href: "/announcements", icon: Megaphone },
      { title: "Communication", href: "/communication", icon: Mail },
    ],
    defaultExpanded: false,
  },
  {
    label: "Settings",
    icon: Settings,
    items: [
      { title: "System Configuration", href: "/settings", icon: Settings },
    ],
    defaultExpanded: false,
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export const QUICK_PEOPLE_ICON = Users;
