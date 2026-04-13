"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { MARKETING_CHANNELS, REGISTRATION_METHODS } from "../../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

export function Step6Marketing({ draft, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleChannel(value: string) {
    const current = draft.marketingChannels;
    if (current.includes(value)) {
      update("marketingChannels", current.filter((c) => c !== value));
    } else {
      update("marketingChannels", [...current, value]);
    }
  }

  function handleUpload(files: FileList | null) {
    if (!files?.[0]) return;
    const url = URL.createObjectURL(files[0]);
    update("keyVisualUrl", url);
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
        <h2 className="text-lg font-bold">行銷宣傳</h2>
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
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">點擊上傳主視覺</p>
            <p className="text-xs text-muted-foreground/60">建議尺寸 1920 × 1080</p>
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
    </div>
  );
}
