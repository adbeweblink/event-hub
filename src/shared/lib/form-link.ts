import { supabase } from "./supabase";
import { toast } from "sonner";

type FormType = "venue" | "sponsor" | "speaker" | "service";

const TABLE_MAP: Record<FormType, string> = {
  venue: "venues",
  sponsor: "sponsors",
  speaker: "speakers",
  service: "services",
};

/**
 * Generate a public form link for external data entry.
 * Resets token + expiry (3 days), copies link to clipboard.
 */
export async function generateFormLink(type: FormType, id: string): Promise<string | null> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from(TABLE_MAP[type])
    .update({ form_token: token, form_status: "pending", form_expires_at: expiresAt })
    .eq("id", id);

  if (error) {
    toast.error("產生連結失敗");
    return null;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/form?type=${type}&token=${token}`;

  await navigator.clipboard.writeText(link);
  toast.success("表單連結已複製到剪貼簿（3 天有效）");
  return link;
}
