import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  Handshake,
  Receipt,
  Truck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "總覽",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "活動總表與待辦事項",
  },
  {
    title: "活動專案",
    href: "/events",
    icon: Calendar,
    description: "管理所有行銷活動",
  },
  {
    title: "廠商",
    href: "/vendors",
    icon: Truck,
    description: "合作廠商與歷史報價",
  },
  {
    title: "場地",
    href: "/venues",
    icon: Building2,
    description: "場地資料庫",
  },
  {
    title: "講者",
    href: "/talents",
    icon: Users,
    description: "過往配合講者/主持人",
  },
  {
    title: "贊助商",
    href: "/sponsors",
    icon: Handshake,
    description: "贊助商資料庫",
  },
  {
    title: "雜支",
    href: "/expenses",
    icon: Receipt,
    description: "費用與雜支紀錄",
  },
  {
    title: "設定",
    href: "/settings",
    icon: Settings,
    description: "API 金鑰與平台設定",
  },
];
