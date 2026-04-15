"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "../constants/navigation";
import { useAuth } from "../hooks/use-auth";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  const pathname = usePathname();
  const { displayName, email, isSuperAdmin, signOut } = useAuth();
  const current = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <span className="text-sm font-medium">
        {current?.title ?? "Event Hub"}
      </span>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2.5">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-tight">{displayName}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{email}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {isSuperAdmin ? "Admin" : "User"}
        </Badge>
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
