"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SPONSOR_TIERS, SPONSOR_STATUSES } from "../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import { Lock } from "lucide-react";
import type { SponsorTier, SponsorStatus } from "../constants";
import type { SponsorRecord, SponsorFormData } from "../hooks/use-sponsors";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SponsorFormData) => void;
  initial?: SponsorRecord | null;
  isSuperAdmin: boolean;
}

const EMPTY: SponsorFormData = {
  name: "",
  tier: "other",
  status: "negotiating",
  logo: "",
  website: "",
  industry: "",
  contactName: "",
  contactTitle: "",
  contactPhone: "",
  contactEmail: "",
  sponsorFee: null,
  sponsorBenefits: "",
  contractNote: "",
  notes: "",
  pastEvents: [],
};

export function SponsorFormDialog({ open, onClose, onSubmit, initial, isSuperAdmin }: Props) {
  const [form, setForm] = useState<SponsorFormData>(EMPTY);
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        tier: initial.tier,
        status: initial.status,
        logo: initial.logo,
        website: initial.website,
        industry: initial.industry,
        contactName: initial.contactName,
        contactTitle: initial.contactTitle,
        contactPhone: initial.contactPhone,
        contactEmail: initial.contactEmail,
        sponsorFee: initial.sponsorFee,
        sponsorBenefits: initial.sponsorBenefits,
        contractNote: initial.contractNote,
        notes: initial.notes,
        pastEvents: initial.pastEvents,
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    onClose();
  }

  function set<K extends keyof SponsorFormData>(key: K, value: SponsorFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯贊助商" : "新增贊助商"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Tier + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">贊助商名稱 *</label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="公司名稱"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">贊助等級</label>
              <select
                className={nativeSelectCn}
                value={form.tier}
                onChange={(e) => set("tier", e.target.value as SponsorTier)}
              >
                {SPONSOR_TIERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">合作狀態</label>
              <select
                className={nativeSelectCn}
                value={form.status}
                onChange={(e) => set("status", e.target.value as SponsorStatus)}
              >
                {SPONSOR_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Industry + Website */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">產業類別</label>
              <Input
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                placeholder="例：軟體 / 硬體 / 媒體"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">官網</label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">聯絡人</label>
              <Input
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="姓名"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">職稱</label>
              <Input
                value={form.contactTitle}
                onChange={(e) => set("contactTitle", e.target.value)}
                placeholder="行銷經理"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">電話</label>
              <Input
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="02-xxxx-xxxx"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="email@company.com"
              />
            </div>
          </div>

          {/* Sponsor Benefits */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">贊助權益內容</label>
            <Textarea
              value={form.sponsorBenefits}
              onChange={(e) => set("sponsorBenefits", e.target.value)}
              placeholder="主視覺露出、攤位、產品體驗區、講者提供..."
              rows={2}
            />
          </div>

          {/* 🔒 Confidential: Super Admin Only */}
          {isSuperAdmin && (
            <div className="space-y-3 rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <Lock className="h-4 w-4" />
                機密資訊（僅超級管理員可見）
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">贊助金額（含稅 NTD）</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.sponsorFee ?? ""}
                    onChange={(e) => set("sponsorFee", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="NT$"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">合約備註</label>
                  <Input
                    value={form.contractNote}
                    onChange={(e) => set("contractNote", e.target.value)}
                    placeholder="付款條件、合約期限..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">備註</label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="合作注意事項..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>取消</Button>
            <Button type="submit">{isEdit ? "儲存" : "新增"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
