"use client";

import { useState, useMemo, useCallback } from "react";
import type { Vendor, VendorCategory } from "@/shared/types";

// ===== Mock Data（之後換成 Supabase）=====

const INITIAL_VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "典華幸福機構",
    category: "venue",
    contactName: "陳小姐",
    contactPhone: "02-8786-8168",
    contactEmail: "events@denwell.com.tw",
    notes: "大直旗艦館，300 人以上活動首選，音響設備完善",
    rating: 4,
    createdAt: "2025-03-10",
    updatedAt: "2026-02-15",
  },
  {
    id: "v2",
    name: "老爺行旅",
    category: "venue",
    contactName: "林經理",
    contactPhone: "02-7750-0588",
    contactEmail: "mice@royal-group.com",
    notes: "南港展覽館旁，適合中型研討會 80-150 人",
    rating: 4,
    createdAt: "2025-06-01",
    updatedAt: "2026-01-20",
  },
  {
    id: "v3",
    name: "寬宏攝影",
    category: "photography",
    contactName: "張先生",
    contactPhone: "0912-345-678",
    contactEmail: "photo@kuanhong.com",
    notes: "配合多次活動，出圖速度快，有空拍機",
    rating: 5,
    createdAt: "2025-01-15",
    updatedAt: "2026-03-01",
  },
  {
    id: "v4",
    name: "樂饗餐飲",
    category: "catering",
    contactName: "王主廚",
    contactPhone: "02-2712-3456",
    contactEmail: "catering@lexiang.tw",
    notes: "buffet 和餐盒都可做，素食選項多",
    rating: 4,
    createdAt: "2025-04-20",
    updatedAt: "2026-02-28",
  },
  {
    id: "v5",
    name: "創意印刷",
    category: "printing",
    contactName: "李小姐",
    contactPhone: "02-2567-8901",
    contactEmail: "print@creative-print.tw",
    notes: "大圖輸出、背板製作、DM 印刷，急件可處理",
    rating: 3,
    createdAt: "2025-08-10",
    updatedAt: "2025-12-15",
  },
  {
    id: "v6",
    name: "串流科技",
    category: "livestream",
    contactName: "吳工程師",
    contactPhone: "0935-678-901",
    contactEmail: "live@streamtech.tw",
    notes: "YouTube + Facebook 雙平台同步直播，備有導播機",
    rating: 5,
    createdAt: "2025-09-01",
    updatedAt: "2026-03-10",
  },
  {
    id: "v7",
    name: "達美設計",
    category: "design",
    contactName: "許設計師",
    contactPhone: "0922-111-222",
    contactEmail: "design@dami.tw",
    notes: "主視覺設計、EDM 排版、社群圖卡",
    rating: 4,
    createdAt: "2025-05-15",
    updatedAt: "2026-01-05",
  },
  {
    id: "v8",
    name: "全球禮品",
    category: "gift",
    contactName: "黃業務",
    contactPhone: "02-2345-6789",
    contactEmail: "sales@globalgift.tw",
    notes: "客製化禮品、環保袋、馬克杯，MOQ 100 起",
    rating: 3,
    createdAt: "2025-07-01",
    updatedAt: "2025-11-20",
  },
];

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | "all">("all");

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.contactName.toLowerCase().includes(search.toLowerCase()) ||
        v.notes.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || v.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [vendors, search, categoryFilter]);

  const addVendor = useCallback((vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().slice(0, 10);
    setVendors((prev) => [
      {
        ...vendor,
        id: `v${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
  }, []);

  const updateVendor = useCallback((id: string, updates: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
          : v
      )
    );
  }, []);

  const deleteVendor = useCallback((id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return {
    vendors: filtered,
    totalCount: vendors.length,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    addVendor,
    updateVendor,
    deleteVendor,
  };
}
