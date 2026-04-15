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
import { VENUE_TYPES, DISTRICTS, VENUE_EQUIPMENT_OPTIONS } from "../constants";
import { StarRatingInput } from "@/shared/components/stars";
import { ImageUpload, type ImageItem } from "@/shared/components/image-upload";
import { nativeSelectCn } from "@/shared/lib/styles";
import { aiAutoFillVenue } from "@/shared/lib/gemini";
import { useSettings } from "@/modules/core/hooks/use-settings";
import { useVendors } from "@/modules/vendors/hooks/use-vendors";
import { Sparkles, Loader2 } from "lucide-react";
import type { VenueType, District } from "../constants";
import type { VenueRecord, VenueFormData } from "../hooks/use-venues";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VenueFormData) => void;
  initial?: VenueRecord | null;
}

const EMPTY: VenueFormData = {
  name: "",
  type: "other",
  district: "taipei",
  address: "",
  capacityMin: null,
  capacityMax: null,
  priceHalfDay: null,
  priceFullDay: null,
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  website: "",
  nearestMRT: "",
  parkingInfo: "",
  minRentalHours: null,
  depositPolicy: "",
  equipment: [],
  images: [],
  notes: "",
  rating: 3,
  vendorId: null,
};

export function VenueFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState<VenueFormData>(EMPTY);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const { settings } = useSettings();
  const { vendors } = useVendors();
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        type: initial.type,
        district: initial.district,
        address: initial.address,
        capacityMin: initial.capacityMin,
        capacityMax: initial.capacityMax,
        priceHalfDay: initial.priceHalfDay,
        priceFullDay: initial.priceFullDay,
        contactName: initial.contactName,
        contactPhone: initial.contactPhone,
        contactEmail: initial.contactEmail,
        website: initial.website,
        nearestMRT: initial.nearestMRT,
        parkingInfo: initial.parkingInfo,
        minRentalHours: initial.minRentalHours,
        depositPolicy: initial.depositPolicy,
        equipment: initial.equipment,
        images: initial.images,
        notes: initial.notes,
        rating: initial.rating,
        vendorId: initial.vendorId,
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

  function set<K extends keyof VenueFormData>(key: K, value: VenueFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      const result = await aiAutoFillVenue(form.name, settings.geminiApiKey);
      setForm((prev) => ({
        ...prev,
        address: result.address || prev.address,
        district: (result.district as District) || prev.district,
        capacityMin: result.capacityMin ?? prev.capacityMin,
        capacityMax: result.capacityMax ?? prev.capacityMax,
        priceHalfDay: result.priceHalfDay ?? prev.priceHalfDay,
        priceFullDay: result.priceFullDay ?? prev.priceFullDay,
        contactPhone: result.contactPhone || prev.contactPhone,
        contactEmail: result.contactEmail || prev.contactEmail,
        website: result.website || prev.website,
        nearestMRT: result.nearestMRT || prev.nearestMRT,
        parkingInfo: result.parkingInfo || prev.parkingInfo,
        minRentalHours: result.minRentalHours ?? prev.minRentalHours,
        depositPolicy: result.depositPolicy || prev.depositPolicy,
        equipment: result.equipment?.length ? result.equipment : prev.equipment,
        notes: result.notes || prev.notes,
        type: (result.venueType as VenueType) || prev.type,
      }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI 填入失敗");
    } finally {
      setAiLoading(false);
    }
  }

  function toggleEquipment(key: string) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(key)
        ? prev.equipment.filter((k) => k !== key)
        : [...prev.equipment, key],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯場地" : "新增場地"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Auto-fill */}
          <div className="flex items-end gap-2">
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-medium">場地名稱 *</label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="輸入場地名稱，再按 AI 補完"
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
          {aiError && (
            <p className="text-sm text-destructive">{aiError}</p>
          )}

          {/* Type + District */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">場地類型</label>
              <select
                className={nativeSelectCn}
                value={form.type}
                onChange={(e) => set("type", e.target.value as VenueType)}
              >
                {VENUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">地區</label>
              <select
                className={nativeSelectCn}
                value={form.district}
                onChange={(e) => set("district", e.target.value as District)}
              >
                {DISTRICTS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">地址</label>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="完整地址"
            />
          </div>

          {/* Capacity + Pricing */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">最少人數</label>
              <Input
                type="number"
                min={0}
                value={form.capacityMin ?? ""}
                onChange={(e) => set("capacityMin", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="座位"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">最多人數</label>
              <Input
                type="number"
                min={0}
                value={form.capacityMax ?? ""}
                onChange={(e) => set("capacityMax", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="站席"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">半天費用（含稅）</label>
              <Input
                type="number"
                min={0}
                value={form.priceHalfDay ?? ""}
                onChange={(e) => set("priceHalfDay", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="NT$"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">整日費用（含稅）</label>
              <Input
                type="number"
                min={0}
                value={form.priceFullDay ?? ""}
                onChange={(e) => set("priceFullDay", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="NT$"
              />
            </div>
          </div>

          {/* Tax conversion helper */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">快速換算：</span>
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                if (form.priceHalfDay != null)
                  set("priceHalfDay", Math.round(form.priceHalfDay * 1.05));
                if (form.priceFullDay != null)
                  set("priceFullDay", Math.round(form.priceFullDay * 1.05));
              }}
            >
              未稅 → 含稅（×1.05）
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                if (form.priceHalfDay != null)
                  set("priceHalfDay", Math.round(form.priceHalfDay / 1.05));
                if (form.priceFullDay != null)
                  set("priceFullDay", Math.round(form.priceFullDay / 1.05));
              }}
            >
              含稅 → 未稅（÷1.05）
            </button>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">聯絡人</label>
              <Input
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="姓名"
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
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">場館網址</label>
            <Input
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Transport + Policy */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">最近捷運站</label>
              <Input
                value={form.nearestMRT}
                onChange={(e) => set("nearestMRT", e.target.value)}
                placeholder="例：忠孝新生站"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">停車資訊</label>
              <Input
                value={form.parkingInfo}
                onChange={(e) => set("parkingInfo", e.target.value)}
                placeholder="自有停車場 / 附近停車場"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">最低租借時數</label>
              <Input
                type="number"
                min={0}
                value={form.minRentalHours ?? ""}
                onChange={(e) => set("minRentalHours", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="小時"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">訂金 / 取消政策</label>
            <Input
              value={form.depositPolicy}
              onChange={(e) => set("depositPolicy", e.target.value)}
              placeholder="例：簽約付 50% 訂金，活動前 14 天取消退 50%"
            />
          </div>

          {/* Equipment Checkboxes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">場地設備</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {VENUE_EQUIPMENT_OPTIONS.map((eq) => (
                <label
                  key={eq.key}
                  className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary/30"
                >
                  <input
                    type="checkbox"
                    checked={form.equipment.includes(eq.key)}
                    onChange={() => toggleEquipment(eq.key)}
                    className="accent-primary"
                  />
                  {eq.label}
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">場地照片（平面圖 / 現場照片）</label>
            <ImageUpload
              images={form.images.map((img) => ({ ...img, file: undefined }))}
              onChange={(items) =>
                set(
                  "images",
                  items.map((i) => ({ id: i.id, url: i.url, label: i.label }))
                )
              }
              maxImages={8}
            />
          </div>

          {/* Vendor Link */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">關聯廠商</label>
            <select
              className={nativeSelectCn}
              value={form.vendorId ?? ""}
              onChange={(e) => set("vendorId", e.target.value || null)}
            >
              <option value="">不關聯</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
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
              placeholder="場地特色、注意事項、過往經驗..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">{isEdit ? "儲存" : "新增"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
