"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle2, Circle, ChevronDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/shared/lib/supabase";
import { daysUntil } from "@/shared/lib/format";
import { EVENT_TYPE_MAP, EVENT_STATUS_MAP, EVENT_STATUSES } from "@/modules/events/constants";

interface EventRow {
  id: string;
  name: string;
  type: string;
  format: string;
  status: string;
  tentative_dates: string[];
  confirmed_date: string | null;
  expected_attendees: number;
  completion_percent: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  EVENT_STATUSES.map((s) => [s.value, s.color])
);

function daysLeftColor(days: number) {
  if (days <= 7) return "text-red-600";
  if (days <= 30) return "text-amber-600";
  return "text-muted-foreground";
}

function StatCard({ title, value, sub, icon: Icon }: { title: string; value: string | number; sub: string; icon: React.ElementType }) {
  return (
    <Card className="ring-1 ring-foreground/10">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface TodoRow {
  id: string;
  label: string;
  done: boolean;
  event_id: string;
  event_name?: string;
}

function TodosCard({ todos }: { todos: TodoRow[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="ring-1 ring-foreground/10">
      <button
        className="flex w-full items-center justify-between p-5 pb-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h3 className="text-base font-semibold">待辦事項</h3>
          <p className="text-sm text-muted-foreground">{todos.length} 項未完成（跨活動）</p>
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <CardContent className="pt-0">
          {todos.map((t) => (
            <Link key={t.id} href={`/events/${t.event_id}`} className="flex items-center gap-3 py-2.5 border-b last:border-0 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors">
              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{t.label}</p>
                {t.event_name && <p className="text-xs text-muted-foreground">{t.event_name}</p>}
              </div>
            </Link>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function DashboardOverview() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [evtRes, todoRes] = await Promise.all([
        supabase.from("events").select("id, name, type, format, status, tentative_dates, confirmed_date, expected_attendees, completion_percent, created_at").order("created_at", { ascending: false }),
        supabase.from("event_checklist").select("id, label, done, event_id").eq("done", false).order("sort_order").limit(10),
      ]);
      if (cancelled) return;
      if (evtRes.data) setEvents(evtRes.data as EventRow[]);
      if (todoRes.data && evtRes.data) {
        const nameMap = new Map(evtRes.data.map((e: any) => [e.id, e.name]));
        setTodos(todoRes.data.map((t: any) => ({ ...t, event_name: nameMap.get(t.event_id) ?? "" })));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Realtime: auto-refresh on events table changes
  useEffect(() => {
    const channel = supabase.channel("dashboard-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
        // Re-fetch events
        (async () => {
          const { data } = await supabase.from("events").select("id, name, type, format, status, tentative_dates, confirmed_date, expected_attendees, completion_percent, created_at").order("created_at", { ascending: false });
          if (data) setEvents(data as EventRow[]);
        })();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeEvents = useMemo(() => events.filter((e) => e.status !== "archived" && e.status !== "draft"), [events]);

  const urgentCount = useMemo(() => {
    return events.filter((e) => {
      const dateStr = e.confirmed_date ?? e.tentative_dates?.[0];
      if (!dateStr) return false;
      return daysUntil(String(dateStr).slice(0, 10)) <= 7 && e.status !== "archived";
    }).length;
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((e) => e.status !== "archived")
      .sort((a, b) => {
        const dateA = a.confirmed_date ?? a.tentative_dates?.[0] ?? "9999-12-31";
        const dateB = b.confirmed_date ?? b.tentative_dates?.[0] ?? "9999-12-31";
        return String(dateA).localeCompare(String(dateB));
      });
  }, [events]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">總覽</h1>
        <p className="text-sm text-muted-foreground">行銷活動概況</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => (
              <Card key={i} className="ring-1 ring-foreground/10">
                <CardContent className="flex items-center gap-4 p-5">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-3">
              {[1,2,3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Calendar} title="進行中活動" value={activeEvents.length} sub={`${events.length} 個活動總計`} />
            <StatCard icon={AlertTriangle} title="即將到期" value={urgentCount} sub="7 天內" />
            <StatCard icon={TrendingUp} title="平均完成度" value={`${events.length > 0 ? Math.round(events.reduce((s, e) => s + e.completion_percent, 0) / events.length) : 0}%`} sub="所有活動" />
            <StatCard icon={Clock} title="活動數量" value={events.length} sub="已建立" />
          </div>

          {events.length === 0 ? (
            <Card className="ring-1 ring-foreground/10">
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <p>尚無活動</p>
                <Link href="/events/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">建立第一個活動</Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="ring-1 ring-foreground/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">活動專案</CardTitle>
                <CardDescription>依日期排序</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sortedEvents.map((evt) => {
                  const dateStr = evt.confirmed_date ?? evt.tentative_dates?.[0];
                  const days = dateStr ? daysUntil(String(dateStr).slice(0, 10)) : null;
                  const statusColor = STATUS_COLORS[evt.status] ?? "";
                  return (
                    <Link key={evt.id} href={`/events/${evt.id}`}>
                    <Card className="ring-1 ring-foreground/10 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base truncate">{evt.name || "未命名活動"}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {dateStr ? String(dateStr).slice(0, 10) : "日期未定"}
                              {evt.expected_attendees ? ` · ${evt.expected_attendees} 人` : ""}
                            </p>
                          </div>
                          <Badge variant="secondary" className={`shrink-0 text-xs ${statusColor}`}>
                            {EVENT_STATUS_MAP[evt.status as keyof typeof EVENT_STATUS_MAP] ?? evt.status}
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">完成度</span>
                            <span className="font-medium">{evt.completion_percent}%</span>
                          </div>
                          <Progress value={evt.completion_percent} className="h-2.5" />
                        </div>
                        {days !== null && (
                          <span className={`text-sm font-medium ${daysLeftColor(days)}`}>
                            {days <= 0 ? "已過期" : `剩 ${days} 天`}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Todos from event checklists — collapsible */}
          {todos.length > 0 && (
            <TodosCard todos={todos} />
          )}
        </>
      )}
    </div>
  );
}
