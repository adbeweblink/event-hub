export type ExpenseCategory =
  | "venue"        // 場地租借
  | "catering"     // 餐飲
  | "photography"  // 攝影
  | "hosting"      // 主持
  | "livestream"   // 直播
  | "design"       // 設計
  | "printing"     // 印刷輸出
  | "equipment"    // 設備租借
  | "staffing"     // 人力派遣
  | "gift"         // 贈品禮品
  | "transport"    // 交通
  | "meal"         // 餐敘
  | "talent_fee"   // 講者費用
  | "pr"           // 公關代付
  | "media_ad"     // 媒體廣告
  | "insurance"    // 保險
  | "misc";        // 其他雜支

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "venue", label: "場地租借" },
  { value: "catering", label: "餐飲" },
  { value: "photography", label: "攝影" },
  { value: "hosting", label: "主持" },
  { value: "livestream", label: "直播" },
  { value: "design", label: "設計" },
  { value: "printing", label: "印刷輸出" },
  { value: "equipment", label: "設備租借" },
  { value: "staffing", label: "人力派遣" },
  { value: "gift", label: "贈品禮品" },
  { value: "transport", label: "交通" },
  { value: "meal", label: "餐敘" },
  { value: "talent_fee", label: "講者費用" },
  { value: "pr", label: "公關代付" },
  { value: "media_ad", label: "媒體廣告" },
  { value: "insurance", label: "保險" },
  { value: "misc", label: "其他雜支" },
];

export const EXPENSE_CATEGORY_MAP = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
) as Record<ExpenseCategory, string>;
