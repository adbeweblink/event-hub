export type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "media" | "reciprocal" | "other";

export const SPONSOR_TIERS: { value: SponsorTier; label: string; color: string }[] = [
  { value: "platinum", label: "白金贊助", color: "bg-violet-100 text-violet-700" },
  { value: "gold", label: "金級贊助", color: "bg-amber-100 text-amber-700" },
  { value: "silver", label: "銀級贊助", color: "bg-gray-100 text-gray-700" },
  { value: "bronze", label: "銅級贊助", color: "bg-orange-100 text-orange-700" },
  { value: "media", label: "媒體贊助", color: "bg-blue-100 text-blue-700" },
  { value: "reciprocal", label: "互惠合作", color: "bg-green-100 text-green-700" },
  { value: "other", label: "其他", color: "bg-gray-100 text-gray-600" },
];

export const SPONSOR_TIER_MAP = Object.fromEntries(
  SPONSOR_TIERS.map((t) => [t.value, t.label])
) as Record<SponsorTier, string>;

export const SPONSOR_TIER_COLOR_MAP = Object.fromEntries(
  SPONSOR_TIERS.map((t) => [t.value, t.color])
) as Record<SponsorTier, string>;

export type SponsorStatus = "active" | "negotiating" | "paused" | "ended";

export const SPONSOR_STATUSES: { value: SponsorStatus; label: string }[] = [
  { value: "active", label: "合作中" },
  { value: "negotiating", label: "洽談中" },
  { value: "paused", label: "暫停" },
  { value: "ended", label: "已結束" },
];

export const SPONSOR_STATUS_MAP = Object.fromEntries(
  SPONSOR_STATUSES.map((s) => [s.value, s.label])
) as Record<SponsorStatus, string>;
