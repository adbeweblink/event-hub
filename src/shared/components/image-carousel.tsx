"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  images: { url: string; label?: string }[];
  aspectRatio?: string;
  className?: string;
}

export function ImageCarousel({
  images,
  aspectRatio = "16/9",
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-muted text-muted-foreground text-sm ${className}`}
        style={{ aspectRatio }}
      >
        尚無圖片
      </div>
    );
  }

  const current = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  return (
    <div className={`relative group overflow-hidden rounded-lg ${className}`}>
      <img
        src={current.url}
        alt={current.label ?? `圖片 ${index + 1}`}
        className="w-full object-cover"
        style={{ aspectRatio }}
      />

      {/* Label */}
      {current.label && (
        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
          {current.label}
        </span>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
          {index + 1} / {images.length}
        </span>
      )}

      {/* Prev */}
      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i - 1);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Next */}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i + 1);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
