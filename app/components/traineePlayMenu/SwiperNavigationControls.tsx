"use client";
import React from "react";
import { Button } from "app/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface SwiperNavigationControlsProps {
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextLastExercise: boolean; // True if the next action is for the last exercise (shows "Finish")
  isHebrew: boolean;
}

export function SwiperNavigationControls({
  onPrev,
  onNext,
  isPrevDisabled,
  isNextLastExercise,
  isHebrew,
}: SwiperNavigationControlsProps) {
  const t = useTranslations("Components.TraineePlayMenu");

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 p-3 border-t bg-background shadow-md z-10 lg:mx-auto">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={isPrevDisabled}
        className="h-14 hover:outline hover:outline-2 hover:outline-white"
      >
        {isHebrew ? (
          <>
            <ChevronRight className="mr-2 h-5 w-5" />
            {t("backExercise")}
          </>
        ) : (
          <>
            <ChevronLeft className="mr-2 h-5 w-5" />
            {t("backExercise")}
          </>
        )}
      </Button>
      <Button
        onClick={onNext}
        className="h-14 hover:outline hover:outline-2 hover:outline-white"
      >
        {isNextLastExercise ? (
          t("finishWorkout")
        ) : (
          <>
            {isHebrew ? (
              <>
                {t("nextExercise")}
                <ChevronLeft className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                {t("nextExercise")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
