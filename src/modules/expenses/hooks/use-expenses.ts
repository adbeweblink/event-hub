"use client";

import { useState, useMemo, useCallback } from "react";
import type { ExpenseCategory } from "../constants";

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  taxIncluded: boolean;
  eventName: string;
  vendor: string;
  receiptNo: string;
  paidBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const INITIAL: ExpenseRecord[] = [
  {
    id: "e1", date: "2026-04-10", category: "transport", description: "場勘計程車 — 三創 12F",
    amount: 350, taxIncluded: true, eventName: "AI 快充學堂", vendor: "", receiptNo: "",
    paidBy: "Mark", notes: "", createdAt: "2026-04-10", updatedAt: "2026-04-10",
  },
  {
    id: "e2", date: "2026-04-08", category: "print", description: "活動海報 A1 × 3 張",
    amount: 1800, taxIncluded: true, eventName: "AI 快充學堂", vendor: "創意印刷", receiptNo: "AB-20260408",
    paidBy: "Mark", notes: "", createdAt: "2026-04-08", updatedAt: "2026-04-08",
  },
  {
    id: "e3", date: "2026-04-05", category: "meal", description: "講者餐敘 × 4 人",
    amount: 3200, taxIncluded: true, eventName: "AI 快充學堂", vendor: "", receiptNo: "",
    paidBy: "Mark", notes: "含飲料", createdAt: "2026-04-05", updatedAt: "2026-04-05",
  },
  {
    id: "e4", date: "2026-03-28", category: "gift", description: "講者禮品 — 客製馬克杯 × 5",
    amount: 2500, taxIncluded: false, eventName: "AI 快充學堂", vendor: "全球禮品", receiptNo: "GG-0328",
    paidBy: "Irene", notes: "未稅價，含稅 2625", createdAt: "2026-03-28", updatedAt: "2026-03-28",
  },
];

export type ExpenseFormData = Omit<ExpenseRecord, "id" | "createdAt" | "updatedAt">;

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.eventName.toLowerCase().includes(search.toLowerCase()) ||
        e.vendor.toLowerCase().includes(search.toLowerCase()) ||
        e.paidBy.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || e.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const now = new Date().toISOString().slice(0, 10);
    setExpenses((prev) => [
      { ...data, id: `e${Date.now()}`, createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<ExpenseRecord>) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : e
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    expenses: filtered,
    totalCount: expenses.length,
    totalAmount,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    addExpense, updateExpense, deleteExpense,
  };
}
