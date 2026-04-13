"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  RotateCcw,
} from "lucide-react";
import { useTalents, type TalentRecord, type TalentFormData } from "../hooks/use-talents";
import { TalentFormDialog } from "./talent-form-dialog";
import { TALENT_TYPES, TALENT_TYPE_MAP, SPEAKER_SUB_TYPES, SPEAKER_SUB_TYPE_MAP, FEE_UNIT_OPTIONS } from "../constants";
import { Stars } from "@/shared/components/stars";
import { formatNTD } from "@/shared/lib/format";
import { nativeSelectCn } from "@/shared/lib/styles";

function getFeeLabel(unit: string) {
  return FEE_UNIT_OPTIONS.find((u) => u.value === unit)?.label ?? unit;
}

function TalentCard({
  talent,
  onEdit,
  onDelete,
}: {
  talent: TalentRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initials = talent.name.slice(0, 2);

  return (
    <Card className="ring-1 ring-foreground/10 hover:shadow-md transition-all flex flex-col">
      <CardContent className="p-5 flex flex-col gap-3 cursor-pointer flex-1" onClick={onEdit}>
        {/* Row 1: Avatar + Name + Menu — fixed height */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            {talent.avatarUrl && <AvatarImage src={talent.avatarUrl} alt={talent.name} className="object-cover" />}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base truncate">{talent.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {[talent.title, talent.company].filter(Boolean).join(" · ") || "—"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className="text-xs">
                {TALENT_TYPE_MAP[talent.type] ?? talent.type}
              </Badge>
              {talent.subType && (
                <Badge variant="outline" className="text-xs">
                  {SPEAKER_SUB_TYPE_MAP[talent.subType] ?? talent.subType}
                </Badge>
              )}
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

        {/* Row 2: Specialties — fixed min-height */}
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          {talent.specialties.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Row 3: Bio — fixed 2 lines */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {talent.bio || "尚未填寫簡介"}
        </p>

        {/* Row 4: Fee + Rating — always visible, pushed to bottom */}
        <div className="flex items-center justify-between text-sm mt-auto pt-2 border-t">
          <span className="text-muted-foreground">
            {talent.fee != null
              ? `${formatNTD(talent.fee)} / ${getFeeLabel(talent.feeUnit)}`
              : talent.feeUnit === "negotiable" ? "面議" : "—"}
          </span>
          <Stars rating={talent.rating} />
        </div>

        {/* Row 5: Past Events — if any */}
        {talent.pastEvents.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {talent.pastEvents.map((name) => (
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

export function TalentList() {
  const {
    talents,
    totalCount,
    search, setSearch,
    typeFilter, setTypeFilter,
    subTypeFilter, setSubTypeFilter,
    addTalent, updateTalent, deleteTalent,
  } = useTalents();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TalentRecord | null>(null);

  function handleEdit(talent: TalentRecord) {
    setEditing(talent);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function handleSubmit(data: TalentFormData) {
    if (editing) {
      updateTalent(editing.id, data);
    } else {
      addTalent(data);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">講者資料庫</h1>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 位講者 · 顯示 {talents.length} 位
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          新增講者
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋講者姓名、職稱、專長、簡介..."
            className="pl-9"
          />
        </div>
        <select
          className={nativeSelectCn}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as typeof typeFilter);
            if (e.target.value !== "speaker") setSubTypeFilter("all");
          }}
        >
          <option value="all">全部類型</option>
          {TALENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {typeFilter === "speaker" && (
          <select
            className={nativeSelectCn}
            value={subTypeFilter}
            onChange={(e) => setSubTypeFilter(e.target.value as typeof subTypeFilter)}
          >
            <option value="all">全部講者</option>
            {SPEAKER_SUB_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
        {(search || typeFilter !== "all" || subTypeFilter !== "all") && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => { setSearch(""); setTypeFilter("all"); setSubTypeFilter("all"); }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cards */}
      {talents.length === 0 ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            {search || typeFilter !== "all"
              ? "沒有符合條件的講者"
              : "尚未建立任何講者"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {talents.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              onEdit={() => handleEdit(talent)}
              onDelete={() => deleteTalent(talent.id)}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <TalentFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </div>
  );
}
