"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { nativeSelectCn } from "@/shared/lib/styles";
import { nowDate, parseLocalDate } from "@/shared/lib/format";
import { HOLIDAYS_2026 } from "../../constants";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const WEEKDAYS_LABEL = ["日", "一", "二", "三", "四", "五", "六"];

function getWeekday(dateStr: string) {
  return WEEKDAYS_LABEL[parseLocalDate(dateStr).getDay()];
}

function isWeekend(dateStr: string) {
  const d = parseLocalDate(dateStr).getDay();
  return d === 0 || d === 6;
}

function isHoliday(dateStr: string) {
  return dateStr in HOLIDAYS_2026;
}

// Module-level constants — stable for entire session
const TODAY = nowDate();
const TODAY_DISPLAY = `${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日（${getWeekday(TODAY)}）`;

// Precompute holiday count per month
const HOLIDAY_COUNTS: Record<number, number> = {};
for (const key of Object.keys(HOLIDAYS_2026)) {
  const m = parseInt(key.slice(5, 7));
  HOLIDAY_COUNTS[m] = (HOLIDAY_COUNTS[m] ?? 0) + 1;
}

export function Step3Date({ draft, update }: Props) {

  // Generate calendar days for selected month
  const calendarDays = useMemo(() => {
    if (!draft.month || !draft.year) return [];
    const daysInMonth = new Date(draft.year, draft.month, 0).getDate();
    const days: { date: string; day: number; weekday: string; holiday: string | null; isWeekend: boolean; isToday: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${draft.year}-${String(draft.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day: d,
        weekday: getWeekday(dateStr),
        holiday: HOLIDAYS_2026[dateStr] ?? null,
        isWeekend: isWeekend(dateStr),
        isToday: dateStr === TODAY,
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

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">活動時間</h2>
          <p className="text-sm text-muted-foreground">選月份看日曆，可跨月暫押最多 3 個日期</p>
        </div>
        <div className="text-sm text-muted-foreground text-right">
          今天 <span className="font-medium text-foreground">{TODAY_DISPLAY}</span>
        </div>
      </div>

      {/* Month */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-sm font-medium">瀏覽月份</label>
        <select
          className={nativeSelectCn}
          value={draft.month ?? ""}
          onChange={(e) => {
            update("month", e.target.value ? parseInt(e.target.value) : null);
          }}
        >
          <option value="">先選月份</option>
          {months.map((m) => {
            const hCount = HOLIDAY_COUNTS[m] ?? 0;
            return (
              <option key={m} value={m}>
                {m} 月{hCount > 0 ? `（${hCount} 天假日）` : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* Calendar grid */}
      {draft.month && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-100 border border-red-200" /> 假日</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-100 border border-gray-200" /> 週末</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary/20 border border-primary/40" /> 已選</span>
            <span className="ml-auto">
              已選 {draft.tentativeDates.length} / 3
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {/* Weekday headers */}
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-xs font-medium text-muted-foreground py-1">{w}</div>
            ))}
            {/* Empty cells for first day offset */}
            {calendarDays.length > 0 &&
              Array.from({ length: (new Date(calendarDays[0].date).getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            {/* Day cells */}
            {calendarDays.map((d) => {
              const selected = draft.tentativeDates.includes(d.date);
              const holiday = d.holiday;
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
                  } ${d.isToday ? "ring-2 ring-primary/50" : ""}`}
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

      {/* Selected dates summary — cross-month capable */}
      {draft.tentativeDates.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">暫押日期</label>
          <div className="flex flex-wrap gap-2">
            {[...draft.tentativeDates].sort().map((dateStr) => (
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
