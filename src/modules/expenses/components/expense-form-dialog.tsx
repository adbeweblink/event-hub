"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EXPENSE_CATEGORIES } from "../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { ExpenseCategory } from "../constants";
import type { ExpenseRecord, ExpenseFormData } from "../hooks/use-expenses";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  initial?: ExpenseRecord | null;
}

const EMPTY: ExpenseFormData = {
  date: new Date().toISOString().slice(0, 10),
  category: "misc",
  description: "",
  amount: 0,
  taxIncluded: true,
  eventName: "",
  vendor: "",
  receiptNo: "",
  paidBy: "",
  notes: "",
};

export function ExpenseFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState<ExpenseFormData>(EMPTY);
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date,
        category: initial.category,
        description: initial.description,
        amount: initial.amount,
        taxIncluded: initial.taxIncluded,
        eventName: initial.eventName,
        vendor: initial.vendor,
        receiptNo: initial.receiptNo,
        paidBy: initial.paidBy,
        notes: initial.notes,
      });
    } else {
      setForm({ ...EMPTY, date: new Date().toISOString().slice(0, 10) });
    }
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || form.amount <= 0) return;
    onSubmit(form);
    onClose();
  }

  function set<K extends keyof ExpenseFormData>(key: K, value: ExpenseFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯雜支" : "新增雜支"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date + Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">日期 *</label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">分類</label>
              <select className={nativeSelectCn} value={form.category} onChange={(e) => set("category", e.target.value as ExpenseCategory)}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">說明 *</label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="費用說明" />
          </div>

          {/* Amount + Tax */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">金額 (NTD) *</label>
              <Input type="number" min={0} value={form.amount || ""} onChange={(e) => set("amount", parseInt(e.target.value) || 0)} placeholder="NT$" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">含稅</label>
              <select className={nativeSelectCn} value={form.taxIncluded ? "yes" : "no"} onChange={(e) => set("taxIncluded", e.target.value === "yes")}>
                <option value="yes">含稅</option>
                <option value="no">未稅</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">發票/收據編號</label>
              <Input value={form.receiptNo} onChange={(e) => set("receiptNo", e.target.value)} placeholder="AB-20260408" />
            </div>
          </div>

          {/* Event + Vendor + PaidBy */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">所屬活動</label>
              <Input value={form.eventName} onChange={(e) => set("eventName", e.target.value)} placeholder="活動名稱" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">廠商</label>
              <Input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="付款對象" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">代墊人</label>
              <Input value={form.paidBy} onChange={(e) => set("paidBy", e.target.value)} placeholder="誰先付的" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">備註</label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="補充說明" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>取消</Button>
            <Button type="submit">{isEdit ? "儲存" : "新增"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
