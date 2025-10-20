"use client";

import type { WorkoutType } from "@guy-vaserman/shared-my-training-app";
import { Button } from "app/components/ui/button";

import { TabsList, TabsTrigger } from "app/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocaleInfo } from "app/hooks/use-locale-info";

interface WorkoutTabsProps {
  workouts: WorkoutType[];
  activeTabIndex: number;
  setActiveTabIndex: (index: number) => void;
  onDeleteWorkout: (index: number) => void;
  onAddWorkout: () => void;
}

export default function WorkoutTabs({
  workouts,

  onDeleteWorkout,
  onAddWorkout,
}: WorkoutTabsProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const { dir } = useLocaleInfo();
  return (
    <div className="w-full">
      {/* Desktop: Original layout */}
      <div className="hidden lg:flex items-center gap-1">
        <TabsList dir={dir} className="flex-wrap ">
          {workouts.map((workout, index) => (
            <TabsTrigger
              key={index}
              value={index.toString()}
              className="flex items-center gap-2 "
            >
              <span className="cursor-pointer">{workout.name}</span>

              {workouts.length > 1 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWorkout(index);
                  }}
                  className="ml-2 p-1 rounded-full transition-colors cursor-pointer"
                  aria-label={`Delete workout ${workout.name}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteWorkout(index);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 text-gray-500 hover:text-red-500" />
                </div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button
          variant="outline"
          size="icon"
          onClick={onAddWorkout}
          className="ml-2 my-1"
          aria-label={t("addWorkoutLabel")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
