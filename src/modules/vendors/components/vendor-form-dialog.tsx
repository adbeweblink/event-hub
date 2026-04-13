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
import { Textarea } from "@/components/ui/textarea";
import { VENDOR_CATEGORIES } from "../constants";
import { StarRatingInput } from "@/shared/components/stars";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { Vendor, VendorCategory } from "@/shared/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => void;
  initial?: Vendor | null;
}

const EMPTY: Omit<Vendor, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  category: "other",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  notes: "",
  rating: 3,
};

export function VendorFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState(EMPTY);
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category,
        contactName: initial.contactName,
        contactPhone: initial.contactPhone,
        contactEmail: initial.contactEmail,
        notes: initial.notes,
        rating: initial.rating,
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

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">評分</label>
            <StarRatingInput value={form.rating} onChange={(v) => set("rating", v)} />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">備註</label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="過往配合經驗、注意事項..."
              rows={3}
            />
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
