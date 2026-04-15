"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarCheck, Sparkles, BarChart3, Users, Shield, ArrowRight, Eye, EyeOff,
} from "lucide-react";
import { useAuth } from "@/modules/core/hooks/use-auth";

const FEATURES = [
  { icon: CalendarCheck, title: "全流程管理", desc: "從企劃到結案，一站搞定" },
  { icon: BarChart3, title: "即時數據", desc: "預算追蹤、出席率、完成度" },
  { icon: Users, title: "多角色協作", desc: "PM、執行、管理者權限分層" },
  { icon: Shield, title: "安全可靠", desc: "資料加密、角色權控、稽核日誌" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const err = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      if (isSignUp) {
        setError("註冊成功！請檢查信箱確認連結。");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Hero */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Background image with CSS gradient fallback for headless screenshot */}
        <img src="/login-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/65" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo area */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <CalendarCheck className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Event Hub</h1>
                <p className="text-[11px] text-white/50 font-medium tracking-widest uppercase">Marketing Platform</p>
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                行銷活動
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  全流程管理
                </span>
              </h2>
              <p className="text-lg text-white/60 max-w-md leading-relaxed">
                從活動企劃、場地安排、講者邀約到預算控管，
                <br />
                用一個平台掌握所有環節。
              </p>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4 animate-[fadeInUp_0.7s_ease-out_both]"
                  style={{ animationDelay: `${FEATURES.indexOf(f) * 100}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                    <f.icon className="h-4.5 w-4.5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{f.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>Weblink International</span>
            <span className="w-px h-3 bg-white/10" />
            <span>Powered by Supabase</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Mobile logo (hidden on lg) */}
          <div className="md:hidden text-center space-y-3">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <CalendarCheck className="h-7 w-7" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Event Hub</h1>
              <p className="text-sm text-muted-foreground">行銷活動管理平台</p>
            </div>
          </div>

          {/* Form header */}
          <div className="hidden md:block space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {isSignUp ? "建立帳號" : "歡迎回來"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "填入資訊開始使用 Event Hub" : "登入以管理您的行銷活動"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">電子郵件</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">密碼</label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 個字元"
                  required
                  minLength={6}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`rounded-lg px-4 py-3 text-sm ${error.includes("成功") ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm font-semibold gap-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  處理中...
                </span>
              ) : (
                <>
                  {isSignUp ? "建立帳號" : "登入"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
          </div>

          {/* Quick test entry */}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-10 text-muted-foreground"
            onClick={async () => {
              setLoading(true);
              setError("");
              const err = await signIn("mark.tsao@weblink.com.tw", "Adobe123$");
              if (err) { setError(err.message); setLoading(false); }
              else router.push("/dashboard");
            }}
          >
            快速進入（測試用）
          </Button>

          <p className="text-center text-[11px] text-muted-foreground/60">
            登入即表示您同意我們的服務條款與隱私政策
          </p>
        </div>
      </div>
    </div>
  );
}
