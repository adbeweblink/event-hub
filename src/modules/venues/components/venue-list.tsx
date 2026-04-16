"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
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
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  MapPin,
  Users,
  Phone,
  ExternalLink,
  RotateCcw,
  Wifi,
  Link2,
  Monitor,
  Mic,
  Car,
  UtensilsCrossed,
  Radio,
  RectangleHorizontal,
} from "lucide-react";
import { useVenues, type VenueRecord, type VenueFormData } from "../hooks/use-venues";
import { VenueFormDialog } from "./venue-form-dialog";
import { VENUE_TYPES, VENUE_TYPE_MAP, DISTRICTS, DISTRICT_MAP } from "../constants";
import { Stars } from "@/shared/components/stars";
import { ImageCarousel } from "@/shared/components/image-carousel";
import { Lightbox } from "@/shared/components/lightbox";
import { MapLightbox } from "@/shared/components/map-lightbox";
import { formatNTD } from "@/shared/lib/format";
import { nativeSelectCn } from "@/shared/lib/styles";
import { generateFormLink } from "@/shared/lib/form-link";

const EQUIPMENT_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
  projector: { icon: Monitor, label: "投影機" },
  led: { icon: RectangleHorizontal, label: "LED 牆" },
  mic: { icon: Mic, label: "音響" },
  wifi: { icon: Wifi, label: "Wi-Fi" },
  parking: { icon: Car, label: "停車場" },
  catering: { icon: UtensilsCrossed, label: "餐飲" },
  livestream: { icon: Radio, label: "直播" },
  stage: { icon: RectangleHorizontal, label: "舞台" },
};

function VenueCard({
  venue,
  onEdit,
  onDelete,
  onPhotoClick,
  onMapClick,
}: {
  venue: VenueRecord;
  onEdit: () => void;
  onDelete: () => void;
  onPhotoClick: (index: number) => void;
  onMapClick: () => void;
}) {
  return (
    <Card className="ring-1 ring-foreground/10 hover:shadow-md transition-all overflow-hidden">
      {/* Image Carousel — click opens lightbox */}
      {venue.images.length > 0 && (
        <div
          className="p-4 pb-0 cursor-pointer"
          onClick={() => onPhotoClick(0)}
        >
          <ImageCarousel images={venue.images} aspectRatio="16/9" />
        </div>
      )}
      <CardContent className="p-5 space-y-3 cursor-pointer" onClick={onEdit}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate">{venue.name}</h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {VENUE_TYPE_MAP[venue.type] ?? venue.type}
              </Badge>
              <Badge variant="outline" className="text-xs shrink-0">
                {DISTRICT_MAP[venue.district] ?? venue.district}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
              <button
                type="button"
                className="hover:text-primary transition-colors"
                onClick={(e) => { e.stopPropagation(); onMapClick(); }}
                title="顯示地圖"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
              </button>
              <span className="truncate">{venue.address}</span>
            </p>
            {venue.nearestMRT && (
              <p className="text-xs text-muted-foreground mt-0.5">🚇 {venue.nearestMRT}</p>
            )}
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); generateFormLink("venue", venue.id); }}>
                <Link2 className="mr-2 h-4 w-4" />
                產生表單連結
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="mr-2 h-4 w-4" />
                刪除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {(venue.capacityMin != null || venue.capacityMax != null) && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              {venue.capacityMin != null && venue.capacityMax != null
                ? `${venue.capacityMin} ~ ${venue.capacityMax} 人`
                : `${venue.capacityMin ?? venue.capacityMax} 人`}
            </span>
          )}
          {venue.priceHalfDay != null && (
            <span className="text-muted-foreground">{formatNTD(venue.priceHalfDay)}/半天</span>
          )}
          {venue.priceFullDay != null && (
            <span className="text-muted-foreground">{formatNTD(venue.priceFullDay)}/整日</span>
          )}
          <Stars rating={venue.rating} />
        </div>

        {/* Equipment Tags */}
        <div className="flex flex-wrap gap-1.5">
          {venue.equipment.map((key) => {
            const eq = EQUIPMENT_ICONS[key];
            if (!eq) return null;
            const Icon = eq.icon;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                <Icon className="h-3 w-3" />
                {eq.label}
              </span>
            );
          })}
        </div>

        {/* Contact + Notes */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {venue.contactName} · {venue.contactPhone}
          </span>
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              官網
            </a>
          )}
        </div>
        {venue.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{venue.notes}</p>
        )}

      </CardContent>
    </Card>
  );
}

export function VenueList() {
  const {
    venues,
    totalCount,
    search, setSearch,
    typeFilter, setTypeFilter,
    districtFilter, setDistrictFilter,
    capacityFilter, setCapacityFilter,
    addVenue, updateVenue, deleteVenue,
  } = useVenues();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VenueRecord | null>(null);
  const [lightbox, setLightbox] = useState<{ images: { url: string; label?: string }[]; index: number } | null>(null);
  const [mapVenue, setMapVenue] = useState<{ name: string; address: string } | null>(null);

  function handleEdit(venue: VenueRecord) {
    setEditing(venue);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function handleSubmit(data: VenueFormData) {
    if (editing) {
      updateVenue(editing.id, data);
    } else {
      addVenue(data);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">場館瀏覽</h1>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 個場地 · 顯示 {venues.length} 筆
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          新增場地
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋場地名稱、地址、備註..."
            className="pl-9"
          />
        </div>
        <select
          className={nativeSelectCn}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
        >
          <option value="all">全部類型</option>
          {VENUE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className={nativeSelectCn}
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value as typeof districtFilter)}
        >
          <option value="all">全部地區</option>
          {DISTRICTS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <select
          className={nativeSelectCn}
          value={capacityFilter}
          onChange={(e) => setCapacityFilter(parseInt(e.target.value))}
        >
          <option value={0}>全部人數</option>
          <option value={-50}>50 以下</option>
          <option value={50}>50 ~ 150</option>
          <option value={150}>150 ~ 250</option>
          <option value={250}>250 ~ 350</option>
          <option value={350}>350 以上</option>
        </select>
        {(search || typeFilter !== "all" || districtFilter !== "all" || capacityFilter !== 0) && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setDistrictFilter("all");
              setCapacityFilter(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cards Grid */}
      {venues.length === 0 ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            {search || typeFilter !== "all" || districtFilter !== "all" || capacityFilter !== 0
              ? "沒有符合條件的場地"
              : "尚未建立任何場地"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onEdit={() => handleEdit(venue)}
              onDelete={() => deleteVenue(venue.id)}
              onPhotoClick={(idx) => setLightbox({ images: venue.images, index: idx })}
              onMapClick={() => setMapVenue({ name: venue.name, address: venue.address })}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <VenueFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      {/* Lightbox */}
      <Lightbox
        images={lightbox?.images ?? []}
        startIndex={lightbox?.index ?? 0}
        open={lightbox !== null}
        onClose={() => setLightbox(null)}
      />

      {/* Map Lightbox */}
      <MapLightbox
        venueName={mapVenue?.name ?? ""}
        address={mapVenue?.address ?? ""}
        open={mapVenue !== null}
        onClose={() => setMapVenue(null)}
      />
    </div>
  );
}
