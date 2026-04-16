"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, RotateCcw, Download, Link2 } from "lucide-react";
import { formatNTD } from "@/shared/lib/format";
import { downloadCSV } from "@/shared/lib/csv";
import { useServices, type ServiceRecord, type ServiceFormData } from "../hooks/use-expenses";
import { ServiceFormDialog } from "./service-form-dialog";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP } from "../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import { generateFormLink } from "@/shared/lib/form-link";

export function ServiceList() {
  const {
    services, totalCount,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    addService, updateService, deleteService,
  } = useServices();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);

  function handleEdit(item: ServiceRecord) { setEditing(item); setDialogOpen(true); }
  function handleAdd() { setEditing(null); setDialogOpen(true); }
  function handleSubmit(data: ServiceFormData) {
    if (editing) updateService(editing.id, data);
    else addService(data);
  }

  const hasFilter = search || categoryFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">其他服務</h1>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 項服務 · 顯示 {services.length} 項
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            downloadCSV("services.csv",
              ["服務項目", "分類", "廠商", "窗口", "電話", "Email", "報價"],
              services.map((s) => [s.serviceName, EXPENSE_CATEGORY_MAP[s.category] ?? s.category, s.vendorName, s.contactName, s.contactPhone, s.contactEmail, s.price ? String(s.price) : ""])
            );
          }}>
            <Download className="mr-1.5 h-4 w-4" />匯出
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            新增服務
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋服務名稱、聯絡人、廠商..." className="pl-9" />
        </div>
        <select className={nativeSelectCn} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}>
          <option value="all">全部分類</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        {hasFilter && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => { setSearch(""); setCategoryFilter("all"); }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      {services.length === 0 ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            {hasFilter ? "沒有符合條件的服務" : "尚未建立任何服務項目"}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">服務項目</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">分類</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">廠商</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">窗口</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">電話</th>
                <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Email</th>
                <th className="text-right font-medium px-4 py-3 whitespace-nowrap">報價</th>
                <th className="text-right font-medium px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr
                  key={svc.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleEdit(svc)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{svc.serviceName}</div>
                    {svc.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[280px]">{svc.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {EXPENSE_CATEGORY_MAP[svc.category] ?? svc.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {svc.vendorName ? (
                      <span className="text-primary font-medium">{svc.vendorName}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {svc.contactName || <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {svc.contactPhone || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {svc.contactEmail || "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {svc.price > 0 ? (
                      <div>
                        <span className="font-medium">{formatNTD(svc.price)}</span>
                        {svc.priceNote && <p className="text-[10px] text-muted-foreground">{svc.priceNote}</p>}
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} />}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(svc); }}>
                          <Pencil className="mr-2 h-4 w-4" />編輯
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); generateFormLink("service", svc.id); }}>
                          <Link2 className="mr-2 h-4 w-4" />產生表單連結
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteService(svc.id); }}>
                          <Trash2 className="mr-2 h-4 w-4" />刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ServiceFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </div>
  );
}
