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
  Trophy,
  Library,
  Building2,
  Wallet,
  Calculator,
  Receipt,
  CreditCard,
  Package,
  Bus,
  Box,
  Megaphone,
  Mail,
  Settings,
  Phone,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
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
    defaultExpanded: true,
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
    defaultExpanded: true,
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
      { title: "Attendance", href: "/attendance", icon: CalendarCheck },
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
      { title: "Fee Management", href: "/fees", icon: Wallet },
      { title: "Accounts", href: "/accounts", icon: Calculator },
      { title: "Monthly Accounts", href: "/monthly-accounts", icon: Receipt },
      { title: "Expenses", href: "/expenses", icon: CreditCard },
    ],
    defaultExpanded: false,
  },
  {
    label: "Operations",
    icon: Package,
    items: [
      { title: "Inventory", href: "/inventory", icon: Package },
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
