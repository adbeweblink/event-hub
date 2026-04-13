"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { RUNDOWN_ITEM_TYPES, PERSON_STATUSES } from "../../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import { formatNTD } from "@/shared/lib/format";
import type { EventDraft, RundownItem } from "../../hooks/use-event-wizard";
import type { RundownItemType, PersonStatus } from "../../constants";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
  addRundownItem: (item: Omit<RundownItem, "id">) => void;
  removeRundownItem: (id: string) => void;
  updateRundownItem: (id: string, patch: Partial<RundownItem>) => void;
  rundownWithTimes: (RundownItem & { startTime: string; endTime: string })[];
  totalBudget: number;
}

export function Step5Rundown({
  draft, update,
  addRundownItem, removeRundownItem, updateRundownItem,
  rundownWithTimes, totalBudget,
}: Props) {
  const needsSpeakerMap = Object.fromEntries(
    RUNDOWN_ITEM_TYPES.map((t) => [t.value, t.needsSpeaker])
  );

  function handleAddItem() {
    addRundownItem({
      type: "session",
      durationMin: 50,
      speakerName: "",
      speakerStatus: "pending",
      note: "",
    });
  }

  // Check if rundown end exceeds planned end
  const lastItem = rundownWithTimes[rundownWithTimes.length - 1];
  const overTime = lastItem && lastItem.endTime > draft.endTime;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">議程 × 人員 × 預算</h2>
        <p className="text-sm text-muted-foreground">設定三個時間點，逐條加議程，系統自動算時間</p>
      </div>

      {/* Three key times */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">進場施工</label>
          <Input type="time" value={draft.setupTime} onChange={(e) => update("setupTime", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">開始入場</label>
          <Input type="time" value={draft.startTime} onChange={(e) => update("startTime", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">預計結束</label>
          <Input type="time" value={draft.endTime} onChange={(e) => update("endTime", e.target.value)} />
          {overTime && <p className="text-xs text-destructive">議程超時！</p>}
        </div>
      </div>

      {/* Rundown items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Rundown</label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            新增項目
          </Button>
        </div>

        {rundownWithTimes.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            尚無議程，按「新增項目」開始排
          </div>
        ) : (
          <div className="space-y-1.5">
            {rundownWithTimes.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border bg-background p-2.5"
              >
                {/* Time (auto) */}
                <div className="w-[100px] shrink-0 text-center">
                  <div className="text-sm font-mono font-medium">{item.startTime}</div>
                  <div className="text-[10px] text-muted-foreground">~ {item.endTime}</div>
                </div>

                {/* Type dropdown */}
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm w-[100px] shrink-0"
                  value={item.type}
                  onChange={(e) => updateRundownItem(item.id, { type: e.target.value as RundownItemType })}
                >
                  {RUNDOWN_ITEM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* Duration */}
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={item.durationMin}
                  onChange={(e) => updateRundownItem(item.id, { durationMin: parseInt(e.target.value) || 10 })}
                  className="w-[70px] shrink-0 text-center"
                />
                <span className="text-xs text-muted-foreground shrink-0">分</span>

                {/* Speaker (conditional) */}
                {needsSpeakerMap[item.type] ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Input
                      value={item.speakerName}
                      onChange={(e) => updateRundownItem(item.id, { speakerName: e.target.value })}
                      placeholder="講者"
                      className="flex-1 min-w-0"
                    />
                    <select
                      className="h-8 rounded-md border border-input bg-background px-1.5 text-xs w-[72px] shrink-0"
                      value={item.speakerStatus}
                      onChange={(e) => updateRundownItem(item.id, { speakerStatus: e.target.value as PersonStatus })}
                    >
                      {PERSON_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex-1" />
                )}

                {/* Delete */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRundownItem(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget summary */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <label className="text-sm font-medium">預算試算</label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">場地費用</span>
          <span className="text-right">待確認</span>
          <span className="text-muted-foreground">
            講者費用（{rundownWithTimes.filter((r) => needsSpeakerMap[r.type] && r.speakerName).length} 位）
          </span>
          <span className="text-right">
            {formatNTD(
              rundownWithTimes
                .filter((r) => needsSpeakerMap[r.type] && r.speakerName)
                .reduce((s, r) => s + Math.ceil(r.durationMin / 60) * 5000, 0)
            )}
          </span>
          <span className="font-medium border-t pt-2">預估總成本</span>
          <span className="font-medium text-right border-t pt-2">
            {formatNTD(
              rundownWithTimes
                .filter((r) => needsSpeakerMap[r.type] && r.speakerName)
                .reduce((s, r) => s + Math.ceil(r.durationMin / 60) * 5000, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
