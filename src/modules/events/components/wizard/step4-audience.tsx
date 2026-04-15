"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useSettings } from "@/modules/core/hooks/use-settings";
import type { EventDraft } from "../../hooks/use-event-wizard";
import { EVENT_TYPE_MAP } from "../../constants";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

export function Step4Audience({ draft, update }: Props) {
  const [aiLoading, setAiLoading] = useState(false);
  const { settings } = useSettings();

  async function handleAiFill() {
    if (!settings.geminiApiKey) {
      toast.error("請先到「設定」頁面填入 Gemini API Key");
      return;
    }
    setAiLoading(true);
    try {
      const context = [
        draft.name && `活動名稱：${draft.name}`,
        `活動類型：${EVENT_TYPE_MAP[draft.type]}`,
        draft.audienceKeywords && `受眾關鍵字：${draft.audienceKeywords}`,
        draft.expectedAttendees && `預計人數：${draft.expectedAttendees}`,
      ].filter(Boolean).join("\n");

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `你是行銷活動文案助手。根據以下資訊，用繁體中文產生活動文案，回傳 JSON：
${context}

{
  "name": "正式活動名稱（如果暫定名稱不好可以建議新的）",
  "subtitle": "副標題（一句話）",
  "description": "活動描述（2-3句）",
  "highlights": "活動特色（2-3個亮點，用頓號分隔）",
  "audienceDescription": "目標受眾描述（1-2句）"
}
只回傳 JSON。` }] }],
            generationConfig: { temperature: 0.5, responseMimeType: "application/json" },
          }),
        }
      );
      const data = await res.json();
      if (data.error || !data.candidates?.length) {
        throw new Error(data.error?.message || "AI 未回傳有效結果");
      }
      const text = data.candidates[0]?.content?.parts?.[0]?.text ?? "{}";
      const result = JSON.parse(text);
      if (result.name && !draft.name) update("name", result.name);
      if (result.subtitle) update("subtitle", result.subtitle);
      if (result.description) update("description", result.description);
      if (result.highlights) update("highlights", result.highlights);
      if (result.audienceDescription) update("audienceDescription", result.audienceDescription);
    } catch (err) {
      toast.error("AI 產生失敗：" + (err instanceof Error ? err.message : "未知錯誤"));
    }
    setAiLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">受眾與文案</h2>
          <p className="text-sm text-muted-foreground">填關鍵字，AI 一次產生所有文案</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAiFill}
          disabled={aiLoading}
        >
          {aiLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
          AI 產生全部
        </Button>
      </div>

      {/* Event name (can be updated by AI) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">活動標題</label>
          <Input
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="正式活動名稱"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">副標題</label>
          <Input
            value={draft.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            placeholder="一句話描述"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">活動描述</label>
        <Textarea
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="活動內容描述（2-3 句）"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">活動特色</label>
        <Input
          value={draft.highlights}
          onChange={(e) => update("highlights", e.target.value)}
          placeholder="例：業界大師親授、實作工作坊、免費體驗 Adobe AI"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">受眾關鍵字</label>
        <Input
          value={draft.audienceKeywords}
          onChange={(e) => update("audienceKeywords", e.target.value)}
          placeholder="例：設計師 AI焦慮 中階"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">受眾描述</label>
        <Textarea
          value={draft.audienceDescription}
          onChange={(e) => update("audienceDescription", e.target.value)}
          placeholder="AI 產生後會出現在這裡，也可以自己改"
          rows={3}
        />
      </div>
    </div>
  );
}
