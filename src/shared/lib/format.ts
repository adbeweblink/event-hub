/** 格式化為 NT$ 金額，null 回傳 "—" */
export function formatNTD(n: number | null): string {
  if (n == null) return "—";
  return `NT$ ${n.toLocaleString("zh-TW")}`;
}

/** 今天日期 YYYY-MM-DD */
export function nowDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Parse YYYY-MM-DD as local date (避免 UTC 時區 off-by-one) */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 星期幾中文（日~六，getDay() 索引） */
export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;

/** 計算到指定日期的天數（正=未來，負=已過） */
export function daysUntil(dateStr: string): number {
  const target = parseLocalDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
