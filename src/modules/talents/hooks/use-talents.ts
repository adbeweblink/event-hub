"use client";

import { useState, useMemo, useCallback } from "react";
import type { TalentType, SpeakerSubType, FeeUnit } from "../constants";

export interface TalentRecord {
  id: string;
  name: string;
  type: TalentType;
  subType: SpeakerSubType; // 講者子分類（僅 type=speaker 時有效）
  title: string;          // 職稱 / 頭銜
  company: string;        // 公司 / 單位
  specialties: string[];  // 專長標籤
  bio: string;            // 簡介
  avatarUrl: string;      // 大頭照
  fee: number | null;     // 費用
  feeUnit: FeeUnit;       // 費用單位
  contactPhone: string;
  contactEmail: string;
  socialLinks: string[];   // IG / LinkedIn / YouTube 等
  notes: string;
  rating: number;
  pastEvents: string[];
  createdAt: string;
  updatedAt: string;
}

// helper to build talent records concisely
function t(id: string, name: string, type: TalentType, subType: SpeakerSubType, title: string, company: string, specialties: string[], avatarUrl: string, bio: string = "", notes: string = "", pastEvents: string[] = []): TalentRecord {
  const isInternal = subType === "internal";
  return { id, name, type, subType, title, company, specialties, bio, avatarUrl, fee: isInternal ? null : 5000, feeUnit: isInternal ? "per_event" : "per_hour", contactPhone: "", contactEmail: "", socialLinks: [], notes, rating: 4, pastEvents, createdAt: "2025-01-01", updatedAt: "2026-04-10" };
}

const INITIAL: TalentRecord[] = [
  // ===== 內部講師 =====
  { id: "t1", name: "Mark", type: "speaker", subType: "internal", title: "專案經理", company: "展碁國際",
    specialties: ["Photoshop", "Claude Code", "AI 工作流", "Adobe Express"],
    bio: "Adobe 產品專家，擅長將 AI 工具融入設計與開發工作流。多次主持 Adobe 快充學堂系列活動。",
    avatarUrl: "/speakers/mark.jpg", fee: null, feeUnit: "per_event", contactPhone: "", contactEmail: "",
    socialLinks: [], notes: "內部講師，不需外部費用", rating: 5,
    pastEvents: ["AI 快充學堂 — Photoshop AI 實戰", "AI 快充學堂 — Claude Code 開發", "AI 快充學堂 — Adobe Express"],
    createdAt: "2025-01-01", updatedAt: "2026-04-10" },
  // ===== Adobe 原廠 =====
  t("t4", "Ernest Wong", "speaker", "ai", "技術顧問", "Adobe", ["Acrobat", "PDF 工作流", "Custom Model"], "/speakers/ernest.jpg",
    "Adobe 香港暨台灣區首席數位媒體技術顧問，2012 年加入 Adobe，深耕創意工具技術支援逾十年。專責為香港與台灣創意產業提供 Adobe 解決方案的示範、培訓與技術諮詢。",
    "Adobe 原廠人員", ["AI 快充學堂 — Acrobat AI Studio"]),
  // ===== 快充學堂講者 =====
  t("t2", "平芬秋色", "speaker", "creative", "攝影創作者", "", ["Lightroom", "攝影", "修圖"], "/speakers/pfqc.jpg",
    "台灣攝影創作者，以 Lightroom 調色教學見長，活躍於社群媒體，是台灣攝影修圖社群中具有代表性的 KOL。",
    "", ["AI 快充學堂 — Lightroom AI 修圖"]),
  t("t3", "小玩", "speaker", "creative", "插畫創作者", "", ["Illustrator", "插畫", "向量設計"], "/speakers/xiaowanwan.jpg",
    "台灣插畫創作者，擅長以 Adobe Illustrator 進行數位插畫創作，透過社群平台與教學內容積累廣大粉絲群。",
    "", ["AI 快充學堂 — Illustrator AI 插畫"]),
  // ===== Adobe FY26 招商簡報 — 重量級講師 =====
  t("s1",  "徐漢強", "speaker", "creative", "導演", "", ["Film", "導演", "影像敘事"],
    "https://www.nccu.edu.tw/var/file/0/1000/pictures/355/part_19437_4019049_43929.jpg",
    "台灣導演，以改編遊戲的首部劇情長片《返校》獲第 56 屆金馬獎最佳新導演及最佳改編劇本。其後執導《鬼才之道》榮獲第 27 屆台北電影獎最佳導演。"),
  t("s2",  "黃國瑜", "speaker", "creative", "設計師", "瑜悅設計", ["Design", "品牌設計"],
    "https://image-cdn.learnin.tw/bnextmedia/image/album/2022-10/img-1665739052-70740.jpg?w=600&output=webp",
    "瑜悅設計（Transform Design）創辦人，專注於品牌識別、包裝及視覺形象設計，以挖掘品牌本質為核心方法，作品屢獲國際設計獎項肯定。"),
  t("s3",  "田修銓", "speaker", "creative", "設計師", "", ["Design", "金點設計"],
    "https://storage.googleapis.com/goldenpin/judger_account/avatar/296/thumb_2x_image_0a2f69.png",
    "台灣新生代設計師，曾策劃《平面設計的形狀》主題特展，邀集方序中、廖小子、聶永真等逾四十位設計師共同參展，致力推廣台灣平面設計文化。"),
  t("s4",  "鄭鼎", "photographer", "", "攝影師", "單點影像", ["攝影", "商業攝影"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToemwJUzKLMEhGReVqrOLPjahLk2q-__CSYA&s",
    "單點影像公司負責人，Nikon NPS 亞太區代表攝影師。擅長融合時尚與紀實觀點，曾獲 Epson 百萬影像大賞及 TIVAC 攝影新人獎。"),
  t("s5",  "郭憲聰", "speaker", "creative", "特效總監", "再現影像", ["VFX", "特效", "After Effects"],
    "https://storage-asset.msi.com/tw/picture/news/2020/nb/creative-director-2.jpg",
    "再現影像製作公司創辦人，曾以《返校》及《消失的情人節》連續榮獲第 56、57 屆金馬獎最佳視覺效果，並以《鬼才之道》奪得第 61 屆金馬獎同一獎項。"),
  t("s6",  "解孟儒", "speaker", "creative", "導演 / 剪輯師", "ZABA 眨吧映像", ["Film", "導演", "剪輯"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIkXqyqlg_aJb6Kyjwnip-h-VfCqX8J8chJA&s",
    "台灣導演及剪輯師，剪輯作品涵蓋《返校》、《緝魂》等重要台灣電影，曾獲第 58 屆金馬獎最佳剪輯，並以《誰是被害者》入圍金鐘獎。"),
  t("s7",  "陳清琳", "speaker", "creative", "設計師", "", ["Design", "空間設計"],
    "https://www.taipeinewhorizon.com.tw/uploads/%E5%90%8D%E5%AE%B6%E8%A7%80%E9%BB%9E/2024/%E9%99%B3%E9%9D%92%E7%90%B3/cover.jpg",
    "台灣知名設計師，專注空間設計與視覺規劃領域。"),
  t("s8",  "楊士慶", "speaker", "creative", "設計師", "", ["Design", "唱片裝幀", "視覺設計"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJHueIjJL78sgrFEM5FIgOdHaU_JxEf9sG_A&s",
    "台灣平面設計師，曾為張惠妹、孫燕姿、盧廣仲等知名藝人操刀演唱會視覺與唱片設計。作品入圍金曲獎及美國獨立音樂獎最佳音樂海報。"),
  t("s9",  "陳泳勝", "speaker", "creative", "設計師", "海流設計", ["Design", "品牌識別"],
    "https://image-cdn.learnin.tw/bnextmedia/image/album/2023-05/img-1685079844-97252.jpg?w=600&output=webp",
    "海流設計主理人，以設計作為社會實踐的工具，深耕台灣本土文化議題。2014 年參與太陽花學運紀錄後，立志用設計的力量為這塊土地做點事。"),
  t("s10", "何廷安", "speaker", "creative", "藝術指導", "", ["Design", "字型設計", "動態"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlV4VrJ180NTI78AZq_Mr0Vbu1DK4hpdU6Qg&s",
    "台灣平面設計師與藝術指導，曾任 UltraCombos 數位體驗設計團隊藝術指導，代表作包含金曲獎 GMA30 主視覺及 Giant 品牌博物館。"),
  t("s11", "顏伯駿", "speaker", "creative", "設計師", "三頁文", ["Design", "金曲獎視覺"],
    "https://cdn-www.cw.com.tw/article/201912/article-5def74915132b.jpg",
    "三頁文（YEN Design）創辦人暨藝術總監，連續四屆擔任金曲獎視覺統籌，以第 28 屆主視覺榮獲德國紅點及 iF 設計獎。2024 年巴黎文化奧運擔任台灣館視覺創意總監。"),
  t("s12", "林呈軒", "speaker", "creative", "動畫導演", "二棲設計", ["Motion", "動畫", "MG"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT-DvL7EPKAV2gasDncwihdmO9dVjE1eVhqg&s",
    "二棲設計創辦人，同時為動態設計教育平台 Motioner 共同創辦人。作品涵蓋連續多屆國慶典禮、台灣燈會、金曲獎等國家級活動主視覺。"),
  t("s13", "陳柏尹", "speaker", "creative", "動態設計師", "Motioner", ["Motion", "動態設計"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQo3Fe3b3woQLOOLqmhr4kpc5T15_CeujQwQ&s",
    "深耕動態設計逾五年，為亞洲動態設計學習平台 Motioner 創辦人之一，在 Hahow 等線上平台開設設計課程，累計學員逾三千人。"),
  t("s14", "黃家賢", "speaker", "creative", "設計師", "洋蔥設計", ["Design", "唱片裝幀"],
    "https://storage.googleapis.com/goldenpin/judger_account/avatar/12/thumb_2x_avatar.png",
    "洋蔥設計創辦人，香港出生，1999 年於台北創立設計公司。曾獲金曲獎最佳專輯裝幀設計、德國紅點獎，並曾入圍葛萊美獎最佳唱片包裝。"),
  t("s15", "宋政傑", "speaker", "creative", "設計師", "", ["Design", "Motion"],
    "https://motioner.tw/datas/upload/site/CxxEWw0v9QhwZKw24VsK4IlcHzi2WjiW.png",
    "台灣平面暨動態設計師，曾任職洋蔥設計與奧美互動行銷，專長涵蓋平面、動態、插畫、網頁與策展。作品曾入圍金曲裝幀設計及金點設計獎。"),
  t("s16", "曾國展", "speaker", "creative", "設計師", "一件設計", ["Design", "字型設計"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtFx49T4e0KWjohHrrOnhR5C_yVFU3Ph31Lw&s",
    "台南出身，擅長字體設計與品牌視覺識別。代表作包含 2020 年中華民國國慶主視覺及 2019 台灣設計展台南館，曾任誠品書店視覺設計規劃師。"),
  t("s17", "陳柏豪", "speaker", "ai", "設計師", "", ["Design", "Adobe", "AI"],
    "https://pps.services.adobe.com/api/profile/56B62A1750F0E8330A490D4C@AdobeID/image/b11c7efb-d9b7-42e4-a6ec-17a82dc76b5a/276",
    "台灣設計師，擅長 Adobe 創意工具應用，活躍於設計教育與創作社群，長期深耕數位視覺設計領域。"),
  t("s18", "董十行", "speaker", "creative", "設計師", "空集設計", ["Design", "遊戲插畫"],
    "https://today-obs.line-scdn.net/0hBjopXyPAHUVSCQnnVCdiEmpfETRhbwdMcGoCdycNF3UoJVkSOWpOJidcQGksal0ScmsAd3cBQiF-a14aOw/w280",
    "空集設計共同創辦人，專精 2D/3D 平面繪圖。曾多次參與雷亞遊戲《Cytus》插圖繪製，並與方序中究方社合作多項視覺專案。"),
  t("s19", "廖國成", "speaker", "creative", "插畫家", "", ["插畫", "環境議題"],
    "https://service.taipower.com.tw/dsone/images_data/fb49cbeb93b238eeb5c51bc659e8ad17_8000.jpg",
    "台灣插畫家，以溫柔筆觸與淡雅色調為創作特色，透過插畫訴說環境與生命的故事。曾受邀參展奇美博物館「搖擺吧！動物們」藝術設計展。"),
  t("s20", "方序中", "speaker", "creative", "設計師", "究方社", ["Design", "金曲獎"],
    "https://cdn-www.cw.com.tw/article/201905/article-5ccc244845d61.jpg",
    "2013 年創立設計工作室「究方社」，自 2016 年起多次擔任金曲獎、金鐘獎、金馬獎視覺總監，是台灣首位執行過三金典禮主視覺的設計師。"),
  t("s21", "駿恆", "speaker", "creative", "插畫繪師", "龍族數位", ["Art", "插畫", "Photoshop"],
    "https://cdn1.techbang.com/system/excerpt_images/73745/original/774baf6f10935eb8eec8f96d198d4a4b.jpg?1576583250",
    "龍族數位創辦人，專精奇幻、仙俠與科幻風格的 CG 插畫，接案範疇涵蓋出版、遊戲、影視。長年透過線上課程傳授 CG 繪圖技法。"),
  t("s22", "劉承杰", "speaker", "creative", "動畫導演", "浮點設計", ["Motion", "3D", "動態設計"],
    "https://motioner.tw/datas/upload/site/dZnFbFl1zCnbXdXt2sBjQ4z9F9rsmL13.png",
    "浮點設計創辦人，擅長 3D 空間構築與超寫實細節描繪。曾為 Gogoro、ASUS、Oppo 等知名品牌製作產品動畫，並於 Motioner 平台開設 3D 課程。"),
  t("s23", "蘇暉凱", "photographer", "", "攝影師", "", ["攝影", "Lightroom"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI9pIdhIZhhNj_SuF2IoHGPm3VnItuX1_Vog&s",
    "台灣攝影師，擅長人像與風格攝影，作品兼具細膩光影與獨特視覺語言，長期深耕台灣攝影創作圈。"),
  t("s24", "欣蒂小姐", "speaker", "creative", "插畫家", "", ["Art", "插畫", "Photoshop"],
    "https://womany.net/cdn-cgi/image/w=800,fit=scale-down/https://castle.womany.net/images/content/pictures/21076/womany_ying_mu_kuai_zhao_2014_11_15__xia_wu_2_12_04_1416031942-31243-7109.png",
    "台灣新生代人氣插畫家，自 2012 年起以畫筆記錄生活與情感，代表作《微熟女標本室》以圖文探討女性成長歷程，廣受讀者喜愛。"),
];

export type TalentFormData = Omit<TalentRecord, "id" | "createdAt" | "updatedAt">;

export function useTalents() {
  const [talents, setTalents] = useState<TalentRecord[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TalentType | "all">("all");
  const [subTypeFilter, setSubTypeFilter] = useState<SpeakerSubType | "all">("all");

  const filtered = useMemo(() => {
    return talents.filter((t) => {
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.company.toLowerCase().includes(search.toLowerCase()) ||
        t.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        t.bio.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchSubType = subTypeFilter === "all" || t.subType === subTypeFilter;
      return matchSearch && matchType && matchSubType;
    });
  }, [talents, search, typeFilter, subTypeFilter]);

  const addTalent = useCallback((data: TalentFormData) => {
    const now = new Date().toISOString().slice(0, 10);
    setTalents((prev) => [
      { ...data, id: `t${Date.now()}`, createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }, []);

  const updateTalent = useCallback((id: string, updates: Partial<TalentRecord>) => {
    setTalents((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : t
      )
    );
  }, []);

  const deleteTalent = useCallback((id: string) => {
    setTalents((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    talents: filtered,
    totalCount: talents.length,
    search, setSearch,
    typeFilter, setTypeFilter,
    subTypeFilter, setSubTypeFilter,
    addTalent, updateTalent, deleteTalent,
  };
}
