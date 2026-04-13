/** 格式化為 NT$ 金額，null 回傳 "—" */
export function formatNTD(n: number | null): string {
  if (n == null) return "—";
  return `NT$ ${n.toLocaleString("zh-TW")}`;
}

/** 今天日期 YYYY-MM-DD */
export function nowDate(): string {
  return new Date().toISOString().slice(0, 10);
}
