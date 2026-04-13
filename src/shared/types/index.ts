// ===== Core Types =====

export type UserRole = "viewer" | "executor" | "pm" | "admin";

export type EventStatus =
  | "draft"
  | "planning"
  | "preparing"
  | "executing"
  | "closing"
  | "archived";

export type EventType =
  | "seminar"
  | "workshop"
  | "launch"
  | "webinar"
  | "exhibition"
  | "press"
  | "co_branding"
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
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  rating: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

// ===== Venue =====
// 實際型別定義在 modules/venues/hooks/use-venues.ts (VenueRecord)
// 待接 Supabase 後統一遷入此處

// ===== Talent (Speaker / Host) =====

export type TalentType = "speaker" | "host" | "staff" | "other";

export interface Talent {
  id: string;
  name: string;
  type: TalentType;
  specialty: string;
  feePerEvent?: number;
  feePerHour?: number;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  rating: number;
}

// ===== Sponsor =====

export type SponsorTier = "platinum" | "gold" | "silver" | "reciprocal";

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  totalSponsored: number;
  notes: string;
}

// ===== Expense (雜支) =====

export interface Expense {
  id: string;
  eventId?: string;
  eventName?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt?: string;
  vendor?: string;
}
