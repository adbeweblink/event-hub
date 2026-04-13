"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useSettings } from "@/modules/core/hooks/use-settings";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

export function Step4Audience({ draft, update }: Props) {
  const [aiLoading, setAiLoading] = useState(false);
  const { settings } = useSettings();

  async function handleAiFill() {
    if (!draft.audienceKeywords.trim() || !settings.geminiApiKey) return;
    setAiLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `根據以下關鍵字，用繁體中文寫一段 2-3 句的活動目標受眾描述（專業但簡潔）：「${draft.audienceKeywords}」。活動類型：${draft.type}。直接回傳文字，不要 JSON。` }] }],
            generationConfig: { temperature: 0.3 },
          }),
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) update("audienceDescription", text.trim());
    } catch {}
    setAiLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">目標受眾</h2>
        <p className="text-sm text-muted-foreground">打幾個關鍵字，AI 幫你寫完整描述</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">受眾關鍵字</label>
        <div className="flex gap-2">
          <Input
            value={draft.audienceKeywords}
            onChange={(e) => update("audienceKeywords", e.target.value)}
            placeholder="例：設計師 AI焦慮 中階"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAiFill}
            disabled={aiLoading || !draft.audienceKeywords.trim()}
          >
            {aiLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
            AI 補完
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">受眾描述</label>
        <Textarea
          value={draft.audienceDescription}
          onChange={(e) => update("audienceDescription", e.target.value)}
          placeholder="AI 補完後會出現在這裡，也可以自己寫"
          rows={4}
        />
      </div>
    </div>
  );
}
