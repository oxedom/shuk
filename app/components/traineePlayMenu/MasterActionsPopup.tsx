"use client";
import React from "react";
import { Button } from "app/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "app/components/ui/popover";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ActionItem } from "app/types/client/";
import { useRouter } from "next/navigation";
import { WorkoutSummary } from "@guy-vaserman/shared-my-training-app";
//hehe
interface MasterActionsPopupProps {
  onCloseWorkout: () => void;
  workoutSummary: WorkoutSummary | null;
}

export function MasterActionsPopup({
  onCloseWorkout,
  workoutSummary,
}: MasterActionsPopupProps) {
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const onBack = () => {
    router.push("/dashboard");
  };

  const actions: ActionItem[] = [
    {
      labelKey: "closeWorkout",
      disabled: workoutSummary !== null,
      icon: X,
      onClick: onCloseWorkout,
      variant: "destructive",
    },
    {
      labelKey: "masterActionsBack",
      icon: ArrowLeft,
      onClick: onBack,
      variant: "ghost",
    },
  ];

  actions.forEach((action) => {
    if (!action.hasOwnProperty("variant")) {
      action.variant = "ghost";
    }
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <X />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-4 lg:mx-0 w-26 rounded-2xl border-secondary-foreground/20">
        <div className="flex flex-col gap-y-2 lg:gap-y-1">
          {actions.map((action) => (
            <Button
              key={action.labelKey}
              variant="ghost"
              className={`w-full justify-start ${action.disabled ? "opacity-50" : ""}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <action.icon
                className={`h-4 w-4 ${action.variant === "destructive" ? "text-destructive" : ""}`}
              />
              {tCommon(action.labelKey)}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
