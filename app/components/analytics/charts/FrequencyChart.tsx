"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTranslations } from "next-intl";
import {
  FrequencyAnalysisData,
  WorkoutSessionData,
} from "@guy-vaserman/shared-my-training-app";
import { NumberTicker } from "app/components/magicui/number-ticker";
import { Calendar } from "app/components/ui/calendar";
import { useMemo } from "react";
import { useLocaleInfo } from "app/hooks/use-locale-info";

interface FrequencyChartProps {
  frequencyData: FrequencyAnalysisData;
  sessions: WorkoutSessionData[];
  className?: string;
}

export default function FrequencyChart({
  frequencyData,
  sessions,
  className,
}: FrequencyChartProps) {
  const { dir } = useLocaleInfo();
  const tCommon = useTranslations("Common");
  const t = useTranslations(
    "Components.TraineeAnalyticsDashboard.frequencyChart",
  );
  // Workout type distribution data
  const workoutTypeData = [
    {
      name: t("workoutTypes.singleSession"),
      value: frequencyData.singleSessionConut,
      color: "hsl(var(--primary))",
    },
    {
      name: t("workoutTypes.multiSession"),
      value: frequencyData.multiSessionCount,
      color: "hsl(var(--secondary))",
    },
  ];

  // Weekly frequency data - group sessions by week
  const weeklyData = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: new Date(weekKey).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          workouts: 0,
          volume: 0,
        };
      }

      acc[weekKey].workouts += 1;
      acc[weekKey].volume += session.totalVolume;

      return acc;
    },
    {} as Record<string, any>,
  );

  const weeklyChartData = Object.values(weeklyData).slice(-8); // Last 8 weeks

  // Create a set of workout dates for calendar highlighting
  const workoutDates = useMemo(() => {
    return new Set(
      sessions.map((session) => {
        const date = new Date(session.date);
        return date.toDateString();
      }),
    );
  }, [sessions]);

  return (
    <div dir={dir} className={className}>
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div>
          <div>
            <h3 className="text-lg font-semibold">{t("calendar.title")}</h3>
          </div>
          <div className="flex justify-center mt-4">
            <Calendar
              mode="multiple"
              selected={Array.from(workoutDates).map(
                (dateStr) => new Date(dateStr),
              )}
              className="rounded-md border"
              classNames={{
                day_selected:
                  "bg-primary rounded-lg text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day: "h-8 w-8 p-0 rounded-lg font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-center mt-4">
          <div className="bg-muted/50 rounded-lg p-3 grow">
            <div className="text-2xl font-bold text-primary">
              <NumberTicker value={frequencyData.totalWorkouts} />
            </div>
            <div className="text-sm text-muted-foreground">
              {t("totalWorkouts")}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 grow">
            <div className="text-2xl font-bold text-primary">
              <NumberTicker value={frequencyData.averageWorkoutsPerWeek} />
            </div>
            <div className="text-sm text-muted-foreground">
              {t("avgPerWeek")}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 grow">
            <div className="text-2xl font-bold text-primary">
              <NumberTicker value={frequencyData.averageDaysBetweenWorkouts} />
            </div>
            <div className="text-sm text-muted-foreground">
              {t("daysBetween")}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
    </div>
  );
}
