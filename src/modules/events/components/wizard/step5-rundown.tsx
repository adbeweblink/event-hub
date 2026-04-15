"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { RUNDOWN_ITEM_TYPES, PERSON_STATUSES } from "../../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import { formatNTD } from "@/shared/lib/format";
import { useTalents } from "@/modules/talents/hooks/use-talents";
import { useVenues } from "@/modules/venues/hooks/use-venues";
import type { EventDraft, RundownItem } from "../../hooks/use-event-wizard";
import type { RundownItemType, PersonStatus } from "../../constants";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
  addRundownItem: (item: Omit<RundownItem, "id">) => void;
  removeRundownItem: (id: string) => void;
  updateRundownItem: (id: string, patch: Partial<RundownItem>) => void;
  moveRundownItem: (from: number, to: number) => void;
  rundownWithTimes: (RundownItem & { startTime: string; endTime: string })[];
}

export function Step5Rundown({
  draft, update,
  addRundownItem, removeRundownItem, updateRundownItem, moveRundownItem,
  rundownWithTimes,
}: Props) {
  const { talents: allSpeakers } = useTalents();
  const { venues: allVenues } = useVenues();
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

      {/* Time inputs — morning first */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">進場施工</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.setupTime} onChange={(e) => update("setupTime", e.target.value)}>
              {Array.from({ length: 16 }, (_, i) => i + 7).map((h) =>
                [0, 30].map((m) => {
                  const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  return <option key={t} value={t}>{t}</option>;
                })
              )}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">開始入場</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.startTime} onChange={(e) => update("startTime", e.target.value)}>
              {Array.from({ length: 16 }, (_, i) => i + 7).map((h) =>
                [0, 30].map((m) => {
                  const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  return <option key={t} value={t}>{t}</option>;
                })
              )}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">預計結束</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.endTime} onChange={(e) => update("endTime", e.target.value)}>
              {Array.from({ length: 16 }, (_, i) => i + 7).map((h) =>
                [0, 30].map((m) => {
                  const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  return <option key={t} value={t}>{t}</option>;
                })
              )}
            </select>
            {overTime && <p className="text-xs text-destructive">議程超時！</p>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">時間選單從上午 07:00 排到下午 19:30</p>
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
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm flex-1 min-w-0"
                      value={item.speakerName}
                      onChange={(e) => updateRundownItem(item.id, { speakerName: e.target.value })}
                    >
                      <option value="">選擇講者</option>
                      {allSpeakers.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}{s.title ? ` — ${s.title}` : ""}
                        </option>
                      ))}
                    </select>
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

                {/* Reorder + Delete */}
                <div className="flex flex-col shrink-0">
                  <button type="button" className="h-4 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20" disabled={idx === 0} onClick={() => moveRundownItem(idx, idx - 1)}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="h-4 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20" disabled={idx === rundownWithTimes.length - 1} onClick={() => moveRundownItem(idx, idx + 1)}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
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
      {(() => {
        const selectedVenues = allVenues.filter((v) => draft.venueIds.includes(v.id));
        const venueCost = selectedVenues.reduce((s, v) => s + (v.priceFullDay ?? v.priceHalfDay ?? 0), 0);
        const speakerCost = rundownWithTimes
          .filter((r) => needsSpeakerMap[r.type] && r.speakerName)
          .reduce((s, r) => {
            const speaker = allSpeakers.find((sp) => sp.name === r.speakerName);
            const hourlyRate = speaker?.fee ?? 5000;
            return s + Math.ceil(r.durationMin / 60) * hourlyRate;
          }, 0);
        const total = venueCost + speakerCost;
        return (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <label className="text-sm font-medium">預算試算</label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">
                場地費用（{selectedVenues.length} 場）
              </span>
              <span className="text-right">
                {venueCost > 0 ? formatNTD(venueCost) : "待確認"}
              </span>
              <span className="text-muted-foreground">
                講者費用（{rundownWithTimes.filter((r) => needsSpeakerMap[r.type] && r.speakerName).length} 位）
              </span>
              <span className="text-right">{formatNTD(speakerCost)}</span>
              <span className="font-medium border-t pt-2">預估總成本</span>
              <span className="font-medium text-right border-t pt-2">{formatNTD(total)}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
