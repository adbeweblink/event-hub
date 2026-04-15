"use client";

import { use } from "react";
import { EventDetail } from "@/modules/events/components/event-detail";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EventDetail eventId={id} />;
}
