"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { nativeSelectCn } from "@/shared/lib/styles";
import { HOLIDAYS_2026 } from "../../constants";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function getWeekday(dateStr: string) {
  return WEEKDAYS[new Date(dateStr).getDay()];
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr).getDay();
  return d === 0 || d === 6;
}

function isHoliday(dateStr: string) {
  return dateStr in HOLIDAYS_2026;
}

export function Step3Date({ draft, update }: Props) {
  // Generate calendar days for selected month
  const calendarDays = useMemo(() => {
    if (!draft.month || !draft.year) return [];
    const daysInMonth = new Date(draft.year, draft.month, 0).getDate();
    const days: { date: string; day: number; weekday: string; holiday: string | null; isWeekend: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${draft.year}-${String(draft.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day: d,
        weekday: getWeekday(dateStr),
        holiday: HOLIDAYS_2026[dateStr] ?? null,
        isWeekend: isWeekend(dateStr),
      });
    }
    return days;
  }, [draft.year, draft.month]);

  function toggleDate(dateStr: string) {
    const current = draft.tentativeDates;
    if (current.includes(dateStr)) {
      update("tentativeDates", current.filter((d) => d !== dateStr));
    } else if (current.length < 3) {
      update("tentativeDates", [...current, dateStr]);
    }
  }

  // Month options
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">活動時間</h2>
        <p className="text-sm text-muted-foreground">先選月份，再暫押最多 3 個日期</p>
      </div>

      {/* Month */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-sm font-medium">月份</label>
        <select
          className={nativeSelectCn}
          value={draft.month ?? ""}
          onChange={(e) => {
            update("month", e.target.value ? parseInt(e.target.value) : null);
            update("tentativeDates", []);
          }}
        >
          <option value="">先選月份</option>
          {months.map((m) => (
            <option key={m} value={m}>{m} 月</option>
          ))}
        </select>
      </div>

      {/* Calendar grid */}
      {draft.month && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-100 border border-red-200" /> 假日</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-100 border border-gray-200" /> 週末</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary/20 border border-primary/40" /> 已選</span>
            <span className="ml-auto">最多暫押 3 個日期</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {/* Weekday headers */}
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-xs font-medium text-muted-foreground py-1">{w}</div>
            ))}
            {/* Empty cells for first day offset */}
            {calendarDays.length > 0 &&
              Array.from({ length: new Date(calendarDays[0].date).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            {/* Day cells */}
            {calendarDays.map((d) => {
              const selected = draft.tentativeDates.includes(d.date);
              const holiday = d.holiday;
              const disabled = false; // 不禁選，只提示
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => toggleDate(d.date)}
                  className={`relative rounded-lg border p-2 text-center text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 font-bold"
                      : holiday
                        ? "border-red-200 bg-red-50 text-red-600"
                        : d.isWeekend
                          ? "border-gray-200 bg-gray-50 text-muted-foreground"
                          : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div>{d.day}</div>
                  <div className="text-[10px]">({d.weekday})</div>
                  {holiday && (
                    <div className="text-[8px] text-red-500 truncate">{holiday}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected dates summary */}
      {draft.tentativeDates.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">暫押日期</label>
          <div className="flex flex-wrap gap-2">
            {draft.tentativeDates.map((dateStr) => (
              <Badge
                key={dateStr}
                variant="secondary"
                className="text-sm gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => toggleDate(dateStr)}
              >
                {dateStr}（{getWeekday(dateStr)}）
                {isHoliday(dateStr) && <span className="text-red-500">假日</span>}
                ×
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
