import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  FileSearch,
  FileText,
  UserRound,
  LayoutDashboard,
  ShieldCheck,
  Upload,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const primaryNavigation: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Operational overview",
    icon: LayoutDashboard,
  },
  {
    href: "/cases",
    label: "Cases",
    description: "Investigation records",
    icon: BriefcaseBusiness,
  },
  {
    href: "/submissions",
    label: "Submissions",
    description: "Evidence intake",
    icon: Upload,
  },
  {
    href: "/indicators",
    label: "Indicators",
    description: "Observable intelligence",
    icon: FileSearch,
  },
  {
    href: "/reports",
    label: "Reports",
    description: "Incident summaries",
    icon: FileText,
  },
  {
    href: "/profile",
    label: "Profile",
    description: "Account settings",
    icon: UserRound,
  },
];

export const adminNavigation: AppNavItem[] = [
  {
    href: "/admin",
    label: "Admin",
    description: "Access and controls",
    icon: ShieldCheck,
  },
];
