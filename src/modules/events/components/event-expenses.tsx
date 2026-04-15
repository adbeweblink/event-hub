"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import { formatNTD } from "@/shared/lib/format";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP } from "@/modules/expenses/constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { ExpenseCategory } from "@/modules/expenses/constants";

interface ExpenseRow {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  tax_included: boolean;
  vendor_name: string;
  paid_by: string;
  date: string;
  notes: string;
}

export function EventExpenses({ eventId }: { eventId: string }) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    category: "misc" as ExpenseCategory,
    description: "",
    amount: 0,
    tax_included: true,
    vendor_name: "",
    paid_by: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("event_expenses")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (data) setExpenses(data as ExpenseRow[]);
      setLoading(false);
    })();
  }, [eventId]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const addExpense = useCallback(async () => {
    if (!form.description || form.amount <= 0) return;
    const { data: row, error } = await supabase.from("event_expenses").insert({
      event_id: eventId,
      category: form.category,
      description: form.description,
      amount: form.amount,
      tax_included: form.tax_included,
      vendor_name: form.vendor_name,
      paid_by: form.paid_by,
      notes: form.notes,
      date: new Date().toISOString().slice(0, 10),
    }).select().single();
    if (!error && row) {
      setExpenses((prev) => [row as ExpenseRow, ...prev]);
      setForm({ category: "misc", description: "", amount: 0, tax_included: true, vendor_name: "", paid_by: "", notes: "" });
      setAdding(false);
      toast.success("費用已新增");
    } else {
      toast.error("新增失敗");
    }
  }, [eventId, form]);

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from("event_expenses").delete().eq("id", id);
    if (!error) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("費用已刪除");
    } else {
      toast.error("刪除失敗");
    }
  }, []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: "", amount: 0, vendor_name: "" });

  const startEdit = useCallback((e: ExpenseRow) => {
    setEditingId(e.id);
    setEditForm({ description: e.description, amount: e.amount, vendor_name: e.vendor_name });
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingId) return;
    const { error } = await supabase.from("event_expenses").update({
      description: editForm.description,
      amount: editForm.amount,
      vendor_name: editForm.vendor_name,
    }).eq("id", editingId);
    if (!error) {
      setExpenses((prev) => prev.map((e) => e.id === editingId ? { ...e, ...editForm } : e));
      setEditingId(null);
      toast.success("已更新");
    } else {
      toast.error("更新失敗");
    }
  }, [editingId, editForm]);

  return (
    <Card className="ring-1 ring-foreground/10">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">費用清單</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">合計 <span className="font-bold text-foreground">{formatNTD(total)}</span></span>
            <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
              <Plus className="mr-1 h-3.5 w-3.5" />新增
            </Button>
          </div>
        </div>

        {adding && (
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select className={nativeSelectCn} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="說明 *" />
              <Input type="number" min={0} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} placeholder="金額 (NTD) *" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} placeholder="廠商" />
              <Input value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} placeholder="代墊人" />
              <div className="flex gap-2">
                <Button onClick={addExpense} disabled={!form.description || form.amount <= 0}>確認新增</Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>取消</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">載入中...</p>
        ) : expenses.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground py-4 text-center">尚無費用紀錄</p>
        ) : (
          <div className="space-y-1">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {EXPENSE_CATEGORY_MAP[e.category] ?? e.category}
                </Badge>
                {editingId === e.id ? (
                  <>
                    <Input className="flex-1 h-7 text-sm" value={editForm.description} onChange={(ev) => setEditForm({ ...editForm, description: ev.target.value })} />
                    <Input className="w-20 h-7 text-sm" type="number" value={editForm.amount || ""} onChange={(ev) => setEditForm({ ...editForm, amount: parseInt(ev.target.value) || 0 })} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={saveEdit}><Check className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5" /></Button>
                  </>
                ) : (
                  <>
                    <span className="font-medium flex-1 min-w-0 truncate">{e.description}</span>
                    {e.vendor_name && <span className="text-muted-foreground text-xs">{e.vendor_name}</span>}
                    <span className="font-medium shrink-0">{formatNTD(e.amount)}</span>
                    {!e.tax_included && <span className="text-xs text-muted-foreground">未稅</span>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground" onClick={() => startEdit(e)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => deleteExpense(e.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
