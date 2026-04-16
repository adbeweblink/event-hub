"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { CalendarCheck, CheckCircle, AlertCircle, Clock } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type FormType = "venue" | "sponsor" | "speaker" | "service";

const TYPE_LABELS: Record<FormType, string> = {
  venue: "場地",
  sponsor: "贊助商",
  speaker: "講者",
  service: "服務商",
};

const TABLE_MAP: Record<FormType, string> = {
  venue: "venues",
  sponsor: "sponsors",
  speaker: "speakers",
  service: "services",
};

// Fields each type should show (label, db column, input type)
type Field = { label: string; col: string; type: "text" | "email" | "url" | "tel" | "number" | "textarea"; placeholder?: string; required?: boolean };

const FIELDS: Record<FormType, Field[]> = {
  venue: [
    { label: "場地名稱", col: "name", type: "text", required: true },
    { label: "地址", col: "address", type: "text", placeholder: "完整地址" },
    { label: "聯絡人", col: "contact_name", type: "text" },
    { label: "聯絡電話", col: "contact_phone", type: "tel", placeholder: "02-xxxx-xxxx" },
    { label: "聯絡 Email", col: "contact_email", type: "email" },
    { label: "網站", col: "website", type: "url", placeholder: "https://..." },
    { label: "最近捷運站", col: "nearest_mrt", type: "text" },
    { label: "停車資訊", col: "parking_info", type: "text" },
    { label: "最少容納人數", col: "capacity_min", type: "number" },
    { label: "最多容納人數", col: "capacity_max", type: "number" },
    { label: "半天費用（含稅）", col: "price_half_day", type: "number" },
    { label: "整日費用（含稅）", col: "price_full_day", type: "number" },
    { label: "最低租借時數", col: "min_rental_hours", type: "number" },
    { label: "訂金/取消政策", col: "deposit_policy", type: "text" },
    { label: "備註", col: "notes", type: "textarea", placeholder: "場地特色、注意事項..." },
  ],
  sponsor: [
    { label: "公司名稱", col: "name", type: "text", required: true },
    { label: "網站", col: "website", type: "url" },
    { label: "產業別", col: "industry", type: "text" },
    { label: "聯絡人", col: "contact_name", type: "text" },
    { label: "職稱", col: "contact_title", type: "text" },
    { label: "聯絡電話", col: "contact_phone", type: "tel" },
    { label: "聯絡 Email", col: "contact_email", type: "email" },
    { label: "備註", col: "notes", type: "textarea" },
  ],
  speaker: [
    { label: "姓名", col: "name", type: "text", required: true },
    { label: "職稱", col: "title", type: "text", placeholder: "例：資深產品經理" },
    { label: "公司/單位", col: "company", type: "text" },
    { label: "簡介", col: "bio", type: "textarea", placeholder: "個人經歷、專長領域..." },
    { label: "聯絡電話", col: "contact_phone", type: "tel" },
    { label: "聯絡 Email", col: "contact_email", type: "email" },
    { label: "備註", col: "notes", type: "textarea" },
  ],
  service: [
    { label: "服務名稱", col: "service_name", type: "text", required: true },
    { label: "描述", col: "description", type: "textarea" },
    { label: "聯絡人", col: "contact_name", type: "text" },
    { label: "聯絡電話", col: "contact_phone", type: "tel" },
    { label: "聯絡 Email", col: "contact_email", type: "email" },
    { label: "報價（NT$）", col: "price", type: "number" },
    { label: "報價說明", col: "price_note", type: "text" },
    { label: "備註", col: "notes", type: "textarea" },
  ],
};

function FormContent() {
  const params = useSearchParams();
  const type = params.get("type") as FormType | null;
  const token = params.get("token");

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const [entityName, setEntityName] = useState("");

  useEffect(() => {
    if (!type || !token || !TABLE_MAP[type]) { setLoading(false); return; }
    (async () => {
      const { data: row } = await supabase
        .from(TABLE_MAP[type])
        .select("*")
        .eq("form_token", token)
        .single();
      if (!row) { setLoading(false); return; }

      // Check expiry
      if (row.form_expires_at && new Date(row.form_expires_at) < new Date()) {
        setExpired(true);
        setLoading(false);
        return;
      }

      if (row.form_status === "submitted") {
        setSubmitted(true);
      }

      setData(row);
      setEntityName(row.name || row.service_name || "");
      setLoading(false);
    })();
  }, [type, token]);

  if (!type || !token || !TABLE_MAP[type]) {
    return <ErrorState message="無效的表單連結" />;
  }
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground">載入中...</div>;
  }
  if (!data) {
    return <ErrorState message="找不到資料，連結可能無效" />;
  }
  if (expired) {
    return <ExpiredState />;
  }

  const fields = FIELDS[type];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!type || !token) return;
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const patch: Record<string, unknown> = { form_status: "submitted" };
    for (const field of fields) {
      const val = formData.get(field.col);
      if (field.type === "number") {
        patch[field.col] = val ? Number(val) : null;
      } else {
        patch[field.col] = val || null;
      }
    }

    const { error: err } = await supabase
      .from(TABLE_MAP[type])
      .update(patch)
      .eq("form_token", token);

    if (err) {
      setError("送出失敗，請稍後再試");
      setSubmitting(false);
    } else {
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessState type={type} name={entityName} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <CalendarCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Event Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            請填寫{TYPE_LABELS[type]}資料
          </p>
          {entityName && (
            <p className="mt-2 text-lg font-semibold">{entityName}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
          {fields.map((f) => (
            <div key={f.col} className="space-y-1.5">
              <label className="text-sm font-medium">
                {f.label}
                {f.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  name={f.col}
                  defaultValue={(data[f.col] as string) ?? ""}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              ) : (
                <input
                  name={f.col}
                  type={f.type}
                  defaultValue={(data[f.col] as string | number) ?? ""}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 h-10"
                />
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "送出中..." : "送出資料"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            送出後資料將直接更新至 Event Hub 系統
          </p>
        </form>
      </div>
    </div>
  );
}

function SuccessState({ type, name }: { type: FormType; name: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">資料已送出！</h2>
        <p className="text-muted-foreground">
          感謝您填寫 <span className="font-medium text-foreground">{name}</span> 的{TYPE_LABELS[type]}資料。
          <br />系統已自動更新，無需其他操作。
        </p>
      </div>
    </div>
  );
}

function ExpiredState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold">連結已過期</h2>
        <p className="text-muted-foreground">此表單連結已超過有效期限，請聯繫活動負責人重新產生連結。</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold">{message}</h2>
        <p className="text-muted-foreground">請確認連結是否正確，或聯繫活動負責人。</p>
      </div>
    </div>
  );
}

export default function PublicFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">載入中...</div>}>
      <FormContent />
    </Suspense>
  );
}
