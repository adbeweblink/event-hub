"use client";

import { useState, useMemo, useCallback } from "react";
import type { SponsorTier, SponsorStatus } from "../constants";

export interface SponsorRecord {
  id: string;
  name: string;
  tier: SponsorTier;
  status: SponsorStatus;
  logo: string;
  website: string;
  industry: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  // === 機密欄位（僅超級管理員可見）===
  sponsorFee: number | null;      // 贊助金額（含稅 NTD）
  sponsorBenefits: string;        // 贊助權益內容
  contractNote: string;           // 合約備註
  // ===================================
  notes: string;
  pastEvents: string[];
  createdAt: string;
  updatedAt: string;
}

const INITIAL: SponsorRecord[] = [
  {
    id: "sp1",
    name: "Adobe",
    tier: "platinum",
    status: "active",
    logo: "",
    website: "https://www.adobe.com/tw/",
    industry: "軟體",
    contactName: "",
    contactTitle: "",
    contactPhone: "",
    contactEmail: "",
    sponsorFee: null,
    sponsorBenefits: "主視覺露出、講者提供、產品授權",
    contractNote: "",
    notes: "原廠合作夥伴，提供產品授權與講者資源",
    pastEvents: ["AI 快充學堂 2026", "Adobe Summit 台灣站"],
    createdAt: "2024-01-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "sp2",
    name: "Wacom",
    tier: "gold",
    status: "active",
    logo: "",
    website: "https://www.wacom.com/zh-tw",
    industry: "硬體",
    contactName: "",
    contactTitle: "",
    contactPhone: "",
    contactEmail: "",
    sponsorFee: null,
    sponsorBenefits: "繪圖板體驗區、活動禮品提供",
    contractNote: "",
    notes: "繪圖板體驗合作，多次活動提供硬體支援",
    pastEvents: ["AI 快充學堂 — Illustrator 場次"],
    createdAt: "2025-03-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "sp3",
    name: "BenQ",
    tier: "gold",
    status: "negotiating",
    logo: "",
    website: "https://www.benq.com/zh-tw",
    industry: "硬體",
    contactName: "",
    contactTitle: "",
    contactPhone: "0800-027-427",
    contactEmail: "",
    sponsorFee: null,
    sponsorBenefits: "色準螢幕展示、色彩管理沙龍",
    contractNote: "",
    notes: "色彩管理主題合作，提供專業螢幕",
    pastEvents: [],
    createdAt: "2025-09-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "sp4",
    name: "映 CG / INCG Media",
    tier: "media",
    status: "active",
    logo: "",
    website: "https://www.incgmedia.com/",
    industry: "媒體",
    contactName: "",
    contactTitle: "",
    contactPhone: "",
    contactEmail: "contact@incgmedia.com",
    sponsorFee: null,
    sponsorBenefits: "活動報導、社群曝光、場地提供",
    contractNote: "",
    notes: "CG 產業媒體，活動報導與場地合作",
    pastEvents: [],
    createdAt: "2025-10-01",
    updatedAt: "2026-04-10",
  },
];

export type SponsorFormData = Omit<SponsorRecord, "id" | "createdAt" | "updatedAt">;

export function useSponsors() {
  const [sponsors, setSponsors] = useState<SponsorRecord[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<SponsorTier | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SponsorStatus | "all">("all");

  const filtered = useMemo(() => {
    return sponsors.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.industry.toLowerCase().includes(search.toLowerCase()) ||
        s.contactName.toLowerCase().includes(search.toLowerCase()) ||
        s.notes.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === "all" || s.tier === tierFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchTier && matchStatus;
    });
  }, [sponsors, search, tierFilter, statusFilter]);

  const addSponsor = useCallback((data: SponsorFormData) => {
    const now = new Date().toISOString().slice(0, 10);
    setSponsors((prev) => [
      { ...data, id: `sp${Date.now()}`, createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }, []);

  const updateSponsor = useCallback((id: string, updates: Partial<SponsorRecord>) => {
    setSponsors((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : s
      )
    );
  }, []);

  const deleteSponsor = useCallback((id: string) => {
    setSponsors((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    sponsors: filtered,
    totalCount: sponsors.length,
    search, setSearch,
    tierFilter, setTierFilter,
    statusFilter, setStatusFilter,
    addSponsor, updateSponsor, deleteSponsor,
  };
}
