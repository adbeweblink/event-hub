"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, MapPin, Users, Mic, DollarSign, Megaphone, Mail, ArrowLeft, ChevronDown, Pencil, Check, Copy, Download, Image, FileText, Tag, Clock, Plus, X,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEventDetail } from "../hooks/use-event-detail";
import {
  EVENT_TYPE_MAP, EVENT_TYPES, EVENT_FORMATS, EVENT_STATUSES, EVENT_STATUS_MAP,
  getFYQuarters, RUNDOWN_ITEM_TYPES, PERSON_STATUS_MAP, MARKETING_CHANNELS,
  PARTNER_ROLES, PARTNER_ROLE_MAP, REGISTRATION_METHODS,
} from "../constants";
import { formatNTD, parseLocalDate, WEEKDAYS } from "@/shared/lib/format";
import { supabase } from "@/shared/lib/supabase";
import { nativeSelectCn } from "@/shared/lib/styles";
import { downloadICS } from "@/shared/lib/ics";
import { EventExpenses } from "./event-expenses";
import { EventChecklist } from "./event-checklist";
import { Quotation } from "./quotation";
import { EventSummaryPrint } from "./event-summary-print";
import { useAuth } from "@/modules/core/hooks/use-auth";
import type { EventStatus } from "../constants";
import type { EventDetail as EventDetailType } from "../hooks/use-event-detail";


const TABS = [
  { key: "overview", label: "基本資訊", icon: Calendar },
  { key: "rundown", label: "議程", icon: Mic },
  { key: "sponsors", label: "贊助合作", icon: DollarSign },
  { key: "marketing", label: "行銷文案", icon: Megaphone },
  { key: "closing", label: "費用結案", icon: FileText },
] as const;
type TabKey = typeof TABS[number]["key"];

function EditableText({ value, field, onSave, multiline }: {
  value: string; field: string; onSave: (field: string, value: string) => void; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <div className="group flex items-start gap-1 cursor-pointer" onClick={() => { setDraft(value); setEditing(true); }}>
        <span className="text-sm font-medium">{value || <span className="text-muted-foreground italic">點擊編輯</span>}</span>
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 mt-0.5 shrink-0" />
      </div>
    );
  }

  const Component = multiline ? Textarea : Input;
  return (
    <div className="flex items-start gap-1.5">
      <Component
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (!multiline && e.key === "Enter") { onSave(field, draft); setEditing(false); } }}
        autoFocus
        className="text-sm"
        rows={multiline ? 3 : undefined}
      />
      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => { onSave(field, draft); setEditing(false); }}>
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
}

function InfoItem({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function EventDetail({ eventId }: { eventId: string }) {
  const { event, loading, updateStatus, updateEvent, refetch } = useEventDetail(eventId);
  const { isSuperAdmin, canViewFinancials } = useAuth();
  const router = useRouter();
  const [quotationSponsorId, setQuotationSponsorId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-xl" />
      <div className="flex gap-2">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-9 w-20 rounded-md" />)}</div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
  if (!event) return <div className="text-center text-muted-foreground py-16">找不到這個活動</div>;

  const quarter = getFYQuarters(event.fySystem).find((q) => q.value === event.quarter);
  const statusDef = EVENT_STATUSES.find((s) => s.value === event.status);
  const dateStr = event.confirmedDate || event.tentativeDates[0];
  const dateDisplay = dateStr ? `${String(dateStr).slice(0, 10)}（${WEEKDAYS[parseLocalDate(dateStr).getDay()]}）` : "日期待定";
  const venueDisplay = event.venues.length > 0 ? event.venues.map((v) => v.name).join("、") : "場地待確認";

  function save(field: string, value: unknown) {
    updateEvent({ [field]: value });
  }

  // Missing items for next-action
  const missing: string[] = [];
  if (!event.confirmedDate) missing.push("確認日期");
  if (event.venues.length === 0) missing.push("場地");
  if (event.rundown.length === 0) missing.push("議程");
  if (event.sponsors.length === 0) missing.push("贊助商");
  if (!event.description) missing.push("描述");

  return (
    <div className="space-y-5">
      {/* === TOP: Summary Card === */}
      <Card className="ring-1 ring-foreground/10 overflow-hidden">
        {/* Key visual banner */}
        {event.keyVisualUrl && (
          <div className="h-32 bg-muted overflow-hidden">
            <img src={event.keyVisualUrl} alt="" className="w-full h-full object-cover opacity-80" />
          </div>
        )}
        <CardContent className={`${event.keyVisualUrl ? "pt-4" : "pt-5"} pb-5 px-5 space-y-4`}>
          {/* Row 1: Back + Name + Status + Actions */}
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" onClick={() => router.push("/events")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <EditableText value={event.name} field="name" onSave={save} />
              {event.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{event.subtitle}</p>}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <select className="text-xs border rounded px-1.5 py-0.5 bg-secondary" value={event.type} onChange={(e) => save("type", e.target.value)}>
                  {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select className="text-xs border rounded px-1.5 py-0.5" value={event.format} onChange={(e) => save("format", e.target.value)}>
                  {EVENT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Badge variant="outline" className={`cursor-pointer ${statusDef?.color ?? ""}`} />}>
                    {statusDef?.label ?? event.status} <ChevronDown className="ml-1 h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {EVENT_STATUSES.map((s) => (
                      <DropdownMenuItem key={s.value} onClick={() => updateStatus(s.value as EventStatus)} className={event.status === s.value ? "font-bold" : ""}>
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="outline" onClick={() => {
                const d = event.confirmedDate ? String(event.confirmedDate).slice(0, 10) : event.tentativeDates[0] ? String(event.tentativeDates[0]).slice(0, 10) : "";
                if (!d || !event.startTime || !event.endTime) { toast.error("需要日期和時間"); return; }
                downloadICS({ title: event.name, description: event.description || event.audienceDescription, startDate: d, startTime: String(event.startTime).slice(0, 5), endTime: String(event.endTime).slice(0, 5), location: venueDisplay });
              }}>
                <Download className="mr-1 h-3.5 w-3.5" />.ics
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowSummary(true)}>
                <FileText className="mr-1 h-3.5 w-3.5" />摘要
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                sessionStorage.setItem("event-hub:clone-draft", JSON.stringify({
                  fySystem: event.fySystem, year: event.year, quarter: event.quarter, name: `${event.name}（複製）`,
                  type: event.type, format: event.format, eventUrl: "", subtitle: event.subtitle,
                  description: event.description, highlights: event.highlights, expectedAttendees: event.expectedAttendees,
                  venueIds: event.venues.map((v) => v.id), tentativeDates: [], confirmedDate: "",
                  audienceKeywords: event.audienceKeywords, audienceDescription: event.audienceDescription,
                  setupTime: event.setupTime, startTime: event.startTime, endTime: event.endTime,
                  rundown: event.rundown.map((r) => ({ id: `ri_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type: r.type, durationMin: r.durationMin, speakerName: r.speakerName, speakerStatus: r.speakerStatus, note: r.note })),
                  sponsorEntries: event.sponsors.map((s) => ({ sponsorId: s.id, role: s.role, fee: s.fee ?? 0, contactName: s.contactName, contactPhone: "" })),
                  sponsorIds: event.sponsors.map((s) => s.id), serviceIds: event.services.map((s) => s.id),
                  marketingChannels: event.marketingChannels, registrationMethod: event.registrationMethod, keyVisualUrl: event.keyVisualUrl,
                }));
                router.push("/events/new"); toast.success("已複製活動資料");
              }}>
                <Copy className="mr-1 h-3.5 w-3.5" />複製
              </Button>
            </div>
          </div>

          {/* Row 2: Key metrics strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 border-t pt-4">
            <InfoItem label="活動日期">
              <span className={event.confirmedDate ? "text-green-700 dark:text-green-400 font-semibold" : "text-amber-600"}>
                {dateDisplay} {event.confirmedDate ? "✓" : "(暫定)"}
              </span>
            </InfoItem>
            <InfoItem label="場地">
              <span className={event.venues.length > 0 ? "" : "text-muted-foreground"}>{venueDisplay}</span>
            </InfoItem>
            <InfoItem label="預計人數">
              {event.expectedAttendees ? `${event.expectedAttendees} 人` : "—"}
            </InfoItem>
            <InfoItem label="季度">
              {event.year} {quarter?.label}
            </InfoItem>
            <InfoItem label="完成度">
              <div className="flex items-center gap-2">
                <Progress value={event.completionPercent} className="h-2 flex-1" />
                <span className="text-xs font-bold">{event.completionPercent}%</span>
              </div>
            </InfoItem>
          </div>

          {/* Row 3: Next action */}
          {missing.length > 0 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">待完成：</span>{missing.join(" · ")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* === TABS === */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* === TAB CONTENT === */}

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Dates & Venue */}
          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">日期與場地</h3>
              <div className="space-y-3">
                <InfoItem label="暫押日期">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {event.tentativeDates.length > 0 ? event.tentativeDates.map((d) => (
                      <span key={String(d)} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5">
                        {String(d).slice(0, 10)}（{WEEKDAYS[parseLocalDate(d).getDay()]}）
                        <button className="text-muted-foreground hover:text-destructive" onClick={() => save("tentativeDates", event.tentativeDates.filter((td) => String(td) !== String(d)))}><X className="h-3 w-3" /></button>
                      </span>
                    )) : <span className="text-muted-foreground text-xs">未選擇</span>}
                    <input type="date" className="text-xs border rounded px-2 py-1" onChange={(e) => {
                      if (e.target.value && !event.tentativeDates.map((d) => String(d).slice(0, 10)).includes(e.target.value)) { save("tentativeDates", [...event.tentativeDates, e.target.value]); e.target.value = ""; }
                    }} />
                  </div>
                </InfoItem>
                <InfoItem label="確認日期">
                  {event.confirmedDate ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-700 dark:text-green-400">{String(event.confirmedDate).slice(0, 10)} ✓</span>
                      <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => save("confirmedDate", "")}>取消確認</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">未確認</span>
                      {event.tentativeDates.map((d) => (
                        <button key={String(d)} className="text-xs text-primary hover:underline" onClick={() => save("confirmedDate", String(d).slice(0, 10))}>
                          確認 {String(d).slice(5, 10)}
                        </button>
                      ))}
                    </div>
                  )}
                </InfoItem>
                <InfoItem label="時間">
                  {event.startTime && event.endTime ? `${String(event.startTime).slice(0, 5)} ~ ${String(event.endTime).slice(0, 5)}` : "未設定"}
                  {event.setupTime && <span className="text-muted-foreground text-xs ml-2">（進場 {String(event.setupTime).slice(0, 5)}）</span>}
                </InfoItem>
                <InfoItem label="場地">
                  {event.venues.length > 0 ? event.venues.map((v) => v.name).join("、") : <span className="text-muted-foreground">待確認</span>}
                </InfoItem>
                <InfoItem label="預計人數">
                  <EditableText value={String(event.expectedAttendees || "")} field="expectedAttendees" onSave={(f, v) => save(f, parseInt(v) || 0)} />
                </InfoItem>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">活動資訊</h3>
              <div className="space-y-3">
                <InfoItem label="活動網址">
                  <EditableText value={event.eventUrl} field="eventUrl" onSave={save} />
                </InfoItem>
                <InfoItem label="報名方式">
                  {event.registrationMethod
                    ? (REGISTRATION_METHODS.find((r) => r.value === event.registrationMethod)?.label ?? event.registrationMethod)
                    : <span className="text-muted-foreground">未設定</span>}
                </InfoItem>
                <InfoItem label="報名連結">
                  <EditableText value={event.registrationUrl} field="registrationUrl" onSave={save} />
                </InfoItem>
                {event.promotionStartDate && (
                  <InfoItem label="宣傳開始日">{String(event.promotionStartDate).slice(0, 10)}</InfoItem>
                )}
                {event.highlights && (
                  <InfoItem label="活動特色"><EditableText value={event.highlights} field="highlights" onSave={save} /></InfoItem>
                )}
                {event.audienceKeywords && (
                  <InfoItem label="受眾關鍵字"><EditableText value={event.audienceKeywords} field="audienceKeywords" onSave={save} /></InfoItem>
                )}
                <InfoItem label="所需服務">
                  {event.services.length > 0
                    ? <div className="flex flex-wrap gap-1">{event.services.map((s) => <Badge key={s.id} variant="secondary" className="text-xs">{s.serviceName}</Badge>)}</div>
                    : <span className="text-muted-foreground">無</span>}
                </InfoItem>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "rundown" && (
        <RundownCard eventId={eventId} event={event} refetch={refetch} />
      )}

      {tab === "sponsors" && (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" /> 贊助與合作
            </h3>
            {event.sponsors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">無贊助商</p>
            ) : (
              <div className="space-y-3">
                {PARTNER_ROLES.map((roleInfo) => {
                  const roleSps = event.sponsors.filter((s) => s.role === roleInfo.value);
                  if (roleSps.length === 0) return null;
                  return (
                    <div key={roleInfo.value}>
                      <p className="text-xs text-muted-foreground font-medium mb-1">{roleInfo.label}</p>
                      {roleSps.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                          <div>
                            <span className="font-medium">{s.name}</span>
                            {s.contactName && <span className="text-xs text-muted-foreground ml-2">窗口：{s.contactName}</span>}
                            {s.contactPhone && <span className="text-xs text-muted-foreground ml-1">{s.contactPhone}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {canViewFinancials && s.fee ? <span className="text-green-600 font-medium">{formatNTD(s.fee)}</span> : null}
                            {isSuperAdmin && (
                              <button className="text-xs text-primary hover:underline" onClick={() => setQuotationSponsorId(s.id)}>報價單</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {canViewFinancials && event.sponsors.some((s) => s.fee) && (
                  <div className="flex items-center justify-between text-sm font-bold border-t pt-2">
                    <span>贊助收入合計</span>
                    <span className="text-green-700">{formatNTD(event.sponsors.reduce((s, sp) => s + (sp.fee ?? 0), 0))}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "marketing" && (
        <div className="space-y-6">
          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">行銷管道</h3>
              <div className="flex flex-wrap gap-1.5">
                {MARKETING_CHANNELS.map((ch) => {
                  const active = event.marketingChannels.includes(ch.value);
                  return (
                    <button key={ch.value}
                      className={`text-xs rounded-full px-3 py-1 border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-muted hover:border-primary/30"}`}
                      onClick={() => { const next = active ? event.marketingChannels.filter((c) => c !== ch.value) : [...event.marketingChannels, ch.value]; save("marketingChannels", next); }}
                    >{ch.label}</button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">活動文案</h3>
              <InfoItem label="活動描述"><EditableText value={event.description} field="description" onSave={save} multiline /></InfoItem>
              <InfoItem label="受眾描述"><EditableText value={event.audienceDescription} field="audienceDescription" onSave={save} multiline /></InfoItem>
            </CardContent>
          </Card>

          {/* Calendar invite */}
          {(event.calendarSubject || event.calendarEmails || event.calendarBody) && (
            <Card className="ring-1 ring-foreground/10">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> 行事曆邀請</h3>
                {event.calendarSubject && <InfoItem label="主旨">{event.calendarSubject}</InfoItem>}
                {event.calendarEmails && <InfoItem label="收件人"><span className="break-all">{event.calendarEmails}</span></InfoItem>}
                {event.calendarBody && <InfoItem label="內文"><p className="whitespace-pre-wrap text-muted-foreground">{event.calendarBody}</p></InfoItem>}
              </CardContent>
            </Card>
          )}

          {/* Key Visual */}
          {event.keyVisualUrl && (
            <Card className="ring-1 ring-foreground/10">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-2">主視覺</h3>
                <img src={event.keyVisualUrl} alt="主視覺" className="rounded-lg max-h-[300px] object-contain" />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "closing" && (
        <div className="space-y-6">
          {/* Post-event data */}
          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">活動成果</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoItem label="預計人數">
                  <span className="text-muted-foreground">{event.expectedAttendees || "—"} 人</span>
                </InfoItem>
                <InfoItem label="實際到場">
                  <EditableText
                    value={String(event.actualAttendees ?? "")}
                    field="actualAttendees"
                    onSave={(f, v) => save(f, v.trim() === "" ? null : parseInt(v))}
                  />
                </InfoItem>
                <InfoItem label="出席率">
                  {event.expectedAttendees && event.actualAttendees
                    ? <span className={`font-semibold ${event.actualAttendees >= event.expectedAttendees ? "text-green-600" : "text-amber-600"}`}>
                        {Math.round((event.actualAttendees / event.expectedAttendees) * 100)}%
                      </span>
                    : <span className="text-muted-foreground">—</span>}
                </InfoItem>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem label="滿意度（1~5）">
                  <EditableText
                    value={String(event.satisfactionScore ?? "")}
                    field="satisfactionScore"
                    onSave={(f, v) => save(f, v.trim() === "" ? null : parseFloat(v))}
                  />
                </InfoItem>
                <InfoItem label="結案備註">
                  <EditableText value={event.postEventNotes} field="postEventNotes" onSave={save} multiline />
                </InfoItem>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EventExpenses eventId={eventId} />
            <EventChecklist eventId={eventId} />
          </div>
        </div>
      )}

      {/* Modals */}
      {quotationSponsorId && (
        <Quotation eventId={eventId} sponsorId={quotationSponsorId} onClose={() => setQuotationSponsorId(null)} />
      )}
      {showSummary && (
        <EventSummaryPrint event={event} onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
}

/* === Rundown Card with CRUD === */
function RundownCard({ eventId, event, refetch }: { eventId: string; event: EventDetailType; refetch: () => void }) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ type: "presentation", durationMin: 30, speakerName: "", note: "" });

  async function addRundownItem() {
    const { error } = await supabase.from("event_rundown").insert({
      event_id: eventId, type: newItem.type, duration_min: newItem.durationMin,
      speaker_name: newItem.speakerName, speaker_status: "pending", note: newItem.note, sort_order: event.rundown.length,
    });
    if (!error) { setAdding(false); setNewItem({ type: "presentation", durationMin: 30, speakerName: "", note: "" }); toast.success("已新增議程"); refetch(); }
    else toast.error("新增失敗");
  }

  async function deleteRundownItem(id: string) {
    const { error } = await supabase.from("event_rundown").delete().eq("id", id);
    if (!error) { toast.success("已刪除"); refetch(); } else toast.error("刪除失敗");
  }

  return (
    <Card className="ring-1 ring-foreground/10">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mic className="h-4 w-4 text-muted-foreground" /> Rundown
            {event.startTime && event.endTime && (
              <span className="text-xs text-muted-foreground font-normal">{String(event.startTime).slice(0, 5)} ~ {String(event.endTime).slice(0, 5)}</span>
            )}
          </h3>
          <Button size="sm" variant="ghost" onClick={() => setAdding(!adding)}>
            <Plus className="mr-1 h-3.5 w-3.5" />{adding ? "取消" : "新增"}
          </Button>
        </div>

        {adding && (
          <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <select className={nativeSelectCn} value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>
                {RUNDOWN_ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <Input type="number" min={5} value={newItem.durationMin} onChange={(e) => setNewItem({ ...newItem, durationMin: parseInt(e.target.value) || 5 })} placeholder="分鐘" className="text-sm" />
              <Input value={newItem.speakerName} onChange={(e) => setNewItem({ ...newItem, speakerName: e.target.value })} placeholder="講者" className="text-sm" />
              <Button size="sm" onClick={addRundownItem}>確認</Button>
            </div>
          </div>
        )}

        {event.rundown.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground py-4 text-center">尚未排程</p>
        ) : (
          <div className="space-y-1">
            {event.rundown.map((r) => {
              const typeName = RUNDOWN_ITEM_TYPES.find((t) => t.value === r.type)?.label ?? r.type;
              return (
                <div key={r.id} className="group flex items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                  <span className="text-muted-foreground w-[50px] shrink-0 font-mono">{r.durationMin}′</span>
                  <Badge variant="secondary" className="text-xs shrink-0">{typeName}</Badge>
                  {r.speakerName && (
                    <>
                      <span className="font-medium">{r.speakerName}</span>
                      <Badge variant="outline" className="text-xs">{PERSON_STATUS_MAP[r.speakerStatus as keyof typeof PERSON_STATUS_MAP] ?? r.speakerStatus}</Badge>
                    </>
                  )}
                  {r.note && <span className="text-xs text-muted-foreground ml-auto truncate max-w-[150px]">{r.note}</span>}
                  <button className="ml-auto h-5 w-5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all" onClick={() => deleteRundownItem(r.id)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
