// Adobe FY 制：Q1=12-2月, Q2=3-5月, Q3=6-8月, Q4=9-11月
export type FiscalQuarter = "Q1" | "Q2" | "Q3" | "Q4";

export const FISCAL_QUARTERS: { value: FiscalQuarter; label: string; months: string }[] = [
  { value: "Q1", label: "Q1", months: "12 月 – 2 月" },
  { value: "Q2", label: "Q2", months: "3 月 – 5 月" },
  { value: "Q3", label: "Q3", months: "6 月 – 8 月" },
  { value: "Q4", label: "Q4", months: "9 月 – 11 月" },
];

export type EventType = "seminar" | "workshop" | "launch" | "press" | "webinar" | "other";

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "seminar", label: "研討會" },
  { value: "workshop", label: "工作坊" },
  { value: "launch", label: "發表會" },
  { value: "press", label: "記者會" },
  { value: "webinar", label: "線上直播" },
  { value: "other", label: "其他" },
];

export const EVENT_TYPE_MAP = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label])
) as Record<EventType, string>;

export type EventFormat = "onsite" | "online" | "hybrid";

export const EVENT_FORMATS: { value: EventFormat; label: string }[] = [
  { value: "onsite", label: "實體" },
  { value: "online", label: "線上" },
  { value: "hybrid", label: "混合" },
];

export type EventStatus = "draft" | "planning" | "preparing" | "marketing" | "executing" | "closing" | "archived";

export const EVENT_STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: "draft", label: "草稿", color: "bg-gray-100 text-gray-700" },
  { value: "planning", label: "規劃中", color: "bg-blue-100 text-blue-700" },
  { value: "preparing", label: "籌備中", color: "bg-indigo-100 text-indigo-700" },
  { value: "marketing", label: "行銷推廣", color: "bg-cyan-100 text-cyan-700" },
  { value: "executing", label: "執行中", color: "bg-green-100 text-green-700" },
  { value: "closing", label: "結案中", color: "bg-purple-100 text-purple-700" },
  { value: "archived", label: "已歸檔", color: "bg-gray-100 text-gray-500" },
];

export const EVENT_STATUS_MAP = Object.fromEntries(
  EVENT_STATUSES.map((s) => [s.value, s.label])
) as Record<EventStatus, string>;

// Rundown item types
export type RundownItemType =
  | "setup"       // 進場施工
  | "registration" // 入場報到
  | "opening"     // 開場致詞
  | "session"     // 議程
  | "workshop_s"  // 工作坊
  | "break"       // 中場休息
  | "meal"        // 用餐
  | "lottery"     // 抽獎
  | "qa"          // Q&A 交流
  | "closing_r"   // 散場
  | "other_r";    // 其他

export const RUNDOWN_ITEM_TYPES: { value: RundownItemType; label: string; needsSpeaker: boolean }[] = [
  { value: "setup", label: "進場施工", needsSpeaker: false },
  { value: "registration", label: "入場報到", needsSpeaker: false },
  { value: "opening", label: "開場致詞", needsSpeaker: true },
  { value: "session", label: "議程", needsSpeaker: true },
  { value: "workshop_s", label: "工作坊", needsSpeaker: true },
  { value: "break", label: "中場休息", needsSpeaker: false },
  { value: "meal", label: "用餐", needsSpeaker: false },
  { value: "lottery", label: "抽獎", needsSpeaker: false },
  { value: "qa", label: "Q&A 交流", needsSpeaker: false },
  { value: "closing_r", label: "散場", needsSpeaker: false },
  { value: "other_r", label: "其他", needsSpeaker: false },
];

export const RUNDOWN_ITEM_TYPE_MAP = Object.fromEntries(
  RUNDOWN_ITEM_TYPES.map((t) => [t.value, t.label])
) as Record<RundownItemType, string>;

// Person assignment status
export type PersonStatus = "pending" | "invited" | "tentative" | "confirmed" | "cancelled";

export const PERSON_STATUSES: { value: PersonStatus; label: string; color: string }[] = [
  { value: "pending", label: "待邀約", color: "bg-gray-100 text-gray-600" },
  { value: "invited", label: "已邀約", color: "bg-blue-100 text-blue-600" },
  { value: "tentative", label: "待確認", color: "bg-amber-100 text-amber-600" },
  { value: "confirmed", label: "已確認", color: "bg-green-100 text-green-600" },
  { value: "cancelled", label: "取消", color: "bg-red-100 text-red-600" },
];

export const PERSON_STATUS_MAP = Object.fromEntries(
  PERSON_STATUSES.map((s) => [s.value, s.label])
) as Record<PersonStatus, string>;

// Marketing channels
export const MARKETING_CHANNELS = [
  { value: "edm", label: "EDM" },
  { value: "social", label: "社群" },
  { value: "line", label: "LINE" },
  { value: "website", label: "官網" },
  { value: "media", label: "媒體" },
  { value: "kol", label: "KOL" },
] as const;

// Registration methods
export const REGISTRATION_METHODS = [
  { value: "self", label: "自建報名頁" },
  { value: "accupass", label: "ACCUPASS" },
  { value: "google_form", label: "Google 表單" },
  { value: "other", label: "其他" },
] as const;

// Closing checklist template
export const CLOSING_CHECKLIST = [
  "活動照片/影片收齊",
  "滿意度問卷發送",
  "費用結算（實際 vs 預算）",
  "發票/收據對帳",
  "廠商評分更新",
  "講者評分更新",
  "場地評分更新",
  "贊助商結案（權益兌現）",
  "結案報告撰寫",
];

// 2026 Taiwan holidays (人事行政局)
export const HOLIDAYS_2026: Record<string, string> = {
  "2026-01-01": "元旦",
  "2026-01-26": "除夕",
  "2026-01-27": "春節",
  "2026-01-28": "春節",
  "2026-01-29": "春節",
  "2026-01-30": "春節",
  "2026-02-02": "補假",
  "2026-02-23": "補假",
  "2026-02-27": "二二八和平紀念日（調整放假）",
  "2026-02-28": "二二八和平紀念日",
  "2026-04-03": "兒童節（調整放假）",
  "2026-04-04": "清明節",
  "2026-04-05": "民族掃墓節",
  "2026-04-06": "補假",
  "2026-05-01": "勞動節",
  "2026-05-31": "端午節",
  "2026-06-01": "補假",
  "2026-10-04": "中秋節",
  "2026-10-05": "補假",
  "2026-10-10": "國慶日",
  "2026-10-11": "補假",
};
