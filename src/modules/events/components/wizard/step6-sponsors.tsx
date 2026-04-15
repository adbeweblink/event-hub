"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useSponsors, type SponsorRecord } from "@/modules/sponsors/hooks/use-sponsors";
import { SPONSOR_TIER_MAP } from "@/modules/sponsors/constants";
import { PARTNER_ROLES, type PartnerRole } from "../../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import { formatNTD } from "@/shared/lib/format";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

interface SponsorEntry {
  sponsorId: string;
  role: PartnerRole;
  fee: number;
  contactName: string;
  contactPhone: string;
}

export function Step6Sponsors({ draft, update }: Props) {
  const { sponsors: allSponsors } = useSponsors();
  const [entries, setEntries] = useState<SponsorEntry[]>(
    draft.sponsorEntries.length > 0
      ? draft.sponsorEntries.map((e) => ({ ...e, role: (e.role || "partner") as PartnerRole }))
      : []
  );

  useEffect(() => {
    if (draft.sponsorEntries.length > 0 && entries.length === 0) {
      setEntries(draft.sponsorEntries.map((e) => ({ ...e, role: (e.role || "partner") as PartnerRole })));
    }
  }, [draft.sponsorEntries.length]);

  function syncDraft(list: SponsorEntry[]) {
    const valid = list.filter((e) => e.sponsorId);
    update("sponsorIds", valid.map((e) => e.sponsorId));
    update("sponsorEntries", valid);
  }

  function addEntry(role: PartnerRole) {
    const next = [...entries, { sponsorId: "", role, fee: 0, contactName: "", contactPhone: "" }];
    setEntries(next);
  }

  function removeEntry(idx: number) {
    const next = entries.filter((_, i) => i !== idx);
    setEntries(next);
    syncDraft(next);
  }

  function updateEntry(idx: number, patch: Partial<SponsorEntry>) {
    const next = entries.map((e, i) => (i === idx ? { ...e, ...patch } : e));
    setEntries(next);
    syncDraft(next);
  }

  function selectSponsor(idx: number, sponsorId: string) {
    const sponsor = allSponsors.find((s) => s.id === sponsorId);
    updateEntry(idx, {
      sponsorId,
      contactName: sponsor?.contactName ?? "",
      contactPhone: sponsor?.contactPhone ?? "",
      fee: sponsor?.sponsorFee ?? 0,
    });
  }

  function availableSponsors(currentId: string) {
    const usedIds = entries.map((e) => e.sponsorId).filter((id) => id && id !== currentId);
    return allSponsors.filter((s) => !usedIds.includes(s.id));
  }

  const totalIncome = entries.reduce((s, e) => s + (e.fee || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">贊助與合作</h2>
        <p className="text-sm text-muted-foreground">設定主辦/合辦/協辦/合作夥伴/媒體協力，從贊助商資料庫選取</p>
      </div>

      {PARTNER_ROLES.map((roleInfo) => {
        const roleEntries = entries
          .map((e, idx) => ({ ...e, _idx: idx }))
          .filter((e) => e.role === roleInfo.value);

        return (
          <div key={roleInfo.value} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {roleInfo.label}
                {roleInfo.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              <Button type="button" variant="ghost" size="sm" onClick={() => addEntry(roleInfo.value)}>
                <Plus className="mr-1 h-3.5 w-3.5" />新增
              </Button>
            </div>

            {roleEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-1">
                {roleInfo.required ? "請新增至少一個" : "選填"}
              </p>
            ) : (
              <div className="space-y-2">
                {roleEntries.map((entry) => {
                  const sponsor = allSponsors.find((s) => s.id === entry.sponsorId);
                  return (
                    <div key={entry._idx} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          className={`${nativeSelectCn} flex-1`}
                          value={entry.sponsorId}
                          onChange={(e) => selectSponsor(entry._idx, e.target.value)}
                        >
                          <option value="">選擇{roleInfo.label}</option>
                          {availableSponsors(entry.sponsorId).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}{s.tier ? ` — ${SPONSOR_TIER_MAP[s.tier]}` : ""}
                            </option>
                          ))}
                        </select>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeEntry(entry._idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {entry.sponsorId && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <Input
                            type="number" min={0}
                            value={entry.fee || ""}
                            onChange={(e) => updateEntry(entry._idx, { fee: Math.max(0, parseInt(e.target.value) || 0) })}
                            placeholder="贊助金額 (NTD)"
                          />
                          <Input
                            value={entry.contactName}
                            onChange={(e) => updateEntry(entry._idx, { contactName: e.target.value })}
                            placeholder={sponsor?.contactName ? `窗口（${sponsor.contactName}）` : "聯絡窗口"}
                          />
                          <Input
                            value={entry.contactPhone}
                            onChange={(e) => updateEntry(entry._idx, { contactPhone: e.target.value })}
                            placeholder={sponsor?.contactPhone ? `電話（${sponsor.contactPhone}）` : "電話"}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {totalIncome > 0 && (
        <div className="rounded-lg border bg-green-50 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-green-700">預估贊助收入</span>
          <span className="text-lg font-bold text-green-700">{formatNTD(totalIncome)}</span>
        </div>
      )}
    </div>
  );
}
