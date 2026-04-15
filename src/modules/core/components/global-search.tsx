"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Truck, Handshake, Users } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";

interface SearchResult {
  id: string;
  type: "event" | "vendor" | "sponsor" | "talent";
  label: string;
  sub: string;
  href: string;
}

const TYPE_META = {
  event: { icon: Calendar, label: "活動" },
  vendor: { icon: Truck, label: "廠商" },
  sponsor: { icon: Handshake, label: "贊助商" },
  talent: { icon: Users, label: "講者" },
} as const;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K to open
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Search on query change
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const q = `%${query.trim()}%`;
      const [evts, vendors, sponsors, talents] = await Promise.all([
        supabase.from("events").select("id, name, status").ilike("name", q).limit(5),
        supabase.from("vendors").select("id, name, category").ilike("name", q).limit(5),
        supabase.from("sponsors").select("id, name, tier").ilike("name", q).limit(5),
        supabase.from("speakers").select("id, name, title").ilike("name", q).limit(5),
      ]);
      if (cancelled) return;
      const items: SearchResult[] = [
        ...(evts.data ?? []).map((e: any) => ({ id: e.id, type: "event" as const, label: e.name, sub: e.status, href: `/events/${e.id}` })),
        ...(vendors.data ?? []).map((v: any) => ({ id: v.id, type: "vendor" as const, label: v.name, sub: v.category, href: "/vendors" })),
        ...(sponsors.data ?? []).map((s: any) => ({ id: s.id, type: "sponsor" as const, label: s.name, sub: s.tier, href: "/sponsors" })),
        ...(talents.data ?? []).map((t: any) => ({ id: t.id, type: "talent" as const, label: t.name, sub: t.title ?? "", href: "/talents" })),
      ];
      setResults(items);
      setSelectedIdx(0);
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  const navigate = useCallback((result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }, [router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[selectedIdx]) { navigate(results[selectedIdx]); }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">搜尋...</span>
        <kbd className="hidden sm:inline-flex items-center rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜尋活動、廠商、贊助商、講者..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm"
              autoFocus
            />
          </div>
          {results.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto p-1.5">
              {results.map((r, i) => {
                const meta = TYPE_META[r.type];
                const Icon = meta.icon;
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => navigate(r)}
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      i === selectedIdx ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{meta.label} · {r.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              找不到「{query}」相關結果
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
