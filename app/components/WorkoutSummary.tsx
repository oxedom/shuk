"use client";
import { NumberTicker } from "app/components/magicui/number-ticker";
import { formatDuration, intervalToDuration } from "date-fns";
import * as dateLocales from "date-fns/locale";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import type { WorkoutSummary } from "@guy-vaserman/shared-my-training-app";

export function WorkoutSummary({
  workoutSummary,
}: {
  workoutSummary: WorkoutSummary;
}) {
  const { locale } = useLocaleInfo();
  const duration = formatDuration(
    intervalToDuration({
      start: new Date(workoutSummary.start_time),
      end: new Date(workoutSummary.end_time),
    }),
    {
      format: ["hours", "minutes"],
      locale: dateLocales[locale as keyof typeof dateLocales],
    },
  );
  //   const t = useTranslations("Components.SearchBar");
  //   const tCommon = useTranslations("Common");

  return (
    <div>
      <div>{duration}</div>
      <NumberTicker value={workoutSummary.aggregated_weight_score} />
      <div></div>
    </div>
  );
}
export default WorkoutSummary;
