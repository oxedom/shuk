"use client";
import React from "react";

interface DashboardProgressBarProps {
  completed: number;
  total: number | null;
}

export function DashboardProgressBar({
  completed,
  total,
}: DashboardProgressBarProps) {
  if (total === null || total === 0 || total === 1) {
    return null;
  }

  // Avoid direct prop mutation by creating local variables
  const displayTotal = Math.min(completed > total ? completed : total, 100);

  const segments = Array.from({ length: displayTotal }, (_, i) => (
    <div
      key={i}
      className={`h-2 w-2 rounded ${
        i < completed ? "bg-primary" : "bg-gray-300"
      }`}
    />
  ));

  return (
    <div dir="ltr" className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap gap-1 max-w-[300px] lg:max-w-[660px] ">
        {segments}
      </div>
      <span className="text-sm text-muted-foreground">
        {completed} / {displayTotal}
      </span>
    </div>
  );
}
