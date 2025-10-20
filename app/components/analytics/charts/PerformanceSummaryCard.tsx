"use client";

import { PerformanceSummaryData } from "@guy-vaserman/shared-my-training-app";
import { TrendingUp, Calendar, Dumbbell, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { NumberTicker } from "app/components/magicui/number-ticker";

interface PerformanceSummaryCardProps {
  data: PerformanceSummaryData;
  className?: string;
}

export default function PerformanceSummaryCard({
  data,
  className,
}: PerformanceSummaryCardProps) {
  const t = useTranslations(
    "Components.TraineeAnalyticsDashboard.performanceSummary",
  );

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(data.period.startDate).toLocaleDateString()} -{" "}
          {new Date(data.period.endDate).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workouts */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t("workouts")}
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            <NumberTicker value={data.overallProgress.totalWorkouts} />
          </div>
          {/* TODO ADD MORE DESCRIPTION */}
          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {/* {t("totalSessions")} */}
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {t("volume")}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            <NumberTicker value={data.overallProgress.totalVolume} />
          </div>
        </div>

        {/* Adjusted Volume */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {t("totalSets")}
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            <NumberTicker value={data.overallProgress.totalSets} />
          </div>
        </div>

        {/* Strength Gain */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {t("totalWeight")}
            </span>
          </div>
          <div className={`text-2xl font-bold`}>
            <NumberTicker value={data.overallProgress.totalWeight} />
          </div>
        </div>
      </div>
    </div>
  );
}
