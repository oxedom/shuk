"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { WorkoutSessionData } from "@guy-vaserman/shared-my-training-app";
import {
  useDateFnsLocale,
  getLocaleFormatOptions,
} from "app/libs/locale-loader";
import type { TooltipProps } from "recharts";

interface WeightChartProps {
  sessions: WorkoutSessionData[];
  className?: string;
}

export default function WeightChart({ sessions, className }: WeightChartProps) {
  const t = useTranslations("Components.TraineeAnalyticsDashboard.weightChart");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const dateFnsLocale = useDateFnsLocale();

  const chartData = sessions
    .map((session) => ({
      date: format(
        new Date(session.date),
        "MMM dd",
        getLocaleFormatOptions(dateFnsLocale),
      ),
      weight: session.totalWeight,
      exercises: session.completedExercises,
      workoutName: session.programPlanWorkout.english_name,
    }))
    .reverse(); // Show oldest to newest

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">
            {data.workoutName}
          </p>
          <p className="text-primary">
            {tCommon("weight")} {data.weight.toLocaleString(locale)}{" "}
            {tCommon("kg")}
          </p>
          <p className="text-secondary-foreground">
            {tCommon("exercises")} {data.exercises}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            fontSize={12}
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: "hsl(var(--foreground))" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-muted-foreground">
        <p>
          {t("showing")} {sessions.length} {t("workoutSessions")}
        </p>
      </div>
    </div>
  );
}
