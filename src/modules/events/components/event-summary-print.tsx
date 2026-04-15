"use client";

import { formatNTD, parseLocalDate, WEEKDAYS } from "@/shared/lib/format";
import { EVENT_TYPE_MAP, EVENT_FORMATS, EVENT_STATUS_MAP, RUNDOWN_ITEM_TYPES, PARTNER_ROLES, MARKETING_CHANNELS } from "../constants";
import type { EventDetail } from "../hooks/use-event-detail";


export function EventSummaryPrint({ event, onClose }: { event: EventDetail; onClose: () => void }) {
  const format = EVENT_FORMATS.find((f) => f.value === event.format);
  const today = new Date();
  const todayStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto print:static">
      <div className="flex items-center justify-between p-4 border-b print:hidden">
        <h2 className="text-lg font-bold">活動摘要</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">列印 / 匯出 PDF</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">關閉</button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto p-12 print:p-8 text-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{event.name || "未命名活動"}</h1>
          {event.subtitle && <p className="text-gray-600 mt-1">{event.subtitle}</p>}
          <p className="text-gray-500 mt-1">活動摘要 · 列印日期 {todayStr}</p>
        </div>

        {/* Basic info table */}
        <table className="w-full border-collapse mb-6">
          <tbody>
            <tr className="border-b"><td className="py-2 pr-4 text-gray-500 w-[100px]">活動類型</td><td className="py-2 font-medium">{EVENT_TYPE_MAP[event.type]} · {format?.label}</td></tr>
            <tr className="border-b"><td className="py-2 pr-4 text-gray-500">狀態</td><td className="py-2">{EVENT_STATUS_MAP[event.status as keyof typeof EVENT_STATUS_MAP] ?? event.status}</td></tr>
            <tr className="border-b">
              <td className="py-2 pr-4 text-gray-500">日期</td>
              <td className="py-2">
                {event.confirmedDate
                  ? `${String(event.confirmedDate).slice(0, 10)}（${WEEKDAYS[parseLocalDate(event.confirmedDate).getDay()]}）✓ 確認`
                  : event.tentativeDates.length > 0
                    ? event.tentativeDates.map((d) => `${String(d).slice(0, 10)}（${WEEKDAYS[parseLocalDate(d).getDay()]}）`).join("、") + "（暫定）"
                    : "未定"}
              </td>
            </tr>
            {event.startTime && event.endTime && (
              <tr className="border-b"><td className="py-2 pr-4 text-gray-500">時間</td><td className="py-2">{String(event.startTime).slice(0, 5)} ~ {String(event.endTime).slice(0, 5)}</td></tr>
            )}
            <tr className="border-b"><td className="py-2 pr-4 text-gray-500">場地</td><td className="py-2">{event.venues.map((v) => v.name).join("、") || "未選"}</td></tr>
            <tr className="border-b"><td className="py-2 pr-4 text-gray-500">預計人數</td><td className="py-2">{event.expectedAttendees || "未定"}</td></tr>
            <tr className="border-b"><td className="py-2 pr-4 text-gray-500">完成度</td><td className="py-2">{event.completionPercent}%</td></tr>
            {event.marketingChannels.length > 0 && (
              <tr className="border-b"><td className="py-2 pr-4 text-gray-500">行銷管道</td><td className="py-2">{event.marketingChannels.map((c) => MARKETING_CHANNELS.find((ch) => ch.value === c)?.label ?? c).join("、")}</td></tr>
            )}
          </tbody>
        </table>

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <h3 className="font-medium mb-1 text-gray-700">活動描述</h3>
            <p className="whitespace-pre-wrap border-l-2 border-gray-200 pl-3">{event.description}</p>
          </div>
        )}

        {/* Rundown */}
        {event.rundown.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-700">議程 Rundown</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-xs">
                  <th className="text-left py-1.5 w-[60px]">時長</th>
                  <th className="text-left py-1.5">類型</th>
                  <th className="text-left py-1.5">講者</th>
                  <th className="text-left py-1.5">備註</th>
                </tr>
              </thead>
              <tbody>
                {event.rundown.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-1.5">{r.durationMin} 分</td>
                    <td className="py-1.5">{RUNDOWN_ITEM_TYPES.find((t) => t.value === r.type)?.label ?? r.type}</td>
                    <td className="py-1.5">{r.speakerName || "—"}</td>
                    <td className="py-1.5 text-gray-500">{r.note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sponsors */}
        {event.sponsors.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-700">贊助與合作</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-xs">
                  <th className="text-left py-1.5">角色</th>
                  <th className="text-left py-1.5">贊助商</th>
                  <th className="text-right py-1.5">金額</th>
                </tr>
              </thead>
              <tbody>
                {event.sponsors.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-1.5">{PARTNER_ROLES.find((r) => r.value === s.role)?.label ?? s.role}</td>
                    <td className="py-1.5 font-medium">{s.name}</td>
                    <td className="py-1.5 text-right">{s.fee ? formatNTD(s.fee) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Services */}
        {event.services.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-1 text-gray-700">所需服務</h3>
            <p>{event.services.map((s) => s.serviceName).join("、")}</p>
          </div>
        )}

        <div className="border-t pt-6 mt-12 flex justify-between text-xs text-gray-400">
          <p>Event Hub — 行銷活動管理平台</p>
          <p>第 1 頁，共 1 頁</p>
        </div>
      </div>
    </div>
  );
}
