"use client";

import {
  Activity,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Clock3,
  FileText,
  KeyRound,
  LayoutDashboard,
  List,
  MessageSquareText,
  MonitorSmartphone,
  Plug,
  ScanSearch,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import type {
  AppShellPrimaryLeftRailNavChildItem,
  AppShellPrimaryLeftRailNavItem,
  AppShellPrimaryLeftRailNavItemActiveInput,
} from "./app-appshell-primary-left-rail-schema";
import type { AppShellIconKey } from "./app-iconography-shared";

export const APP_SHELL_PRIMARY_LEFT_RAIL_RAW_NAV_ICON_MAP: Record<
  AppShellIconKey,
  LucideIcon
> = {
  activity: Activity,
  bell: MessageSquareText,
  briefcase: Briefcase,
  building: Building,
  "building-2": Building2,
  calendar: Calendar,
  camera: MonitorSmartphone,
  "chevron-left": List,
  "chevron-right": List,
  "circle-help": MessageSquareText,
  "clipboard-check": ShieldCheck,
  command: MessageSquareText,
  database: MonitorSmartphone,
  "file-text": FileText,
  "file-up": Plug,
  "grid-3x3": List,
  home: LayoutDashboard,
  keyboard: KeyRound,
  "key-round": KeyRound,
  "layout-dashboard": LayoutDashboard,
  "layout-grid": List,
  list: List,
  "message-circle": MessageSquareText,
  "message-square": MessageSquareText,
  "panel-left": List,
  "pen-line": MessageSquareText,
  "scan-search": ScanSearch,
  search: List,
  settings: Settings,
  shield: Shield,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  sparkles: Clock3,
  store: Plug,
  sun: Calendar,
  "user-round": UserRound,
  users: Users,
  wifi: MonitorSmartphone,
};

export function isAppShellPrimaryLeftRailNavItemActive(
  item: AppShellPrimaryLeftRailNavItemActiveInput,
  pathname: string,
) {
  if (pathname === item.href) {
    return true;
  }

  if (item.activePatterns?.some((pattern) => pathname.startsWith(pattern))) {
    return true;
  }

  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname.startsWith(`${item.href}/`);
}

export function childItemsForNavItem(item: AppShellPrimaryLeftRailNavItem) {
  return item.items ?? [];
}

export function isChildNavItemActive(
  item: AppShellPrimaryLeftRailNavChildItem,
  pathname: string,
) {
  return isAppShellPrimaryLeftRailNavItemActive(item, pathname);
}
