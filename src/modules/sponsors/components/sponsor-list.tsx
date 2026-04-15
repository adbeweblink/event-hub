"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Lock,
  RotateCcw,
  Download,
} from "lucide-react";
import { useSponsors, type SponsorRecord, type SponsorFormData } from "../hooks/use-sponsors";
import { SponsorFormDialog } from "./sponsor-form-dialog";
import {
  SPONSOR_TIERS,
  SPONSOR_TIER_MAP,
  SPONSOR_TIER_COLOR_MAP,
  SPONSOR_STATUSES,
  SPONSOR_STATUS_MAP,
} from "../constants";
import { useAuth } from "@/modules/core/hooks/use-auth";
import { formatNTD } from "@/shared/lib/format";
import { nativeSelectCn } from "@/shared/lib/styles";
import { downloadCSV } from "@/shared/lib/csv";

export function SponsorList() {
  const {
    sponsors,
    totalCount,
    search, setSearch,
    tierFilter, setTierFilter,
    statusFilter, setStatusFilter,
    addSponsor, updateSponsor, deleteSponsor,
  } = useSponsors();

  const { isSuperAdmin, canViewFinancials } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SponsorRecord | null>(null);

  function handleEdit(sponsor: SponsorRecord) {
    setEditing(sponsor);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function handleSubmit(data: SponsorFormData) {
    if (editing) {
      updateSponsor(editing.id, data);
    } else {
      addSponsor(data);
    }
  }

  const hasFilter = search || tierFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">贊助廠商</h1>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 家贊助商 · 顯示 {sponsors.length} 筆
            {isSuperAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 text-destructive">
                <Lock className="h-3 w-3" />
                超級管理員模式
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            downloadCSV("sponsors.csv",
              ["名稱", "等級", "狀態", "產業", "聯絡人", "職稱", "電話", "Email", "贊助金額"],
              sponsors.map((s) => [s.name, SPONSOR_TIER_MAP[s.tier] ?? s.tier, SPONSOR_STATUS_MAP[s.status] ?? s.status, s.industry, s.contactName, s.contactTitle, s.contactPhone, s.contactEmail, s.sponsorFee ? String(s.sponsorFee) : ""])
            );
          }}>
            <Download className="mr-1.5 h-4 w-4" />匯出
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            新增贊助商
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋贊助商名稱、產業、聯絡人..."
            className="pl-9"
          />
        </div>
        <select
          className={nativeSelectCn}
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
        >
          <option value="all">全部等級</option>
          {SPONSOR_TIERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className={nativeSelectCn}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="all">全部狀態</option>
          {SPONSOR_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {hasFilter && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => { setSearch(""); setTierFilter("all"); setStatusFilter("all"); }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      {sponsors.length === 0 ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            {hasFilter ? "沒有符合條件的贊助商" : "尚未建立任何贊助商"}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">贊助商</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">等級</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">狀態</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">產業</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">聯絡人</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">職務</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">電話</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Email</th>
                {canViewFinancials && (
                  <th className="text-right font-medium px-4 py-3 whitespace-nowrap">贊助金額</th>
                )}
                <th className="text-right font-medium px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((sponsor) => {
                const tierColor = SPONSOR_TIER_COLOR_MAP[sponsor.tier] ?? "";
                return (
                  <tr
                    key={sponsor.id}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleEdit(sponsor)}
                  >
                    {/* Name + Logo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-white ring-1 ring-foreground/10 flex items-center justify-center overflow-hidden">
                          {sponsor.logo ? (
                            <img
                              src={sponsor.logo}
                              alt={sponsor.name}
                              className="h-full w-full object-contain p-1"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">{sponsor.name[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[180px]">{sponsor.name}</div>
                          {sponsor.website && (
                            <a
                              href={sponsor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                              官網
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={`text-xs ${tierColor}`}>
                        {SPONSOR_TIER_MAP[sponsor.tier] ?? sponsor.tier}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {SPONSOR_STATUS_MAP[sponsor.status] ?? sponsor.status}
                      </Badge>
                    </td>

                    {/* Industry */}
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {sponsor.industry || "—"}
                    </td>

                    {/* Contact Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {sponsor.contactName || <span className="text-muted-foreground">—</span>}
                    </td>

                    {/* Contact Title */}
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {sponsor.contactTitle || "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {sponsor.contactPhone || "—"}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {sponsor.contactEmail || "—"}
                    </td>

                    {/* Fee (admin only) */}
                    {canViewFinancials && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {sponsor.sponsorFee != null ? (
                          <span className="flex items-center justify-end gap-1 text-destructive font-medium">
                            <Lock className="h-3 w-3" />
                            {formatNTD(sponsor.sponsorFee)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">未填</span>
                        )}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(sponsor); }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteSponsor(sponsor.id); }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      <SponsorFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
