"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MARKETING_CHANNELS, REGISTRATION_METHODS } from "../../constants";
import { useServices } from "@/modules/expenses/hooks/use-expenses";
import { EXPENSE_CATEGORY_MAP } from "@/modules/expenses/constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import { uploadToStorage } from "@/shared/lib/storage";
import { formatNTD } from "@/shared/lib/format";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

export function Step7Marketing({ draft, update }: Props) {
  const { services: allServices } = useServices();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function toggleService(id: string) {
    const current = draft.serviceIds;
    if (current.includes(id)) {
      update("serviceIds", current.filter((s) => s !== id));
      update("serviceEntries", draft.serviceEntries.filter((e) => e.serviceId !== id));
    } else {
      update("serviceIds", [...current, id]);
      const svc = allServices.find((s) => s.id === id);
      update("serviceEntries", [...draft.serviceEntries, { serviceId: id, fee: svc?.price ?? 0 }]);
    }
  }

  function updateServiceFee(serviceId: string, fee: number) {
    update("serviceEntries", draft.serviceEntries.map((e) => e.serviceId === serviceId ? { ...e, fee } : e));
  }

  function toggleChannel(value: string) {
    const current = draft.marketingChannels;
    if (current.includes(value)) {
      update("marketingChannels", current.filter((c) => c !== value));
    } else {
      update("marketingChannels", [...current, value]);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    const url = await uploadToStorage("event-images", files[0]);
    setUploading(false);
    if (url) {
      update("keyVisualUrl", url);
    } else {
      toast.error("圖片上傳失敗");
    }
  }

  // Countdown calc
  const firstDate = draft.tentativeDates[0] || draft.confirmedDate;
  let countdown: number | null = null;
  let promoCountdown: number | null = null;
  if (firstDate) {
    const eventDate = new Date(firstDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    countdown = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  if (draft.promotionStartDate) {
    const promoDate = new Date(draft.promotionStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    promoCountdown = Math.ceil((promoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Default promo date = 50 days before event
  function setDefaultPromoDate() {
    if (firstDate) {
      const d = new Date(firstDate);
      d.setDate(d.getDate() - 50);
      update("promotionStartDate", d.toISOString().slice(0, 10));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">行銷宣傳 × 所需服務</h2>
        <p className="text-sm text-muted-foreground">可以全部跳過，之後再補</p>
      </div>

      {/* Key Visual Upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">主視覺（1920 × 1080）</label>
        {draft.keyVisualUrl ? (
          <div className="relative inline-block">
            <img
              src={draft.keyVisualUrl}
              alt="主視覺"
              className="max-h-48 rounded-lg border object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={() => update("keyVisualUrl", "")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 py-8 cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
            onClick={() => !uploading && fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
                <p className="text-sm text-muted-foreground">上傳中...</p>
              </>
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">點擊上傳主視覺</p>
                <p className="text-xs text-muted-foreground/60">建議尺寸 1920 × 1080</p>
              </>
            )}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Channels */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">宣傳管道</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {MARKETING_CHANNELS.map((ch) => {
            const selected = draft.marketingChannels.includes(ch.value);
            return (
              <button
                key={ch.value}
                type="button"
                onClick={() => toggleChannel(ch.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Registration method */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-sm font-medium">報名方式</label>
        <select
          className={nativeSelectCn}
          value={draft.registrationMethod}
          onChange={(e) => update("registrationMethod", e.target.value)}
        >
          <option value="">尚未決定</option>
          {REGISTRATION_METHODS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Promotion start date + countdown */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">預計開始宣傳日</label>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={draft.promotionStartDate}
            onChange={(e) => update("promotionStartDate", e.target.value)}
            className="max-w-xs"
          />
          {firstDate && !draft.promotionStartDate && (
            <Button type="button" variant="outline" size="sm" onClick={setDefaultPromoDate}>
              自動設定（活動前 50 天）
            </Button>
          )}
        </div>
        {/* Countdowns */}
        {(countdown !== null || promoCountdown !== null) && (
          <div className="flex gap-4 mt-2">
            {countdown !== null && (
              <span className={`text-sm font-medium ${countdown <= 14 ? "text-destructive" : countdown <= 30 ? "text-amber-600" : "text-muted-foreground"}`}>
                活動倒數 {countdown} 天
              </span>
            )}
            {promoCountdown !== null && (
              <span className={`text-sm font-medium ${promoCountdown <= 0 ? "text-destructive" : promoCountdown <= 7 ? "text-amber-600" : "text-muted-foreground"}`}>
                {promoCountdown <= 0 ? "應該開始宣傳了！" : `距宣傳開始 ${promoCountdown} 天`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Services needed */}
      <div className="space-y-3 border-t pt-6">
        <label className="text-sm font-medium">這場活動需要的其他服務</label>
        <p className="text-xs text-muted-foreground">勾選後，費用會記在活動費用清單裡</p>
        {allServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">尚無服務項目，請先到「其他服務」建檔</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {allServices.map((svc) => {
              const selected = draft.serviceIds.includes(svc.id);
              return (
                <div key={svc.id} className={`rounded-lg border text-sm transition-colors ${selected ? "border-primary bg-primary/5" : "border-border"}`}>
                  <button
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className="flex items-center gap-3 px-4 py-3 text-left w-full hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{svc.serviceName}</div>
                      <div className="text-xs text-muted-foreground">
                        {EXPENSE_CATEGORY_MAP[svc.category]} · {svc.vendorName || "未綁定廠商"}
                        {svc.price > 0 && ` · 參考 ${formatNTD(svc.price)}`}
                        {svc.priceNote && ` (${svc.priceNote})`}
                      </div>
                    </div>
                    {selected && <Badge variant="secondary" className="text-xs shrink-0">已選</Badge>}
                  </button>
                  {selected && (
                    <div className="px-4 pb-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground shrink-0">本次報價</span>
                      <Input
                        type="number" min={0}
                        className="h-8 text-sm w-32"
                        value={draft.serviceEntries.find((e) => e.serviceId === svc.id)?.fee || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateServiceFee(svc.id, parseInt(e.target.value) || 0)}
                        placeholder="NTD"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {draft.serviceIds.length > 0 && (() => {
          const totalCost = draft.serviceEntries.reduce((sum, e) => sum + (e.fee || 0), 0);
          return (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">已選 {draft.serviceIds.length} 項服務</span>
              {totalCost > 0 && <span className="font-medium">預估費用 {formatNTD(totalCost)}</span>}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
