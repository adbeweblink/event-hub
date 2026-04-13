"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
} from "lucide-react";
import { useVendors } from "../hooks/use-vendors";
import { VendorFormDialog } from "./vendor-form-dialog";
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_MAP } from "../constants";
import { Stars } from "@/shared/components/stars";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { Vendor } from "@/shared/types";

export function VendorList() {
  const {
    vendors,
    totalCount,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    addVendor,
    updateVendor,
    deleteVendor,
  } = useVendors();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  function handleEdit(vendor: Vendor) {
    setEditing(vendor);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function handleSubmit(data: Omit<Vendor, "id" | "createdAt" | "updatedAt">) {
    if (editing) {
      updateVendor(editing.id, data);
    } else {
      addVendor(data);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">廠商資料庫</h1>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 家廠商 · 顯示 {vendors.length} 筆
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          新增廠商
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋廠商名稱、聯絡人、備註..."
            className="pl-9"
          />
        </div>
        <select
          className={nativeSelectCn}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
        >
          <option value="all">全部分類</option>
          {VENDOR_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">廠商名稱</TableHead>
                <TableHead>分類</TableHead>
                <TableHead>聯絡人</TableHead>
                <TableHead className="hidden md:table-cell">聯絡方式</TableHead>
                <TableHead>評分</TableHead>
                <TableHead className="hidden lg:table-cell">備註</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-12"
                  >
                    {search || categoryFilter !== "all"
                      ? "沒有符合條件的廠商"
                      : "尚未建立任何廠商"}
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow
                    key={vendor.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEdit(vendor)}
                  >
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {VENDOR_CATEGORY_MAP[vendor.category] ?? vendor.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{vendor.contactName}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {vendor.contactPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {vendor.contactEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Stars rating={vendor.rating} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {vendor.notes}
                      </p>
                    </TableCell>
                    <TableCell>
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
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(vendor);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteVendor(vendor.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <VendorFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </div>
  );
}
