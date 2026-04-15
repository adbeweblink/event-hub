// ===== Core Types =====

export type UserRole = "viewer" | "executor" | "pm" | "admin";

export type EventStatus =
  | "draft"
  | "planning"
  | "preparing"
  | "marketing"
  | "executing"
  | "closing"
  | "archived";

export type EventType =
  | "seminar"
  | "workshop"
  | "launch"
  | "press"
  | "other";

export type EventFormat = "onsite" | "online" | "hybrid";

// ===== Dashboard Summary =====

export interface EventSummary {
  id: string;
  name: string;
  type: EventType;
  format: EventFormat;
  status: EventStatus;
  date: string; // ISO date
  endDate?: string;
  daysLeft: number;
  completionPercent: number;
  totalBudget: number;
  spentBudget: number;
  owner: string;
}

export interface TodoItem {
  id: string;
  eventId: string;
  eventName: string;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  completed: boolean;
}

// ===== Vendor =====

export type VendorCategory =
  | "venue"
  | "catering"
  | "equipment"
  | "printing"
  | "photography"
  | "livestream"
  | "staffing"
  | "design"
  | "gift"
  | "transport"
  | "insurance"
  | "pr"
  | "talent_fee"
  | "media_ad"
  | "other";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  taxId: string;            // 統一編號
  bankCode: string;         // 銀行代碼（如 808）
  bankName: string;         // 銀行名稱（如 玉山銀行）
  bankAccount: string;      // 銀行帳號
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Venue =====
// 實際型別定義在 modules/venues/hooks/use-venues.ts (VenueRecord)
// 待接 Supabase 後統一遷入此處

// Talent/Sponsor/Expense 的實際型別定義在各自模組的 hooks 中
// 待接 Supabase 後統一遷入此處
