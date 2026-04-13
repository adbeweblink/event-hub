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
  Phone,
  Mail,
  ExternalLink,
  Lock,
  RotateCcw,
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

function SponsorCard({
  sponsor,
  onEdit,
  onDelete,
  isSuperAdmin,
}: {
  sponsor: SponsorRecord;
  onEdit: () => void;
  onDelete: () => void;
  isSuperAdmin: boolean;
}) {
  const tierColor = SPONSOR_TIER_COLOR_MAP[sponsor.tier] ?? "";

  return (
    <Card className="ring-1 ring-foreground/10 hover:shadow-md transition-all flex flex-col">
      <CardContent className="p-5 flex flex-col gap-3 cursor-pointer flex-1" onClick={onEdit}>
        {/* Row 1: Logo + Name + Tier + Status + Menu */}
        <div className="flex items-start gap-3">
          {sponsor.logo && (
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="h-12 w-12 shrink-0 rounded-lg object-contain bg-white p-1.5 ring-1 ring-foreground/10"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base truncate">{sponsor.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {sponsor.industry || "—"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className={`text-xs ${tierColor}`}>
                {SPONSOR_TIER_MAP[sponsor.tier] ?? sponsor.tier}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {SPONSOR_STATUS_MAP[sponsor.status] ?? sponsor.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Pencil className="mr-2 h-4 w-4" />
                編輯
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="mr-2 h-4 w-4" />
                刪除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Row 2: Benefits */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {sponsor.sponsorBenefits || sponsor.notes || "尚未填寫權益內容"}
        </p>

        {/* Row 3: Contact */}
        {(sponsor.contactName || sponsor.contactPhone || sponsor.contactEmail) && (
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {sponsor.contactName && (
              <span>{sponsor.contactName}{sponsor.contactTitle ? ` · ${sponsor.contactTitle}` : ""}</span>
            )}
            {sponsor.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {sponsor.contactPhone}
              </span>
            )}
            {sponsor.contactEmail && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {sponsor.contactEmail}
              </span>
            )}
          </div>
        )}

        {/* Row 4: Fee (super admin only) + Website — pushed to bottom */}
        <div className="flex items-center justify-between text-sm mt-auto pt-2 border-t">
          {isSuperAdmin && sponsor.sponsorFee != null ? (
            <span className="flex items-center gap-1 text-destructive font-medium">
              <Lock className="h-3 w-3" />
              {formatNTD(sponsor.sponsorFee)}
            </span>
          ) : isSuperAdmin ? (
            <span className="text-muted-foreground">金額未填</span>
          ) : (
            <span />
          )}
          {sponsor.website && (
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              官網
            </a>
          )}
        </div>

        {/* Row 5: Past Events */}
        {sponsor.pastEvents.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sponsor.pastEvents.map((name) => (
              <Badge key={name} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SponsorList() {
  const {
    sponsors,
    totalCount,
    search, setSearch,
    tierFilter, setTierFilter,
    statusFilter, setStatusFilter,
    addSponsor, updateSponsor, deleteSponsor,
  } = useSponsors();

  const { isSuperAdmin } = useAuth();
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
          <h1 className="text-2xl font-bold tracking-tight">贊助商資料庫</h1>
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
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          新增贊助商
        </Button>
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

      {/* Cards */}
      {sponsors.length === 0 ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            {hasFilter ? "沒有符合條件的贊助商" : "尚未建立任何贊助商"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onEdit={() => handleEdit(sponsor)}
              onDelete={() => deleteSponsor(sponsor.id)}
              isSuperAdmin={isSuperAdmin}
            />
          ))}
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
