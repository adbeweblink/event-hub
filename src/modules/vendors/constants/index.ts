import type { VendorCategory } from "@/shared/types";

export const VENDOR_CATEGORIES: {
  value: VendorCategory;
  label: string;
}[] = [
  { value: "venue", label: "場地" },
  { value: "catering", label: "餐飲" },
  { value: "equipment", label: "設備租借" },
  { value: "printing", label: "印刷輸出" },
  { value: "photography", label: "攝影錄影" },
  { value: "livestream", label: "直播串流" },
  { value: "staffing", label: "人力派遣" },
  { value: "design", label: "設計製作" },
  { value: "gift", label: "贈品禮品" },
  { value: "transport", label: "交通物流" },
  { value: "insurance", label: "保險" },
  { value: "pr", label: "公關公司" },
  { value: "talent_fee", label: "講者/勞務" },
  { value: "media_ad", label: "媒體/廣告" },
  { value: "other", label: "其他" },
];

export const VENDOR_CATEGORY_MAP = Object.fromEntries(
  VENDOR_CATEGORIES.map((c) => [c.value, c.label])
) as Record<VendorCategory, string>;
