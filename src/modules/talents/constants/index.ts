export type TalentType = "speaker" | "host" | "photographer" | "other";
export type SpeakerSubType = "internal" | "creative" | "ai" | "";

export const TALENT_TYPES: { value: TalentType; label: string }[] = [
  { value: "speaker", label: "講者" },
  { value: "host", label: "主持人" },
  { value: "photographer", label: "攝影師" },
  { value: "other", label: "其他" },
];

export const TALENT_TYPE_MAP = Object.fromEntries(
  TALENT_TYPES.map((t) => [t.value, t.label])
) as Record<TalentType, string>;

export const SPEAKER_SUB_TYPES: { value: SpeakerSubType; label: string }[] = [
  { value: "internal", label: "內部講者" },
  { value: "creative", label: "創意講者" },
  { value: "ai", label: "AI 講者" },
];

export const SPEAKER_SUB_TYPE_MAP = Object.fromEntries(
  SPEAKER_SUB_TYPES.map((t) => [t.value, t.label])
) as Record<SpeakerSubType, string>;

export const FEE_UNIT_OPTIONS = [
  { value: "per_event", label: "每場" },
  { value: "per_hour", label: "每小時" },
  { value: "per_day", label: "每日" },
  { value: "negotiable", label: "面議" },
] as const;

export type FeeUnit = (typeof FEE_UNIT_OPTIONS)[number]["value"];
