"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Trash2, RotateCcw, Download, Pencil } from "lucide-react";
import { useEvents } from "../hooks/use-events";
import { parseLocalDate, WEEKDAYS } from "@/shared/lib/format";
import {
  EVENT_TYPE_MAP, EVENT_FORMATS, EVENT_STATUSES, EVENT_STATUS_MAP,
  getFYQuarters,
} from "../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import { downloadCSV } from "@/shared/lib/csv";
import type { EventStatus } from "../constants";

type SortKey = "date" | "name" | "completion" | "created";

export function EventList() {
  const {
    events, totalCount, loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    deleteEvent,
  } = useEvents();

  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const hasFilter = search || statusFilter !== "all";

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      switch (sortBy) {
        case "date": {
          const da = a.confirmedDate || a.tentativeDates?.[0] || "9999";
          const db = b.confirmedDate || b.tentativeDates?.[0] || "9999";
          return String(da).localeCompare(String(db));
        }
        case "name": return a.name.localeCompare(b.name);
        case "completion": return b.completionPercent - a.completionPercent;
        case "created": return b.createdAt.localeCompare(a.createdAt);
        default: return 0;
      }
    });
  }, [events, sortBy]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">活動專案</h1>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 個活動 · 顯示 {events.length} 筆
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            downloadCSV("events.csv",
              ["名稱", "類型", "狀態", "暫定日期", "預計人數", "完成度", "建立日期"],
              events.map((e) => [e.name, EVENT_TYPE_MAP[e.type] ?? e.type, EVENT_STATUS_MAP[e.status as keyof typeof EVENT_STATUS_MAP] ?? e.status, e.tentativeDates?.[0] ?? "", String(e.expectedAttendees || ""), `${e.completionPercent}%`, e.createdAt?.slice(0, 10) ?? ""])
            );
          }}>
            <Download className="mr-1.5 h-4 w-4" />匯出
          </Button>
          <Link href="/events/new">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              新增活動
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋活動名稱..."
            className="pl-9"
          />
        </div>
        <select
          className={nativeSelectCn}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | "all")}
        >
          <option value="all">全部狀態</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select className={nativeSelectCn} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
          <option value="date">依日期排序</option>
          <option value="name">依名稱排序</option>
          <option value="completion">依完成度排序</option>
          <option value="created">依建立時間排序</option>
        </select>
        {hasFilter && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-2 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          {hasFilter ? "沒有符合條件的活動" : "尚無活動，按右上角「新增活動」開始建立"}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium px-4 py-3">活動名稱</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">季度</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">類型</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">形式</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">狀態</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">暫押日期</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">人數</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">完成度</th>
                <th className="text-right font-medium px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((evt) => {
                const quarter = getFYQuarters(evt.fySystem).find((q) => q.value === evt.quarter);
                const formatLabel = EVENT_FORMATS.find((f) => f.value === evt.format)?.label;
                const statusDef = EVENT_STATUSES.find((s) => s.value === evt.status);
                return (
                  <tr
                    key={evt.id}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/events/${evt.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">
                      {evt.name || `${evt.year} ${evt.quarter} 活動`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {evt.year} {quarter?.label}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {EVENT_TYPE_MAP[evt.type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatLabel}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${statusDef?.color ?? ""}`}>
                        {statusDef?.label ?? evt.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {evt.tentativeDates.length > 0
                        ? evt.tentativeDates.map((d) => {
                            const ds = String(d).slice(0, 10);
                            try { return `${ds}（${WEEKDAYS[parseLocalDate(ds).getDay()]}）`; } catch { return ds; }
                          }).join("、")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {evt.expectedAttendees || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={evt.completionPercent} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{evt.completionPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/events/${evt.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteEvent(evt.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
