"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "../hooks/use-settings";
import { Eye, EyeOff, Save, Check } from "lucide-react";

export function SettingsPage() {
  const { settings, update, loaded } = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync draft when settings load
  if (loaded && draft === "" && settings.geminiApiKey) {
    setDraft(settings.geminiApiKey);
  }

  function handleSave() {
    update({ geminiApiKey: draft.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="text-sm text-muted-foreground">管理平台設定與 API 金鑰</p>
      </div>

      <Card className="ring-1 ring-foreground/10 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">AI 服務設定</CardTitle>
          <CardDescription>
            設定 Google Gemini API Key，用於場地 AI 補完等功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Gemini API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="AIzaSy..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSave} disabled={saved}>
                {saved ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    已儲存
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" />
                    儲存
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              金鑰儲存在瀏覽器 localStorage，不會上傳到伺服器。
              可到{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
              {" "}取得金鑰。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
