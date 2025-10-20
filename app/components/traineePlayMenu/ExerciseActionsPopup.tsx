"use client";
import React from "react";
import { Button } from "app/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "app/components/ui/popover";
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  History,
  X,
  RefreshCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ActionItem } from "app/types/client/";

interface ExerciseActionsPopupProps {
  onAddExercise: (exerciseIndex: number) => void;
  onReplaceExercise: (exerciseIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onShowHistory: (exerciseIndex: number) => void;
  exerciseIndex: number;
  amountOfExercises: number;
}

export function ExerciseActionsPopup({
  onAddExercise,
  onReplaceExercise,
  onRemoveExercise,
  onShowHistory,
  exerciseIndex,
  amountOfExercises,
}: ExerciseActionsPopupProps) {
  const tCommon = useTranslations("Common");

  //Components.TraineePlayMenu.addExercise
  //Components.TraineePlayMenu.replaceExercise
  //Components.TraineePlayMenu.showHistory
  //Components.TraineePlayMenu.removeExercise
  //Components.TraineePlayMenu.addExercise
  //Components.TraineePlayMenu.replaceExercise
  //Components.TraineePlayMenu.showHistory
  //Components.TraineePlayMenu.removeExercise
  const actions: ActionItem[] = [
    {
      labelKey: "addExercise",
      icon: PlusCircle,
      onClick: () => onAddExercise(exerciseIndex),
    },
    {
      labelKey: "replaceExercise",
      icon: RefreshCcw,
      onClick: () => onReplaceExercise(exerciseIndex),
    },
    {
      labelKey: "showHistory",
      icon: History,
      onClick: () => onShowHistory(exerciseIndex),
    },
    {
      labelKey: "removeExercise",
      icon: Trash2,
      onClick: () => onRemoveExercise(exerciseIndex),
      variant: "destructive",
      condition: amountOfExercises < 1,
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
        <Button variant="outline" size="icon" className="secondary rounded-xl">
          <MoreHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-4 lg:mx-0 w-40 rounded-2xl border-secondary-foreground/10">
        <div className="flex flex-col gap-y-2 lg:gap-y-1">
          {actions.map((action) => (
            <Button
              key={action.labelKey}
              variant="ghost"
              className="w-full justify-start"
              onClick={action.onClick}
              disabled={action.condition}
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
