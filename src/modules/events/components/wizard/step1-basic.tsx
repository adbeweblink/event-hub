"use client";

import { Input } from "@/components/ui/input";
import { FISCAL_QUARTERS, EVENT_TYPES, EVENT_FORMATS } from "../../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { EventDraft } from "../../hooks/use-event-wizard";
import type { FiscalQuarter, EventType, EventFormat } from "../../constants";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

export function Step1Basic({ draft, update }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">建立活動</h2>
        <p className="text-sm text-muted-foreground">先定大方向，細節之後再補</p>
      </div>

      {/* Year + Quarter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">年度</label>
          <Input
            type="number"
            value={draft.year}
            onChange={(e) => update("year", parseInt(e.target.value) || new Date().getFullYear())}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">季度（Adobe FY）</label>
          <div className="grid grid-cols-4 gap-2">
            {FISCAL_QUARTERS.map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => update("quarter", q.value as FiscalQuarter)}
                className={`rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                  draft.quarter === q.value
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="font-bold">{q.label}</div>
                <div className="text-[10px] text-muted-foreground">{q.months}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">暫定名稱</label>
        <Input
          value={draft.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder={`${draft.year} ${draft.quarter} 活動（之後可改）`}
        />
      </div>

      {/* Event URL */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">活動網址</label>
        <Input
          type="url"
          value={draft.eventUrl}
          onChange={(e) => update("eventUrl", e.target.value)}
          placeholder="https://...（選填，之後可補）"
        />
      </div>

      {/* Type + Format */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">活動類型</label>
          <select
            className={nativeSelectCn}
            value={draft.type}
            onChange={(e) => update("type", e.target.value as EventType)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">活動形式</label>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => update("format", f.value as EventFormat)}
                className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  draft.format === f.value
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
