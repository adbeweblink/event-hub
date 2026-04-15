"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EventDetail } from "@/modules/events/components/event-detail";

function EventViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  if (!id) return <div className="p-8 text-center text-muted-foreground">找不到活動</div>;
  return <EventDetail eventId={id} />;
}

export default function EventViewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">載入中...</div>}>
      <EventViewContent />
    </Suspense>
  );
}
