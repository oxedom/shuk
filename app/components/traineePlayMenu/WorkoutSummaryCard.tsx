"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import { WorkoutSummary } from "@guy-vaserman/shared-my-training-app";
import { NumberTicker } from "app/components/magicui/number-ticker";
import { differenceInMinutes, differenceInSeconds } from "date-fns";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { useTranslations } from "next-intl";
import {
  BicepsFlexed,
  RefreshCcwIcon,
  Dumbbell,
  Trophy,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
  TrophyIcon,
} from "lucide-react";
import { ReactNode } from "react";
import {
  ExercisePerformanceChange,
  MetricChange,
  SetChange,
  SetChangeType,
} from "@guy-vaserman/shared-my-training-app";

interface WorkoutSummaryCardProps {
  workoutSummary: WorkoutSummary;
  onClose: null | (() => void);
}

export function WorkoutSummaryCard({
  workoutSummary,
  onClose,
}: WorkoutSummaryCardProps) {
  const { isHebrew } = useLocaleInfo();
  const t = useTranslations("Components.WorkoutSummaryCard");
  const tCommon = useTranslations("Common");

  function StatCard({
    icon: Icon,
    value,
    label,
    useNumberTicker = false,
  }: {
    icon: LucideIcon;
    value: ReactNode;
    label: string;
    useNumberTicker?: boolean;
  }) {
    return (
      <Card>
        <CardContent className="grid grid-rows-3 grid-cols-1 items-center gap-2 py-4">
          <div className="flex justify-center w-full">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex justify-center w-full font-semibold text-2xl">
            {useNumberTicker && typeof value === "number" ? (
              <NumberTicker value={value} />
            ) : (
              value
            )}
          </div>
          <div className="flex justify-center w-full">
            <CardTitle className="text-sm">{label}</CardTitle>
          </div>
        </CardContent>
      </Card>
    );
  }

  function formatWorkoutDuration(startTime: Date, endTime: Date): string {
    const totalMinutes = differenceInMinutes(endTime, startTime);

    // If less than 1 minute, show seconds
    if (totalMinutes < 1) {
      const totalSeconds = differenceInSeconds(endTime, startTime);
      return `00:${totalSeconds.toString().padStart(2, "0")}`;
    }

    // Cap at 3 hours (180 minutes)
    const cappedMinutes = Math.min(totalMinutes, 180);

    const hours = Math.floor(cappedMinutes / 60);
    const minutes = cappedMinutes % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  function PerformanceChangeItem({
    change,
  }: {
    change: ExercisePerformanceChange;
  }) {
    const getChangeIcon = (metricChange: MetricChange | null) => {
      if (!metricChange) return null;
      if (metricChange.absolute_change > 0) {
        return <ArrowUp className="h-3 w-3 text-green-600" />;
      } else if (metricChange.absolute_change < 0) {
        return <ArrowDown className="h-3 w-3 text-red-600" />;
      }
      return null;
    };

    const getSetChangeIcon = (setChange: SetChange | null) => {
      if (!setChange) return null;
      if (setChange.set_change_type === SetChangeType.ADDED_SETS) {
        return <Plus className="h-3 w-3 text-green-600" />;
      } else if (setChange.set_change_type === SetChangeType.REMOVED_SETS) {
        return <Minus className="h-3 w-3 text-red-600" />;
      }
      return null;
    };

    const getChangeColor = (absoluteChange: number) => {
      if (absoluteChange > 0) return "text-green-600";
      if (absoluteChange < 0) return "text-red-600";
      return "text-gray-600";
    };

    const formatChange = (metricChange: MetricChange) => {
      const sign = metricChange.absolute_change >= 0 ? "+" : "";
      const percentage =
        metricChange.percentage_change !== null
          ? ` (${sign}${metricChange.percentage_change}%)`
          : "";
      return `${sign}${metricChange.absolute_change}${percentage}`;
    };

    return (
      <Card className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">
              {isHebrew && change.exercise.hebrew_name
                ? change.exercise.hebrew_name
                : change.exercise.english_name}
            </h4>
            <div className="flex flex-wrap gap-3 text-xs">
              {change.changes.weight && (
                <div className="flex items-center gap-1">
                  {getChangeIcon(change.changes.weight)}
                  <span className="text-gray-600">{t("weight")}:</span>
                  <span
                    className={getChangeColor(
                      change.changes.weight.absolute_change,
                    )}
                  >
                    {formatChange(change.changes.weight)}
                    {tCommon("kg")}
                  </span>
                </div>
              )}
              {change.changes.repetitions && (
                <div className="flex items-center gap-1">
                  {getChangeIcon(change.changes.repetitions)}
                  <span className="text-gray-600">{t("reps")}:</span>
                  <span
                    className={getChangeColor(
                      change.changes.repetitions.absolute_change,
                    )}
                  >
                    {formatChange(change.changes.repetitions)}
                  </span>
                </div>
              )}
              {change.changes.sets && (
                <div className="flex items-center gap-1">
                  {getSetChangeIcon(change.changes.sets)}
                  <span className="text-gray-600">{t("sets")}:</span>
                  <span
                    className={getChangeColor(
                      change.changes.sets.set_difference,
                    )}
                  >
                    {change.changes.sets.set_difference >= 0 ? "+" : ""}
                    {change.changes.sets.set_difference}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle>{t("mainCongratulations")}</CardTitle>
        <CardDescription>{t("secondaryCongratulations")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 [&>*]:text-center">
            <StatCard
              icon={Dumbbell}
              value={workoutSummary.total_exercises}
              label={t("exercises")}
            />

            {workoutSummary.total_personal_records > 0 ? (
              <StatCard
                icon={TrophyIcon}
                value={workoutSummary.total_personal_records}
                label={t("personalWeightRecords")}
                useNumberTicker={true}
              />
            ) : (
              <StatCard
                icon={Plus}
                value={workoutSummary.aggregated_weight_score}
                label={t("weightScore")}
                useNumberTicker={true}
              />
            )}

            <StatCard
              icon={RefreshCcwIcon}
              value={formatWorkoutDuration(
                workoutSummary.start_time,
                workoutSummary.end_time,
              )}
              label={t("duration")}
            />

            <StatCard
              icon={BicepsFlexed}
              value={workoutSummary.total_sets}
              label={t("sets")}
              useNumberTicker={true}
            />
          </div>
        </div>

        {/* Performance Changes Section */}
        {workoutSummary.performance_changes &&
          workoutSummary.performance_changes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">
                  {t("performanceChanges")}
                </h3>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {workoutSummary.performance_changes.map((change, index) => (
                  <PerformanceChangeItem key={index} change={change} />
                ))}
              </div>
            </div>
          )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onClose ? onClose : () => {}}
          variant="outline"
          className="w-full rounded-3xl bg-white text-black hover:text-secondary-foreground"
        >
          {t("closeWorkout")}
        </Button>
      </CardFooter>
    </Card>
  );
}
