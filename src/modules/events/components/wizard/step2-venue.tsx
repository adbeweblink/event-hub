"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { useVenues, type VenueRecord } from "@/modules/venues/hooks/use-venues";
import { VenueFormDialog } from "@/modules/venues/components/venue-form-dialog";
import { VENUE_TYPES, DISTRICTS, VENUE_TYPE_MAP, DISTRICT_MAP } from "@/modules/venues/constants";
import { nativeSelectCn } from "@/shared/lib/styles";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

export function Step2Venue({ draft, update }: Props) {
  const { venues: allVenues, addVenue } = useVenues();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [showAddVenue, setShowAddVenue] = useState(false);

  // Filter venues by type, district, and capacity
  const filteredVenues = useMemo(() => {
    return allVenues.filter((v) => {
      const matchType = typeFilter === "all" || v.type === typeFilter;
      const matchDistrict = districtFilter === "all" || v.district === districtFilter;
      const matchCapacity =
        !draft.expectedAttendees ||
        !v.capacityMax ||
        (v.capacityMin != null && v.capacityMax != null &&
          draft.expectedAttendees >= (v.capacityMin * 0.5) &&
          draft.expectedAttendees <= v.capacityMax);
      return matchType && matchDistrict && (draft.expectedAttendees ? matchCapacity : true);
    });
  }, [allVenues, typeFilter, districtFilter, draft.expectedAttendees]);

  function toggleVenue(id: string) {
    const current = draft.venueIds;
    if (current.includes(id)) {
      update("venueIds", current.filter((v) => v !== id));
    } else {
      update("venueIds", [...current, id]);
    }
  }

  function capacityLabel(v: VenueRecord) {
    if (v.capacityMin && v.capacityMax) return `${v.capacityMin}~${v.capacityMax} 人`;
    if (v.capacityMax) return `最多 ${v.capacityMax} 人`;
    return "未知";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">規模與場地</h2>
        <p className="text-sm text-muted-foreground">選人數後篩場地，資料來自場館瀏覽</p>
      </div>

      {/* Attendees — block selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">預計人數</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {[50, 100, 150, 200, 250, 300, 350].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update("expectedAttendees", n)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                draft.expectedAttendees === n
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Venue filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          className={nativeSelectCn}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">全部類型</option>
          {VENUE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className={nativeSelectCn}
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          <option value="all">全部地區</option>
          {DISTRICTS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground self-center">
          {filteredVenues.length} 個場地
          {draft.expectedAttendees > 0 && `（符合 ${draft.expectedAttendees} 人）`}
        </span>
      </div>

      {/* Venue selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">選擇場地（可多選候選）</label>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddVenue(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />新增場地
          </Button>
        </div>
        {filteredVenues.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">沒有符合條件的場地，試著調整篩選條件</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredVenues.map((venue) => {
              const selected = draft.venueIds.includes(venue.id);
              return (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => toggleVenue(venue.id)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Building2 className={`h-5 w-5 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{venue.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {DISTRICT_MAP[venue.district]} · {VENUE_TYPE_MAP[venue.type]} · {capacityLabel(venue)}
                    </div>
                  </div>
                  {selected && (
                    <Badge variant="secondary" className="ml-auto text-xs shrink-0">候選</Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {draft.venueIds.length > 0 ? (
        <div className="text-sm text-muted-foreground">
          已選 {draft.venueIds.length} 個候選場地（最終需確認 1 個）
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          場地：待確認 — 可先跳過，之後再回來選
        </div>
      )}

      <VenueFormDialog
        open={showAddVenue}
        onClose={() => setShowAddVenue(false)}
        onSubmit={async (data) => {
          const newId = await addVenue(data);
          if (newId) {
            update("venueIds", [...draft.venueIds, newId]);
          }
          setShowAddVenue(false);
        }}
      />
    </div>
  );
}
