export type ExpenseCategory = "transport" | "meal" | "print" | "gift" | "equipment" | "misc";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "transport", label: "交通" },
  { value: "meal", label: "餐飲" },
  { value: "print", label: "印刷輸出" },
  { value: "gift", label: "贈品禮品" },
  { value: "equipment", label: "設備租借" },
  { value: "misc", label: "其他雜支" },
];

export const EXPENSE_CATEGORY_MAP = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
) as Record<ExpenseCategory, string>;
