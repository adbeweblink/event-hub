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

// 品牌 logo：優先用 Wikipedia/官方高清圖，fallback 用 Google Favicon
const BRAND_LOGOS: Record<string, string> = {
  "adobe.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_logo.svg/200px-Adobe_Corporate_logo.svg.png",
  "microsoft.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png",
  "intel.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png",
  "amd.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/200px-AMD_Logo.svg.png",
  "nvidia.com": "https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png",
  "wacom.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Wacom_logo.svg/200px-Wacom_logo.svg.png",
  "logitech.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logitech_logo.svg/200px-Logitech_logo.svg.png",
  "asus.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/200px-ASUS_Logo.svg.png",
  "msi.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/MSI_Logo.svg/200px-MSI_Logo.svg.png",
  "lenovo.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Lenovo_logo_2015.svg/200px-Lenovo_logo_2015.svg.png",
  "gigabyte.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Gigabyte_Technology_logo_20080107.svg/200px-Gigabyte_Technology_logo_20080107.svg.png",
  "apple.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/100px-Apple_logo_black.svg.png",
  "benq.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/BenQ_Logo.svg/200px-BenQ_Logo.svg.png",
  "lg.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_symbol.svg/200px-LG_symbol.svg.png",
  "sony.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/200px-Sony_logo.svg.png",
  "pantone.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Pantone_logo.svg/200px-Pantone_logo.svg.png",
  "qnap.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/QNAP_Logo.svg/200px-QNAP_Logo.svg.png",
};

function logo(domain: string) {
  return BRAND_LOGOS[domain] || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function sp(id: string, name: string, tier: SponsorTier, status: SponsorStatus, domain: string, industry: string, benefits: string, notes: string = "", pastEvents: string[] = []): SponsorRecord {
  return {
    id, name, tier, status,
    logo: domain ? logo(domain) : "",
    website: domain ? `https://${domain}` : "",
    industry,
    contactName: "", contactTitle: "", contactPhone: "", contactEmail: "",
    sponsorFee: null, sponsorBenefits: benefits, contractNote: "",
    notes, pastEvents,
    createdAt: "2025-01-01", updatedAt: "2026-04-10",
  };
}

const INITIAL: SponsorRecord[] = [
  // ===== 核心夥伴 =====
  sp("sp1", "Adobe", "platinum", "active", "adobe.com", "軟體", "主視覺露出、講者提供、產品授權", "原廠合作夥伴", ["AI 快充學堂 2026"]),
  sp("sp2", "Microsoft", "platinum", "active", "microsoft.com", "軟體", "雲端服務、Copilot 展示", ""),
  // ===== 硬體 =====
  sp("sp3", "Intel", "gold", "active", "intel.com", "CPU", "效能展示、聯合行銷"),
  sp("sp4", "AMD", "gold", "negotiating", "amd.com", "CPU", "效能展示"),
  sp("sp5", "NVIDIA", "gold", "active", "nvidia.com", "GPU", "GPU 加速展示、AI 算力"),
  sp("sp6", "Wacom", "gold", "active", "wacom.com", "周邊", "繪圖板體驗區、活動禮品", "", ["AI 快充學堂 — Illustrator"]),
  sp("sp7", "Logitech", "silver", "negotiating", "logitech.com", "周邊", "周邊設備體驗"),
  // ===== 工作站 =====
  sp("sp8", "ASUS ProArt", "gold", "active", "asus.com", "工作站", "ProArt 工作站展示"),
  sp("sp9", "MSI", "silver", "active", "msi.com", "工作站", "創作者筆電展示"),
  sp("sp10", "Lenovo", "silver", "negotiating", "lenovo.com", "工作站", "ThinkPad 工作站"),
  sp("sp11", "GIGABYTE", "silver", "negotiating", "gigabyte.com", "工作站", "AERO 創作者筆電"),
  sp("sp12", "Apple", "gold", "active", "apple.com", "工作站", "Mac 生態系展示"),
  // ===== 螢幕/色彩 =====
  sp("sp13", "BenQ", "gold", "negotiating", "benq.com", "螢幕", "色準螢幕展示、色彩管理沙龍"),
  sp("sp14", "LG", "silver", "negotiating", "lg.com", "螢幕", "UltraFine 螢幕"),
  sp("sp15", "Sony", "silver", "negotiating", "sony.com", "螢幕/相機", "專業顯示器"),
  sp("sp16", "Pantone", "silver", "active", "pantone.com", "色彩", "色彩趨勢分享"),
  // ===== 儲存 =====
  sp("sp17", "SanDisk Pro", "silver", "active", "westerndigital.com", "儲存", "高速儲存展示"),
  sp("sp18", "QNAP", "silver", "active", "qnap.com", "NAS", "NAS 創作者方案"),
  // ===== 媒體 =====
  sp("sp19", "映 CG / INCG Media", "media", "active", "incgmedia.com", "媒體", "活動報導、社群曝光、場地提供"),
  // ===== 其他 =====
  sp("sp20", "華康 DynaFont", "reciprocal", "active", "dynacw.com.tw", "字型", "字型授權、字型設計沙龍"),
  sp("sp21", "Reallusion", "reciprocal", "active", "reallusion.com", "3D/動畫", "iClone/Character Creator 展示"),
  sp("sp22", "Leadtek 麗臺", "silver", "active", "leadtek.com", "GPU", "專業繪圖卡展示"),
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
