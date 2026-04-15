"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import { useAuth } from "../hooks/use-auth";
import { useSettings } from "../hooks/use-settings";

interface SettingField {
  key: string;
  settingsKey: string; // maps to AppSettings field
  label: string;
  placeholder: string;
  local?: boolean; // true = localStorage only
  adminOnly?: boolean;
}

const SETTING_FIELDS: SettingField[] = [
  { key: "company_name", settingsKey: "companyName", label: "公司名稱", placeholder: "展碁國際股份有限公司" },
  { key: "company_name_en", settingsKey: "companyNameEn", label: "公司英文名稱", placeholder: "Weblink International Inc." },
  { key: "company_tax_id", settingsKey: "companyTaxId", label: "統一編號", placeholder: "12345678" },
  { key: "default_fy_system", settingsKey: "defaultFySystem", label: "預設會計年度", placeholder: "adobe 或 weblink" },
  { key: "notification_email", settingsKey: "notificationEmail", label: "通知信箱", placeholder: "team@company.com" },
  { key: "gemini_api_key", settingsKey: "geminiApiKey", label: "Gemini API Key", placeholder: "AIza...", local: true, adminOnly: true },
];

export function SettingsPage() {
  const { user, isSuperAdmin } = useAuth();
  const { settings, update: updateSettings, loaded } = useSettings();
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);

    // Save DB fields
    const dbFields = SETTING_FIELDS.filter((f) => !f.local);
    const upserts = dbFields
      .map((f) => ({ user_id: user.id, key: f.key, value: (settings as any)[f.settingsKey] ?? "" }))
      .filter((u) => u.value.trim() !== "");

    if (upserts.length > 0) {
      const { error } = await supabase.from("settings").upsert(upserts, { onConflict: "user_id,key" });
      if (error) {
        toast.error("儲存失敗");
        setSaving(false);
        return;
      }
    }

    // Save local fields (geminiApiKey already persisted by updateSettings)
    toast.success("設定已儲存");
    setSaving(false);
  }, [user, settings]);

  const visibleFields = SETTING_FIELDS.filter((f) => !f.adminOnly || isSuperAdmin);

  if (!loaded) return <div className="text-center text-muted-foreground py-16">載入中...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="text-sm text-muted-foreground">平台與帳號設定</p>
      </div>

      <Card className="ring-1 ring-foreground/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">平台設定</CardTitle>
          <CardDescription>報價單與匯出會使用這些資訊</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleFields.map((field) => (
            <div key={field.key} className="grid grid-cols-1 gap-1.5 sm:grid-cols-[180px_1fr] sm:items-center">
              <label className="text-sm font-medium">{field.label}</label>
              <Input
                type={field.key.includes("api_key") ? "password" : "text"}
                placeholder={field.placeholder}
                value={(settings as any)[field.settingsKey] ?? ""}
                onChange={(e) => updateSettings({ [field.settingsKey]: e.target.value } as any)}
              />
            </div>
          ))}
          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? "儲存中..." : "儲存設定"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="ring-1 ring-foreground/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">帳號資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-[100px]">電子郵件</span>
            <span className="font-medium">{user?.email ?? ""}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-[100px]">角色</span>
            <span className="font-medium">{isSuperAdmin ? "超級管理員" : "一般使用者"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-[100px]">User ID</span>
            <span className="font-mono text-xs text-muted-foreground">{user?.id ?? ""}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
