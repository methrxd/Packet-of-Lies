import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  FileSearch,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Upload,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  requiredPermission?: string;
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
    requiredPermission: "manage_cases",
  },
  {
    href: "/submissions",
    label: "Submissions",
    description: "Senior evidence review",
    icon: Upload,
    requiredPermission: "view_submissions",
  },
  {
    href: "/indicators",
    label: "Indicators",
    description: "Observable intelligence",
    icon: FileSearch,
    requiredPermission: "view_indicators",
  },
  {
    href: "/reports",
    label: "Reports",
    description: "Incident summaries",
    icon: FileText,
    requiredPermission: "view_reports",
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
