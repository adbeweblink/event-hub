export type VenueType = "hotel" | "restaurant" | "coworking" | "studio" | "other";

export const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: "hotel", label: "飯店宴會廳" },
  { value: "studio", label: "展演空間" },
  { value: "coworking", label: "共享空間" },
  { value: "restaurant", label: "餐廳包場" },
  { value: "other", label: "其他" },
];

export const VENUE_TYPE_MAP = Object.fromEntries(
  VENUE_TYPES.map((t) => [t.value, t.label])
) as Record<VenueType, string>;

export type District =
  | "taipei"      // 台北市
  | "newtaipei"   // 新北市
  | "taoyuan"     // 桃園市
  | "taichung"    // 台中市
  | "tainan"      // 台南市
  | "kaohsiung"   // 高雄市
  | "other_dist"; // 其他

export const DISTRICTS: { value: District; label: string }[] = [
  { value: "taipei", label: "台北市" },
  { value: "newtaipei", label: "新北市" },
  { value: "taoyuan", label: "桃園市" },
  { value: "taichung", label: "台中市" },
  { value: "tainan", label: "台南市" },
  { value: "kaohsiung", label: "高雄市" },
  { value: "other_dist", label: "其他" },
];

export const DISTRICT_MAP = Object.fromEntries(
  DISTRICTS.map((d) => [d.value, d.label])
) as Record<District, string>;

export const VENUE_EQUIPMENT_OPTIONS = [
  { key: "projector", label: "投影機" },
  { key: "led", label: "LED 牆" },
  { key: "mic", label: "麥克風/音響" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "parking", label: "停車場" },
  { key: "catering", label: "餐飲服務" },
  { key: "livestream", label: "直播設備" },
  { key: "stage", label: "舞台" },
] as const;
