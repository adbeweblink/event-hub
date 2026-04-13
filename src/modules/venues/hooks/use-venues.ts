"use client";

import { useState, useMemo, useCallback } from "react";
import type { VenueType, District } from "../constants";

export interface VenueImage {
  id: string;
  url: string;
  label: string;
}

export interface VenueRecord {
  id: string;
  name: string;
  type: VenueType;
  district: District;
  address: string;
  capacityMin: number | null;  // 座位/桌型最少人數
  capacityMax: number | null;  // 站席最多人數
  priceHalfDay: number | null;   // 半天含稅 (NTD)
  priceFullDay: number | null;   // 整日含稅 (NTD)
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  nearestMRT: string;
  parkingInfo: string;
  minRentalHours: number | null;
  depositPolicy: string;
  equipment: string[];
  images: VenueImage[];
  notes: string;
  rating: number;
  pastEvents: string[];
  createdAt: string;
  updatedAt: string;
}

const INITIAL: VenueRecord[] = [
  // ===== Adobe FY26 招商簡報場地（主場地）=====
  {
    id: "ve2",
    name: "三創生活園區 12F 多元展演",
    type: "studio",
    district: "taipei",
    address: "台北市中正區市民大道三段 2 號 12 樓",
    capacityMin: 80,
    capacityMax: 200,
    priceHalfDay: null,
    priceFullDay: null,
    contactName: "場地組",
    contactPhone: "02-2349-1366",
    contactEmail: "",
    website: "https://www.syntrend.com.tw/space/venues.html",
    nearestMRT: "忠孝新生站",
    parkingInfo: "地下停車場",
    minRentalHours: 4,
    depositPolicy: "",
    equipment: ["projector", "led", "mic", "wifi", "livestream", "stage"],
    images: [
      { id: "img2", url: "https://image.u-car.com.tw/cartitleimage_73388.jpg", label: "現場照片" },
    ],
    notes: "793 平方米、挑高 4.6 米、240 坪獨立空間。平日原價 4 折、假日 5 折。適合大型軟硬體聯合發表。週一至五分上午/下午/晚上三時段。",
    rating: 4,
    pastEvents: ["Firefly 體驗日"],
    createdAt: "2025-05-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "ve3",
    name: "WESTAR",
    type: "studio",
    district: "taipei",
    address: "台北市萬華區漢中街 116 號 8 樓",
    capacityMin: 200,
    capacityMax: 1000,
    priceHalfDay: null,
    priceFullDay: null,
    contactName: "WESTAR 營運部",
    contactPhone: "02-2370-0058",
    contactEmail: "",
    website: "https://www.tremendia.com/westar/",
    nearestMRT: "西門站 6 號出口",
    parkingInfo: "無自有停車場，附近有獅子林停車場",
    minRentalHours: null,
    depositPolicy: "",
    equipment: ["led", "mic", "wifi", "livestream", "stage"],
    images: [
      { id: "img3", url: "https://resource.iyp.tw/static.iyp.tw/24856/files/8b59f37b-da82-484e-b002-2b3bb22f21bb.jpg", label: "現場照片" },
    ],
    notes: "西門捷運 6 號出口正前方，350 坪無樑柱室內空間，可容納近千人。西區唯一大坪數多媒體活動平台。潮流時尚感，社群打卡友善。價格需洽詢。",
    rating: 4,
    pastEvents: [],
    createdAt: "2025-08-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "ve4",
    name: "CORNER MAX 大角落多功能展演館",
    type: "studio",
    district: "taipei",
    address: "台北市大安區光復南路 102 號 1 樓",
    capacityMin: 400,
    capacityMax: 650,
    priceHalfDay: null,
    priceFullDay: null,
    contactName: "CORNER MAX",
    contactPhone: "",
    contactEmail: "cornermaxtw@gmail.com",
    website: "https://www.corner-house.com.tw/",
    nearestMRT: "國父紀念館站 5 號出口",
    parkingInfo: "無自有停車場",
    minRentalHours: null,
    depositPolicy: "",
    equipment: ["mic", "wifi", "stage"],
    images: [
      { id: "img4", url: "https://cc.tvbs.com.tw/img/upload/2021/11/25/20211125141058-484057b8.jpg", label: "現場照片" },
    ],
    notes: "座位 400 人、站席 650 人。捷運國父紀念館站 5 號出口步行 4 分鐘。百萬級專業燈光音響。適合技術研討會與實體工作坊。價格需洽詢。",
    rating: 4,
    pastEvents: [],
    createdAt: "2025-09-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "ve5",
    name: "NUZONE 展演空間",
    type: "studio",
    district: "taipei",
    address: "台北市大安區市民大道三段 198 號 2 樓",
    capacityMin: 300,
    capacityMax: 500,
    priceHalfDay: null,
    priceFullDay: null,
    contactName: "NUZONE",
    contactPhone: "02-2711-0339",
    contactEmail: "service@nuzone.com.tw",
    website: "https://www.nuzone.com.tw/",
    nearestMRT: "忠孝新生站",
    parkingInfo: "",
    minRentalHours: null,
    depositPolicy: "",
    equipment: ["led", "mic", "wifi", "livestream", "stage"],
    images: [
      { id: "img5", url: "https://www.popdaily.com.tw/wp-content/uploads/2019/12/45jw215tsy0404c4w8g0wc8wwq20wzf-1000x668.jpg", label: "現場照片" },
    ],
    notes: "168 坪中型展演空間。站席 500 人 / 座席 300 人。舞台 9m×4.8m。法國 L-Acoustics 演唱會規格音響 + 400 吋 LED P3 電視牆。忠孝新生站旁。價格需洽詢。",
    rating: 5,
    pastEvents: [],
    createdAt: "2025-07-01",
    updatedAt: "2026-04-10",
  },
  // ===== Adobe FY26 招商簡報場地（沙龍場地）=====
  {
    id: "ve6",
    name: "1921 共享空間",
    type: "coworking",
    district: "taipei",
    address: "台北市中山區雙城街 19 巷 21 號 8 樓",
    capacityMin: 30,
    capacityMax: 80,
    priceHalfDay: null,
    priceFullDay: null,
    contactName: "1921 前台",
    contactPhone: "",
    contactEmail: "",
    website: "https://www.1921.com.tw/",
    nearestMRT: "中山國小站",
    parkingInfo: "",
    minRentalHours: 2,
    depositPolicy: "",
    equipment: ["projector", "mic", "wifi"],
    images: [
      { id: "img6a", url: "https://www.1921.com.tw/images/1921space_img021.jpg", label: "現場照片" },
      { id: "img6b", url: "https://www.1921.com.tw/images/1921space_img022.jpg", label: "現場照片" },
      { id: "img6c", url: "https://www.1921.com.tw/images/1921space_img023.jpg", label: "現場照片" },
    ],
    notes: "中山國小站步行可達。50-80 人。適合印刷產業小型沙龍、教育課程、工作坊。有中島廚房區、投影設備、白板。明亮採光、沙發討論區。",
    rating: 3,
    pastEvents: [],
    createdAt: "2025-10-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "ve7",
    name: "映 CG 活動大廳",
    type: "coworking",
    district: "taipei",
    address: "台北市北投區中央南路二段 103 號 6 樓",
    capacityMin: null,
    capacityMax: null,
    priceHalfDay: null,
    priceFullDay: null,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    website: "https://www.incgmedia.com/",
    nearestMRT: "",
    parkingInfo: "",
    minRentalHours: null,
    depositPolicy: "",
    equipment: ["projector", "mic", "wifi"],
    images: [
      { id: "img7a", url: "https://image.yes123.com.tw/enterprise_pict/p2/16/16295249_2024419_673000.jpg", label: "現場照片" },
    ],
    notes: "動畫/影像產業活動場地。適合 motion graphics、CG 相關沙龍。詳細資訊待補。",
    rating: 3,
    pastEvents: [],
    createdAt: "2025-10-01",
    updatedAt: "2026-04-10",
  },
];

export type VenueFormData = Omit<VenueRecord, "id" | "createdAt" | "updatedAt">;

export function useVenues() {
  const [venues, setVenues] = useState<VenueRecord[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<VenueType | "all">("all");
  const [districtFilter, setDistrictFilter] = useState<District | "all">("all");
  const [capacityFilter, setCapacityFilter] = useState<number>(0);

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.address.toLowerCase().includes(search.toLowerCase()) ||
        v.notes.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || v.type === typeFilter;
      const matchDistrict = districtFilter === "all" || v.district === districtFilter;
      let matchCapacity = true;
      const cap = v.capacityMax ?? v.capacityMin;
      if (capacityFilter !== 0 && cap != null) {
        if (capacityFilter === -50) matchCapacity = cap <= 50;
        else if (capacityFilter === 50) matchCapacity = cap >= 50 && (v.capacityMin ?? cap) <= 150;
        else if (capacityFilter === 150) matchCapacity = cap >= 150 && (v.capacityMin ?? cap) <= 250;
        else if (capacityFilter === 250) matchCapacity = cap >= 250 && (v.capacityMin ?? cap) <= 350;
        else if (capacityFilter === 350) matchCapacity = cap >= 350;
      } else if (capacityFilter !== 0 && cap == null) {
        matchCapacity = false;
      }
      return matchSearch && matchType && matchDistrict && matchCapacity;
    });
  }, [venues, search, typeFilter, districtFilter, capacityFilter]);

  const addVenue = useCallback((data: VenueFormData) => {
    const now = new Date().toISOString().slice(0, 10);
    setVenues((prev) => [
      { ...data, id: `ve${Date.now()}`, createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }, []);

  const updateVenue = useCallback((id: string, updates: Partial<VenueRecord>) => {
    setVenues((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : v
      )
    );
  }, []);

  const deleteVenue = useCallback((id: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return {
    venues: filtered,
    totalCount: venues.length,
    search, setSearch,
    typeFilter, setTypeFilter,
    districtFilter, setDistrictFilter,
    capacityFilter, setCapacityFilter,
    addVenue, updateVenue, deleteVenue,
  };
}
