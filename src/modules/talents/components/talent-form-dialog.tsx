"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SPEAKER_SUB_TYPES, FEE_UNIT_OPTIONS } from "../constants";
import { StarRatingInput } from "@/shared/components/stars";
import { nativeSelectCn } from "@/shared/lib/styles";
import { Sparkles, Loader2, X } from "lucide-react";
import { useSettings } from "@/modules/core/hooks/use-settings";
import type { SpeakerSubType, FeeUnit } from "../constants";
import type { TalentRecord, TalentFormData } from "../hooks/use-talents";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TalentFormData) => void;
  initial?: TalentRecord | null;
}

const EMPTY: TalentFormData = {
  name: "",
  subType: "",
  title: "",
  company: "",
  specialties: [],
  bio: "",
  avatarUrl: "",
  fee: null,
  feeUnit: "per_event",
  contactPhone: "",
  contactEmail: "",
  socialLinks: [],
  notes: "",
  rating: 3,
};

export function TalentFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState<TalentFormData>(EMPTY);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const { settings } = useSettings();
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        subType: initial.subType,
        title: initial.title,
        company: initial.company,
        specialties: initial.specialties,
        bio: initial.bio,
        avatarUrl: initial.avatarUrl,
        fee: initial.fee,
        feeUnit: initial.feeUnit,
        contactPhone: initial.contactPhone,
        contactEmail: initial.contactEmail,
        socialLinks: initial.socialLinks,
        notes: initial.notes,
        rating: initial.rating,
      });
    } else {
      setForm(EMPTY);
    }
    setSpecialtyInput("");
    setAiError("");
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    onClose();
  }

  function set<K extends keyof TalentFormData>(key: K, value: TalentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSpecialty() {
    const tag = specialtyInput.trim();
    if (tag && !form.specialties.includes(tag)) {
      set("specialties", [...form.specialties, tag]);
    }
    setSpecialtyInput("");
  }

  function removeSpecialty(tag: string) {
    set("specialties", form.specialties.filter((s) => s !== tag));
  }

  async function handleAiFill() {
    if (!form.name.trim()) return;
    if (!settings.geminiApiKey) {
      setAiError("請先到「設定」頁面填入 Gemini API Key");
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `你是台灣活動講者資料庫助手。請搜尋「${form.name}」這位講者/KOL/專家的公開資訊，回傳 JSON：
{
  "title": "職稱/頭銜",
  "company": "公司/單位",
  "specialties": ["專長1","專長2"],
  "bio": "簡介（2-3句）",
  "contactEmail": "email（如公開）",
  "socialLinks": ["IG/LinkedIn/YouTube 連結"]
}
只回傳 JSON。查不到填空字串或空陣列。` }] }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
          }),
        }
      );
      if (!res.ok) throw new Error(`API 錯誤: ${res.status}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const result = JSON.parse(text);
      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        company: result.company || prev.company,
        specialties: result.specialties?.length ? result.specialties : prev.specialties,
        bio: result.bio || prev.bio,
        contactEmail: result.contactEmail || prev.contactEmail,
        socialLinks: result.socialLinks?.length ? result.socialLinks : prev.socialLinks,
      }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI 填入失敗");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯講者" : "新增講者"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Auto-fill */}
          <div className="flex items-end gap-2">
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-medium">姓名 *</label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="輸入講者姓名，再按 AI 補完"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAiFill}
              disabled={aiLoading || !form.name.trim()}
              className="shrink-0"
            >
              {aiLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              AI 補完
            </Button>
          </div>
          {aiError && <p className="text-sm text-destructive">{aiError}</p>}

          {/* SubType + Title + Company */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">講者分類</label>
              <select
                className={nativeSelectCn}
                value={form.subType}
                onChange={(e) => set("subType", e.target.value as SpeakerSubType)}
              >
                <option value="">未分類</option>
                {SPEAKER_SUB_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">職稱</label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="例：技術顧問"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">公司 / 單位</label>
              <Input
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="例：Adobe"
              />
            </div>
          </div>

          {/* Specialties Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">專長標籤</label>
            <div className="flex gap-2">
              <Input
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialty(); } }}
                placeholder="輸入專長後按 Enter"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addSpecialty}>新增</Button>
            </div>
            {form.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.specialties.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button type="button" onClick={() => removeSpecialty(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">簡介</label>
            <Textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="講者經歷與專業背景..."
              rows={3}
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">大頭照 URL</label>
            <Input
              value={form.avatarUrl}
              onChange={(e) => set("avatarUrl", e.target.value)}
              placeholder="https://..."
            />
            {form.avatarUrl && (
              <img src={form.avatarUrl} alt="預覽" className="h-16 w-16 rounded-full object-cover mt-1" />
            )}
          </div>

          {/* Fee */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">費用（含稅 NTD）</label>
              <Input
                type="number"
                min={0}
                value={form.fee ?? ""}
                onChange={(e) => set("fee", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="NT$"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">計費方式</label>
              <select
                className={nativeSelectCn}
                value={form.feeUnit}
                onChange={(e) => set("feeUnit", e.target.value as FeeUnit)}
              >
                {FEE_UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">電話</label>
              <Input
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="0912-xxx-xxx"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">評分</label>
            <StarRatingInput value={form.rating} onChange={(v) => set("rating", v)} />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">備註</label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="配合注意事項..."
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
