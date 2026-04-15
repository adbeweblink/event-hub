"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EXPENSE_CATEGORIES } from "../constants";
import { useVendors } from "@/modules/vendors/hooks/use-vendors";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { ExpenseCategory } from "../constants";
import type { ServiceRecord, ServiceFormData } from "../hooks/use-expenses";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
  initial?: ServiceRecord | null;
}

const EMPTY: ServiceFormData = {
  category: "misc",
  serviceName: "",
  description: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  vendorId: "",
  vendorName: "",
  price: 0,
  priceNote: "",
  notes: "",
};

function VendorSelect({ form, set }: { form: ServiceFormData; set: <K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) => void }) {
  const { vendors } = useVendors();
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">綁定廠商</label>
      <select
        className={nativeSelectCn}
        value={form.vendorId}
        onChange={(e) => {
          const v = vendors.find((v) => v.id === e.target.value);
          set("vendorId", e.target.value);
          set("vendorName", v?.name ?? "");
        }}
      >
        <option value="">不綁定</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>{v.name}（{v.contactName}）</option>
        ))}
      </select>
    </div>
  );
}

export function ServiceFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState<ServiceFormData>(EMPTY);
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        category: initial.category,
        serviceName: initial.serviceName,
        description: initial.description,
        contactName: initial.contactName,
        contactPhone: initial.contactPhone,
        contactEmail: initial.contactEmail,
        vendorId: initial.vendorId,
        vendorName: initial.vendorName,
        price: initial.price,
        priceNote: initial.priceNote,
        notes: initial.notes,
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.serviceName.trim()) return;
    onSubmit(form);
    onClose();
  }

  function set<K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯服務" : "新增服務"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Name + Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">服務名稱 *</label>
              <Input value={form.serviceName} onChange={(e) => set("serviceName", e.target.value)} placeholder="例：活動攝影（全日）" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">分類</label>
              <select className={nativeSelectCn} value={form.category} onChange={(e) => set("category", e.target.value as ExpenseCategory)}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">服務內容</label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="可提供的服務項目說明..." rows={2} />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">聯絡窗口</label>
              <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="姓名" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">電話</label>
              <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="02-xxxx-xxxx" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          {/* Vendor dropdown */}
          <VendorSelect form={form} set={set} />

          {/* Price */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">參考報價（NTD）</label>
              <Input type="number" min={0} value={form.price || ""} onChange={(e) => set("price", parseInt(e.target.value) || 0)} placeholder="含稅金額" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">報價說明</label>
              <Input value={form.priceNote} onChange={(e) => set("priceNote", e.target.value)} placeholder="例：半日場 / 含設備" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">備註</label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="補充說明" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>取消</Button>
            <Button type="submit">{isEdit ? "儲存" : "新增"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
