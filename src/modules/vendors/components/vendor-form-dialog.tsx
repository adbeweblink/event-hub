"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VENDOR_CATEGORIES } from "../constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { VendorRecord, VendorFormData } from "../hooks/use-vendors";
import type { VendorCategory } from "@/shared/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VendorFormData) => void;
  initial?: VendorRecord | null;
}

const EMPTY: VendorFormData = {
  name: "",
  category: "other",
  taxId: "",
  bankCode: "",
  bankName: "",
  bankAccount: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

export function VendorFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState(EMPTY);
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category,
        taxId: initial.taxId,
        bankCode: initial.bankCode,
        bankName: initial.bankName,
        bankAccount: initial.bankAccount,
        contactName: initial.contactName,
        contactPhone: initial.contactPhone,
        contactEmail: initial.contactEmail,
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    onClose();
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯廠商" : "新增廠商"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">廠商名稱 *</label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="輸入廠商名稱"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">分類</label>
              <select
                className={nativeSelectCn}
                value={form.category}
                onChange={(e) => set("category", e.target.value as VendorCategory)}
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tax & Bank */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">統一編號</label>
              <Input
                value={form.taxId}
                onChange={(e) => set("taxId", e.target.value)}
                placeholder="12345678"
                maxLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">銀行代碼</label>
              <Input
                value={form.bankCode}
                onChange={(e) => set("bankCode", e.target.value)}
                placeholder="例：808"
                maxLength={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">銀行名稱</label>
              <Input
                value={form.bankName}
                onChange={(e) => set("bankName", e.target.value)}
                placeholder="例：玉山銀行"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">銀行帳號</label>
              <Input
                value={form.bankAccount}
                onChange={(e) => set("bankAccount", e.target.value)}
                placeholder="帳號"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">聯絡人</label>
              <Input
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="姓名"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">電話</label>
              <Input
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="02-xxxx-xxxx"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">{isEdit ? "儲存" : "新增"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
