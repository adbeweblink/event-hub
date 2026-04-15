"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { formatNTD, parseLocalDate, WEEKDAYS } from "@/shared/lib/format";
import { PARTNER_ROLE_MAP, type PartnerRole } from "../constants";
import { SPONSOR_TIER_MAP } from "@/modules/sponsors/constants";
import { useSettings } from "@/modules/core/hooks/use-settings";

interface QuotationData {
  eventName: string;
  eventDate: string;
  venueName: string;
  sponsorName: string;
  sponsorRole: string;
  sponsorTier: string;
  sponsorFee: number;
  sponsorBenefits: string;
  vendorName: string;
  taxId: string;
  bankCode: string;
  bankName: string;
  bankAccount: string;
}


export function Quotation({ eventId, sponsorId, onClose }: { eventId: string; sponsorId: string; onClose: () => void }) {
  const [data, setData] = useState<QuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    (async () => {
      // Fetch event
      const { data: evt } = await supabase.from("events").select("name, tentative_dates, confirmed_date").eq("id", eventId).single();
      // Fetch event_sponsors join
      const { data: es } = await supabase.from("event_sponsors").select("fee, role, contact_name, sponsors(id, name, tier, sponsor_benefits, sponsor_fee, vendor_id)").eq("event_id", eventId).eq("sponsor_id", sponsorId).single();
      // Fetch venue names
      const { data: venues } = await supabase.from("event_venues").select("venues(name)").eq("event_id", eventId);

      if (!evt || !es) { setLoading(false); return; }

      const sponsor = (es as any).sponsors;
      const venueName = venues?.map((v: any) => v.venues?.name).filter(Boolean).join("、") ?? "";
      const dateStr = evt.confirmed_date ?? (evt.tentative_dates as string[])?.[0] ?? "";
      const dateDisplay = dateStr ? `${String(dateStr).slice(0, 10)}（${WEEKDAYS[parseLocalDate(dateStr).getDay()]}）` : "日期待定";

      // Fetch vendor banking info if sponsor has vendor_id
      let vendorInfo = { name: "", taxId: "", bankCode: "", bankName: "", bankAccount: "" };
      if (sponsor?.vendor_id) {
        const { data: vendor } = await supabase.from("vendors").select("name, tax_id, bank_code, bank_name, bank_account").eq("id", sponsor.vendor_id).single();
        if (vendor) {
          vendorInfo = { name: vendor.name, taxId: vendor.tax_id ?? "", bankCode: vendor.bank_code ?? "", bankName: vendor.bank_name ?? "", bankAccount: vendor.bank_account ?? "" };
        }
      }

      setData({
        eventName: evt.name ?? "",
        eventDate: dateDisplay,
        venueName,
        sponsorName: sponsor?.name ?? "",
        sponsorRole: PARTNER_ROLE_MAP[(es as any).role as PartnerRole] ?? (es as any).role,
        sponsorTier: sponsor?.tier ? SPONSOR_TIER_MAP[sponsor.tier as keyof typeof SPONSOR_TIER_MAP] ?? sponsor.tier : "",
        sponsorFee: (es as any).fee ?? sponsor?.sponsor_fee ?? 0,
        sponsorBenefits: sponsor?.sponsor_benefits ?? "",
        vendorName: vendorInfo.name,
        taxId: vendorInfo.taxId,
        bankCode: vendorInfo.bankCode,
        bankName: vendorInfo.bankName,
        bankAccount: vendorInfo.bankAccount,
      });
      setLoading(false);
    })();
  }, [eventId, sponsorId]);

  function handlePrint() {
    window.print();
  }

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><p className="text-white">載入中...</p></div>;
  if (!data) return null;

  const today = new Date();
  const todayStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto print:static">
      {/* Print-hidden toolbar */}
      <div className="flex items-center justify-between p-4 border-b print:hidden">
        <h2 className="text-lg font-bold">報價單預覽</h2>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">列印 / 匯出 PDF</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">關閉</button>
        </div>
      </div>

      {/* Quotation content */}
      <div className="max-w-[210mm] mx-auto p-12 print:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide">報 價 單</h1>
          <p className="text-sm text-gray-500 mt-1">QUOTATION</p>
        </div>

        <div className="flex justify-between text-sm mb-8">
          <div>
            <p><span className="text-gray-500">報價日期：</span>{todayStr}</p>
            <p><span className="text-gray-500">有效期限：</span>報價日起 30 天</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{settings.companyName || "展碁國際股份有限公司"}</p>
            <p className="text-gray-500 text-xs">{settings.companyNameEn || "Weblink International Inc."}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mb-8">
          <tbody>
            <tr className="border-b">
              <td className="py-2.5 pr-4 text-gray-500 w-[120px]">活動名稱</td>
              <td className="py-2.5 font-medium">{data.eventName}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2.5 pr-4 text-gray-500">活動日期</td>
              <td className="py-2.5">{data.eventDate}</td>
            </tr>
            {data.venueName && (
              <tr className="border-b">
                <td className="py-2.5 pr-4 text-gray-500">活動地點</td>
                <td className="py-2.5">{data.venueName}</td>
              </tr>
            )}
            <tr className="border-b">
              <td className="py-2.5 pr-4 text-gray-500">贊助商</td>
              <td className="py-2.5 font-medium">{data.sponsorName}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2.5 pr-4 text-gray-500">合作角色</td>
              <td className="py-2.5">{data.sponsorRole}</td>
            </tr>
            {data.sponsorTier && (
              <tr className="border-b">
                <td className="py-2.5 pr-4 text-gray-500">贊助等級</td>
                <td className="py-2.5">{data.sponsorTier}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Amount */}
        <div className="rounded-lg border p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">贊助金額（含稅）</span>
            <span className="text-2xl font-bold">{formatNTD(data.sponsorFee)}</span>
          </div>
        </div>

        {/* Benefits */}
        {data.sponsorBenefits && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-2 text-gray-500">贊助權益</h3>
            <div className="text-sm whitespace-pre-wrap border-l-2 border-gray-200 pl-4">
              {data.sponsorBenefits}
            </div>
          </div>
        )}

        {/* Payment info */}
        {(data.taxId || data.bankName) && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-2 text-gray-500">付款資訊</h3>
            <table className="text-sm">
              <tbody>
                {data.vendorName && <tr><td className="pr-4 py-1 text-gray-500">戶名</td><td>{data.vendorName}</td></tr>}
                {data.taxId && <tr><td className="pr-4 py-1 text-gray-500">統一編號</td><td>{data.taxId}</td></tr>}
                {data.bankName && <tr><td className="pr-4 py-1 text-gray-500">銀行</td><td>{data.bankName}{data.bankCode ? `（${data.bankCode}）` : ""}</td></tr>}
                {data.bankAccount && <tr><td className="pr-4 py-1 text-gray-500">帳號</td><td>{data.bankAccount}</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-6 mt-12 flex justify-between text-sm text-gray-400">
          <p>Event Hub — 行銷活動管理平台</p>
          <p>第 1 頁，共 1 頁</p>
        </div>
      </div>
    </div>
  );
}
