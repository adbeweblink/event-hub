import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">活動專案</h1>
          <p className="text-sm text-muted-foreground">管理所有行銷活動</p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            新增活動
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        尚無活動，按右上角「新增活動」開始建立
      </div>
    </div>
  );
}
