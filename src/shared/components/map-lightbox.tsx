"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useCallback } from "react";

interface Props {
  address: string;
  venueName: string;
  open: boolean;
  onClose: () => void;
}

export function MapLightbox({ address, venueName, open, onClose }: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!open) return null;

  // 用場館名稱搜尋，比混合地址更精準
  const mapQuery = encodeURIComponent(venueName);
  const fullQuery = encodeURIComponent(`${venueName} ${address}`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Map container — same size as lightbox */}
      <div
        className="relative w-[90vw] h-[85vh] rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${mapQuery}&hl=zh-TW&z=17&output=embed`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${venueName} 地圖`}
        />

        {/* Venue name + address overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
            📍 {venueName}
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${fullQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-black/60 px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            在 Google Maps 開啟 ↗
          </a>
        </div>
      </div>
    </div>
  );
}
