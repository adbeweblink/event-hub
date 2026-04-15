"use client";

import { useRef, useCallback, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadVenueImage } from "@/shared/lib/storage";

export interface ImageItem {
  id: string;
  url: string;
  label: string;
  file?: File;
}

interface Props {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  labels?: string[];
}

const DEFAULT_LABELS = ["平面圖", "現場照片", "舞台", "入口", "其他"];

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  labels = DEFAULT_LABELS,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const remaining = maxImages - images.length;
      const selected = Array.from(files).slice(0, remaining).filter((f) => f.size <= MAX_FILE_SIZE);
      if (selected.length === 0) return;
      setUploading(true);
      const results = await Promise.all(
        selected.map(async (file) => {
          const url = await uploadVenueImage(file);
          if (!url) return null;
          return { id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, url, label: "現場照片" } as ImageItem;
        })
      );
      const newItems = results.filter((r): r is ImageItem => r !== null);
      if (newItems.length > 0) onChange([...images, ...newItems]);
      setUploading(false);
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  function removeImage(id: string) {
    onChange(images.filter((i) => i.id !== id));
  }

  function updateLabel(id: string, label: string) {
    onChange(images.map((i) => (i.id === id ? { ...i, label } : i)));
  }

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt={img.label}
                className="w-full rounded-md object-cover"
                style={{ aspectRatio: "4/3" }}
              />
              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0.5 right-0.5 h-6 w-6 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                onClick={() => removeImage(img.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              {/* Label select */}
              <select
                className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[10px] px-1 py-0.5 border-0 outline-none rounded-b-md"
                value={img.label}
                onChange={(e) => updateLabel(img.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                {labels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 py-6 cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
          ) : (
            <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? "上傳中..." : "拖放圖片或點擊上傳"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            支援 JPG、PNG（最多 {maxImages} 張）
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
