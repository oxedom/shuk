"use client";
import type { ReactNode } from "react";

import useUserStore from "app/store/userStore";
import { cn } from "app/libs/utils";
import { Sidebar } from "./Sidebar";
import useGlobalStore from "app/store/globalStore";
import { Loader2 } from "lucide-react";

interface DashboardShellProps {
  children: ReactNode;
  hideOnMobile?: boolean;
}

export function DashboardShell({
  children,
  hideOnMobile,
}: DashboardShellProps) {
  const { loadedRoles } = useUserStore();
  const { globalLoading } = useGlobalStore();
  return (
    <div
      className={cn(
        " duration-300  flex min-h-screen",
        !loadedRoles && "opacity-0",
      )}
    >
      <div className={`lg:flex ${hideOnMobile ? "hidden" : "flex"}`}>
        <Sidebar />
      </div>

      <div className={cn("flex flex-col flex-1 lg:flex")}>
        {globalLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-1/4 h-1/4 opacity-50 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
