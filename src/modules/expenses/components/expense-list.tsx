"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useExpenses, type ExpenseRecord, type ExpenseFormData } from "../hooks/use-expenses";
import { ExpenseFormDialog } from "./expense-form-dialog";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP } from "../constants";
import { formatNTD } from "@/shared/lib/format";
import { nativeSelectCn } from "@/shared/lib/styles";

export function ExpenseList() {
  const {
    expenses, totalCount, totalAmount,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    addExpense, updateExpense, deleteExpense,
  } = useExpenses();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);

  function handleEdit(item: ExpenseRecord) { setEditing(item); setDialogOpen(true); }
  function handleAdd() { setEditing(null); setDialogOpen(true); }
  function handleSubmit(data: ExpenseFormData) {
    if (editing) updateExpense(editing.id, data);
    else addExpense(data);
  }

  const hasFilter = search || categoryFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">雜支紀錄</h1>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 筆 · 顯示 {expenses.length} 筆 · 小計 {formatNTD(totalAmount)}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          新增雜支
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋說明、活動、廠商、代墊人..." className="pl-9" />
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
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">日期</TableHead>
                <TableHead>分類</TableHead>
                <TableHead>說明</TableHead>
                <TableHead className="hidden md:table-cell">活動</TableHead>
                <TableHead className="hidden lg:table-cell">廠商</TableHead>
                <TableHead className="hidden lg:table-cell">代墊人</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    {hasFilter ? "沒有符合條件的雜支" : "尚未建立任何雜支紀錄"}
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(item)}>
                    <TableCell className="text-sm">{item.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {EXPENSE_CATEGORY_MAP[item.category] ?? item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{item.eventName || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{item.vendor || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{item.paidBy || "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNTD(item.amount)}
                      {!item.taxIncluded && <span className="text-xs text-muted-foreground ml-1">未稅</span>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                            <Pencil className="mr-2 h-4 w-4" />編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteExpense(item.id); }}>
                            <Trash2 className="mr-2 h-4 w-4" />刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {expenses.length > 0 && (
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell colSpan={6} className="text-right text-sm">合計</TableCell>
                  <TableCell className="text-right">{formatNTD(totalAmount)}</TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </div>
  );
}
