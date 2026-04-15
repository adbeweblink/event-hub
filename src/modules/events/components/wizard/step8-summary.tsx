"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseLocalDate, formatNTD, WEEKDAYS } from "@/shared/lib/format";
import { useTalents } from "@/modules/talents/hooks/use-talents";
import {
  Calendar, MapPin, Users, Mic, DollarSign, Megaphone, Mail,
} from "lucide-react";
import {
  EVENT_TYPE_MAP, EVENT_FORMATS, getFYQuarters,
  RUNDOWN_ITEM_TYPES, PERSON_STATUS_MAP, MARKETING_CHANNELS, REGISTRATION_METHODS,
} from "../../constants";
import type { EventDraft, RundownItem } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
  rundownWithTimes: (RundownItem & { startTime: string; endTime: string })[];
}



function Row({ icon: Icon, label, value, muted }: { icon: React.ElementType; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-sm ${muted ? "text-muted-foreground" : "font-medium"}`}>{value}</div>
      </div>
    </div>
  );
}

export function Step8Summary({ draft, update, rundownWithTimes }: Props) {
  const { talents: allSpeakers } = useTalents();
  const quarter = getFYQuarters(draft.fySystem).find((q) => q.value === draft.quarter);
  const format = EVENT_FORMATS.find((f) => f.value === draft.format);
  const needsSpeaker = Object.fromEntries(RUNDOWN_ITEM_TYPES.map((t) => [t.value, t.needsSpeaker]));

  const speakerItems = rundownWithTimes.filter((r) => needsSpeaker[r.type] && r.speakerName);
  const estimatedCost = speakerItems.reduce((s, r) => {
    const speaker = allSpeakers.find((sp) => sp.name === r.speakerName);
    return s + Math.ceil(r.durationMin / 60) * (speaker?.fee ?? 5000);
  }, 0);

  const channels = draft.marketingChannels
    .map((c) => MARKETING_CHANNELS.find((ch) => ch.value === c)?.label)
    .filter(Boolean)
    .join(" / ");

  const dateDisplay = draft.tentativeDates.length > 0
    ? draft.tentativeDates[0]
    : "日期待定";

  // Count unfilled items as todos
  const todos: string[] = [];
  if (!draft.name) todos.push("填寫活動名稱");
  if (draft.venueIds.length === 0) todos.push("選擇場地");
  if (draft.tentativeDates.length === 0) todos.push("暫押活動日期");
  if (!draft.audienceDescription) todos.push("填寫受眾描述");
  if (rundownWithTimes.length === 0) todos.push("排議程 Rundown");
  if (draft.marketingChannels.length === 0) todos.push("選擇行銷管道");
  if (!draft.registrationMethod) todos.push("決定報名方式");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">確認建立</h2>
        <p className="text-sm text-muted-foreground">檢查一下，沒填的會變成待辦事項</p>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border bg-background p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-bold">
            {draft.name || `${draft.year} ${draft.quarter} 活動`}
          </h3>
          <Badge variant="secondary">{EVENT_TYPE_MAP[draft.type]}</Badge>
          <Badge variant="outline">{format?.label}</Badge>
        </div>

        <Row icon={Calendar} label="季度" value={`${draft.year} ${quarter?.label} (${quarter?.months})`} />

        <Row
          icon={Calendar}
          label="暫押日期"
          value={
            draft.tentativeDates.length > 0
              ? draft.tentativeDates.map((d) => `${d}（${WEEKDAYS[parseLocalDate(d).getDay()]}）`).join("、")
              : "尚未選擇"
          }
          muted={draft.tentativeDates.length === 0}
        />

        <Row
          icon={MapPin}
          label="場地"
          value={draft.venueIds.length > 0 ? `${draft.venueIds.length} 個候選場地` : "尚未選擇"}
          muted={draft.venueIds.length === 0}
        />

        <Row icon={Users} label="預計人數" value={draft.expectedAttendees ? `${draft.expectedAttendees} 人` : "未定"} muted={!draft.expectedAttendees} />

        <Row
          icon={Mic}
          label="議程"
          value={rundownWithTimes.length > 0 ? `${rundownWithTimes.length} 個項目（${draft.startTime} ~ ${draft.endTime}）` : "尚未排程"}
          muted={rundownWithTimes.length === 0}
        />

        <Row icon={DollarSign} label="預估成本" value={estimatedCost > 0 ? formatNTD(estimatedCost) : "待計算"} muted={estimatedCost === 0} />

        <Row
          icon={Megaphone}
          label="行銷"
          value={channels || "尚未規劃"}
          muted={!channels}
        />
      </div>

      {/* Rundown preview */}
      {rundownWithTimes.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <h4 className="text-sm font-medium">Rundown 預覽</h4>
          {rundownWithTimes.map((item) => {
            const typeName = RUNDOWN_ITEM_TYPES.find((t) => t.value === item.type)?.label ?? item.type;
            return (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-muted-foreground w-[110px] shrink-0">
                  {item.startTime} - {item.endTime}
                </span>
                <span className="font-medium">{typeName}</span>
                {item.speakerName && (
                  <>
                    <span className="text-muted-foreground">—</span>
                    <span>{item.speakerName}</span>
                    <Badge variant="outline" className="text-xs">
                      {PERSON_STATUS_MAP[item.speakerStatus]}
                    </Badge>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar invite */}
      <div className="rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">建立行事曆邀請</h4>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">與會者郵件（逗號分隔）</label>
            <Input
              value={draft.calendarEmails}
              onChange={(e) => update("calendarEmails", e.target.value)}
              placeholder="a@example.com, b@example.com"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">主旨</label>
              <Input
                value={draft.calendarSubject}
                onChange={(e) => update("calendarSubject", e.target.value)}
                placeholder="活動邀請"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">日期時間</label>
              <Input
                value={`${dateDisplay} ${draft.startTime} ~ ${draft.endTime}`}
                readOnly
                className="text-muted-foreground"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">內文</label>
            <Textarea
              value={draft.calendarBody}
              onChange={(e) => update("calendarBody", e.target.value)}
              rows={5}
              placeholder="自動從前面步驟帶入..."
            />
          </div>
        </div>
      </div>

      {/* Auto-generated todos */}
      {todos.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
          <h4 className="text-sm font-medium text-amber-700">
            建立後的待辦事項（{todos.length} 項）
          </h4>
          <ul className="space-y-1">
            {todos.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
