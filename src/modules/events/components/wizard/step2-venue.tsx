"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventDraft } from "../../hooks/use-event-wizard";

interface Props {
  draft: EventDraft;
  update: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}

// TODO: 從場地庫拉資料，目前先用簡易 mock
const VENUE_OPTIONS = [
  { id: "ve2", name: "三創生活園區 12F", capacity: "80~200 人" },
  { id: "ve3", name: "WESTAR", capacity: "200~1000 人" },
  { id: "ve4", name: "CORNER MAX", capacity: "400~650 人" },
  { id: "ve5", name: "NUZONE", capacity: "300~500 人" },
  { id: "ve6", name: "1921 共享空間", capacity: "30~80 人" },
  { id: "ve7", name: "映 CG 活動大廳", capacity: "未知" },
];

export function Step2Venue({ draft, update }: Props) {
  function toggleVenue(id: string) {
    const current = draft.venueIds;
    if (current.includes(id)) {
      update("venueIds", current.filter((v) => v !== id));
    } else {
      update("venueIds", [...current, id]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">規模與場地</h2>
        <p className="text-sm text-muted-foreground">填人數後選場地，或加待場勘的候選場地</p>
      </div>

      {/* Attendees */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-sm font-medium">預計人數</label>
        <Input
          type="number"
          min={0}
          value={draft.expectedAttendees || ""}
          onChange={(e) => update("expectedAttendees", parseInt(e.target.value) || 0)}
          placeholder="大概就好"
        />
      </div>

      {/* Venue selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">選擇場地（可多選候選）</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VENUE_OPTIONS.map((venue) => {
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
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{venue.name}</div>
                  <div className="text-xs text-muted-foreground">{venue.capacity}</div>
                </div>
                {selected && (
                  <Badge variant="secondary" className="ml-auto text-xs shrink-0">候選</Badge>
                )}
              </button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" className="mt-2">
          <Plus className="mr-1.5 h-4 w-4" />
          新增待場勘場地
        </Button>
      </div>
    </div>
  );
}
