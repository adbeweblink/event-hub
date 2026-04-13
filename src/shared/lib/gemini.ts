const GEMINI_MODEL = "gemini-2.5-flash";

export interface VenueAIResult {
  address?: string;
  district?: string;
  capacityMin?: number;
  capacityMax?: number;
  priceHalfDay?: number;
  priceFullDay?: number;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  nearestMRT?: string;
  parkingInfo?: string;
  minRentalHours?: number;
  depositPolicy?: string;
  equipment?: string[];
  notes?: string;
  venueType?: string;
}

export async function aiAutoFillVenue(
  venueName: string,
  apiKey: string
): Promise<VenueAIResult> {
  const prompt = `你是台灣活動場地資料庫助手。請搜尋「${venueName}」這個場館的資訊，回傳 JSON（不要 markdown code block），欄位如下：
{
  "address": "完整地址",
  "district": "所在城市：taipei/newtaipei/taoyuan/taichung/tainan/kaohsiung/other_dist",
  "capacityMin": 座位最少人數(數字或null),
  "capacityMax": 站席最多人數(數字或null),
  "priceHalfDay": 半天租金含稅NTD(數字或null),
  "priceFullDay": 整日租金含稅NTD(數字或null),
  "contactPhone": "電話",
  "contactEmail": "email",
  "website": "官方網站URL",
  "nearestMRT": "最近捷運站",
  "parkingInfo": "停車資訊",
  "minRentalHours": 最低租借時數(數字或null),
  "depositPolicy": "訂金/取消政策",
  "equipment": ["projector","led","mic","wifi","parking","catering","livestream","stage"],
  "notes": "場地特色描述（2-3句）",
  "venueType": "hotel/studio/coworking/restaurant/other"
}
只回傳 JSON，不要其他文字。查不到的欄位填 null 或空字串。equipment 只填有的項目。價格如果是未稅請乘 1.05 換算含稅。`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 錯誤: ${res.status} ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  try {
    return JSON.parse(text) as VenueAIResult;
  } catch {
    throw new Error(`AI 回傳格式錯誤: ${text.slice(0, 200)}`);
  }
}
