"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import { CLOSING_CHECKLIST } from "../constants";

interface CheckItem {
  id: string;
  label: string;
  done: boolean;
  sort_order: number;
}

export function EventChecklist({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("event_checklist")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order");
      if (data && data.length > 0) {
        setItems(data as CheckItem[]);
      } else if (data) {
        // Auto-seed from template
        const seeds = CLOSING_CHECKLIST.map((label, i) => ({
          event_id: eventId, label, done: false, sort_order: i,
        }));
        const { data: seeded } = await supabase.from("event_checklist").insert(seeds).select();
        if (seeded) setItems(seeded as CheckItem[]);
      }
      setLoading(false);
    })();
  }, [eventId]);

  const toggle = useCallback(async (id: string, done: boolean) => {
    const { error } = await supabase.from("event_checklist").update({ done }).eq("id", id);
    if (error) { toast.error("更新失敗"); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, done } : i));
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase.from("event_checklist").delete().eq("id", id);
    if (error) { toast.error("刪除失敗"); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addItem = useCallback(async () => {
    if (!newLabel.trim()) return;
    const { data: row } = await supabase.from("event_checklist").insert({
      event_id: eventId, label: newLabel.trim(), done: false, sort_order: items.length,
    }).select().single();
    if (row) {
      setItems((prev) => [...prev, row as CheckItem]);
      setNewLabel("");
      toast.success("已新增");
    }
  }, [eventId, newLabel, items.length]);

  const doneCount = items.filter((i) => i.done).length;
  const percent = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <Card className="ring-1 ring-foreground/10">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">結案清單</h3>
          <span className="text-xs text-muted-foreground">{doneCount} / {items.length} 完成（{percent}%）</span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">載入中...</p>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="group flex items-center gap-2 py-1.5 px-1 rounded hover:bg-muted/50 transition-colors">
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => toggle(item.id, !item.done)}
                >
                  {item.done ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>
                    {item.label}
                  </span>
                </button>
                <button
                  className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                  onClick={() => deleteItem(item.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
            placeholder="新增結案項目..."
            className="flex-1 text-sm"
          />
          <Button size="sm" variant="ghost" onClick={addItem} disabled={!newLabel.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
