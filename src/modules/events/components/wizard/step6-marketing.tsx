"use client";

import { Input } from "@/components/ui/input";
import { MARKETING_CHANNELS, REGISTRATION_METHODS } from "../../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

export function Step6Marketing({ draft, update }: Props) {
  function toggleChannel(value: string) {
    const current = draft.marketingChannels;
    if (current.includes(value)) {
      update("marketingChannels", current.filter((c) => c !== value));
    } else {
      update("marketingChannels", [...current, value]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">行銷宣傳</h2>
        <p className="text-sm text-muted-foreground">可以全部跳過，之後再補</p>
      </div>

      {/* Key Visual */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">主視覺</label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {draft.keyVisualUrl ? "已上傳" : "待設計"}
          </span>
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">宣傳管道</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {MARKETING_CHANNELS.map((ch) => {
            const selected = draft.marketingChannels.includes(ch.value);
            return (
              <button
                key={ch.value}
                type="button"
                onClick={() => toggleChannel(ch.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Registration method */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-sm font-medium">報名方式</label>
        <select
          className={nativeSelectCn}
          value={draft.registrationMethod}
          onChange={(e) => update("registrationMethod", e.target.value)}
        >
          <option value="">尚未決定</option>
          {REGISTRATION_METHODS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Promotion start date */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-sm font-medium">預計開始宣傳日</label>
        <Input
          type="date"
          value={draft.promotionStartDate}
          onChange={(e) => update("promotionStartDate", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">建議活動前 4-6 週</p>
      </div>
    </div>
  );
}
