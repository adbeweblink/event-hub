"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useMemo } from "react";
import { formatNTD } from "@/shared/lib/format";
import type { EventSummary, TodoItem } from "@/shared/types";

// ===== Mock Data（之後換成 Supabase 查詢）=====

const MOCK_EVENTS: EventSummary[] = [
  {
    id: "1",
    name: "2026 Adobe MAX 台灣站",
    type: "launch",
    format: "hybrid",
    status: "preparing",
    date: "2026-05-15",
    endDate: "2026-05-16",
    daysLeft: 33,
    completionPercent: 62,
    totalBudget: 850000,
    spentBudget: 420000,
    owner: "Mark",
  },
  {
    id: "2",
    name: "Q2 合作夥伴研討會",
    type: "seminar",
    format: "onsite",
    status: "planning",
    date: "2026-06-10",
    daysLeft: 59,
    completionPercent: 28,
    totalBudget: 320000,
    spentBudget: 45000,
    owner: "Irene",
  },
  {
    id: "3",
    name: "Creative Cloud 線上工作坊",
    type: "workshop",
    format: "online",
    status: "executing",
    date: "2026-04-18",
    daysLeft: 6,
    completionPercent: 85,
    totalBudget: 120000,
    spentBudget: 98000,
    owner: "Mark",
  },
  {
    id: "4",
    name: "媒體記者發表會",
    type: "press",
    format: "onsite",
    status: "draft",
    date: "2026-07-20",
    daysLeft: 99,
    completionPercent: 5,
    totalBudget: 500000,
    spentBudget: 0,
    owner: "Joy",
  },
];

const MOCK_TODOS: TodoItem[] = [
  {
    id: "t1",
    eventId: "3",
    eventName: "Creative Cloud 線上工作坊",
    title: "確認講師簡報內容",
    dueDate: "2026-04-14",
    priority: "urgent",
    assignee: "Mark",
    completed: false,
  },
  {
    id: "t2",
    eventId: "3",
    eventName: "Creative Cloud 線上工作坊",
    title: "測試直播平台穩定度",
    dueDate: "2026-04-15",
    priority: "high",
    assignee: "Irene",
    completed: false,
  },
  {
    id: "t3",
    eventId: "1",
    eventName: "2026 Adobe MAX 台灣站",
    title: "場地合約簽回",
    dueDate: "2026-04-18",
    priority: "high",
    assignee: "Mark",
    completed: false,
  },
  {
    id: "t4",
    eventId: "1",
    eventName: "2026 Adobe MAX 台灣站",
    title: "向三家攝影公司索取報價",
    dueDate: "2026-04-20",
    priority: "medium",
    assignee: "Joy",
    completed: false,
  },
  {
    id: "t5",
    eventId: "2",
    eventName: "Q2 合作夥伴研討會",
    title: "確認講者名單",
    dueDate: "2026-04-25",
    priority: "medium",
    assignee: "Mark",
    completed: false,
  },
  {
    id: "t6",
    eventId: "1",
    eventName: "2026 Adobe MAX 台灣站",
    title: "確認餐飲廠商（buffet vs 便當）",
    dueDate: "2026-04-28",
    priority: "low",
    assignee: "Irene",
    completed: true,
  },
];

// ===== Helpers =====

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-700" },
  planning: { label: "規劃中", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "準備中", color: "bg-amber-100 text-amber-700" },
  executing: { label: "執行中", color: "bg-green-100 text-green-700" },
  closing: { label: "結案中", color: "bg-purple-100 text-purple-700" },
  archived: { label: "已封存", color: "bg-gray-100 text-gray-500" },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  urgent: { label: "緊急", color: "bg-red-100 text-red-700" },
  high: { label: "高", color: "bg-orange-100 text-orange-700" },
  medium: { label: "中", color: "bg-blue-100 text-blue-700" },
  low: { label: "低", color: "bg-gray-100 text-gray-600" },
};

function daysLeftColor(days: number) {
  if (days <= 7) return "text-red-600";
  if (days <= 30) return "text-amber-600";
  return "text-muted-foreground";
}

// ===== Components =====

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
}) {
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

function EventCard({ event }: { event: EventSummary }) {
  const status = STATUS_MAP[event.status] ?? STATUS_MAP.draft;
  return (
    <Card className="ring-1 ring-foreground/10 hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate">{event.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {event.date}
              {event.endDate ? ` ~ ${event.endDate}` : ""} · {event.owner}
            </p>
          </div>
          <Badge variant="secondary" className={`shrink-0 text-xs ${status.color}`}>
            {status.label}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">完成度</span>
            <span className="font-medium">{event.completionPercent}%</span>
          </div>
          <Progress value={event.completionPercent} className="h-2.5" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${daysLeftColor(event.daysLeft)}`}>
            {event.daysLeft <= 0 ? "已過期" : `剩 ${event.daysLeft} 天`}
          </span>
          <span className="text-muted-foreground">
            {formatNTD(event.spentBudget)} / {formatNTD(event.totalBudget)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TodoRow({ item }: { item: TodoItem }) {
  const priority = PRIORITY_MAP[item.priority] ?? PRIORITY_MAP.medium;
  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b last:border-0">
      {item.completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={`text-base ${item.completed ? "line-through text-muted-foreground" : ""}`}
        >
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {item.eventName} · {item.assignee ?? "未指派"} · {item.dueDate}
        </p>
      </div>
      <Badge variant="secondary" className={`text-xs shrink-0 ${priority.color}`}>
        {priority.label}
      </Badge>
    </div>
  );
}

// ===== Main =====

export function DashboardOverview() {
  const activeEvents = useMemo(() => MOCK_EVENTS.filter((e) => e.status !== "archived"), []);
  const urgentCount = useMemo(() => MOCK_EVENTS.filter((e) => e.daysLeft <= 7 && e.status !== "archived").length, []);
  const totalBudget = useMemo(() => MOCK_EVENTS.reduce((s, e) => s + e.totalBudget, 0), []);
  const spentBudget = useMemo(() => MOCK_EVENTS.reduce((s, e) => s + e.spentBudget, 0), []);
  const pendingTodos = useMemo(() => MOCK_TODOS.filter((t) => !t.completed), []);
  const sortedEvents = useMemo(() => [...MOCK_EVENTS].sort((a, b) => a.daysLeft - b.daysLeft), []);
  const sortedTodos = useMemo(() => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
    return [...MOCK_TODOS].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">總覽</h1>
        <p className="text-sm text-muted-foreground">
          行銷活動概況
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          title="進行中活動"
          value={activeEvents.length}
          sub={`${MOCK_EVENTS.length} 個活動總計`}
        />
        <StatCard
          icon={AlertTriangle}
          title="即將到期"
          value={urgentCount}
          sub="7 天內需完成"
        />
        <StatCard
          icon={TrendingUp}
          title="總預算"
          value={formatNTD(totalBudget)}
          sub={`已使用 ${formatNTD(spentBudget)}`}
        />
        <StatCard
          icon={Clock}
          title="待辦事項"
          value={pendingTodos.length}
          sub={`${MOCK_TODOS.length} 項總計`}
        />
      </div>

      {/* Main Content: Events + Todos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Events Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="ring-1 ring-foreground/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">活動專案</CardTitle>
              <CardDescription>依到期日排序</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sortedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Todos */}
        <div className="space-y-4">
          <Card className="ring-1 ring-foreground/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">近期待辦</CardTitle>
              <CardDescription>
                {pendingTodos.length} 項未完成
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedTodos.map((item) => (
                <TodoRow key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
