"use client";

import {
  ExerciseWithMuscles,
  MuscleInstance,
  calculateMusclePointsForExercise,
} from "@guy-vaserman/shared-my-training-app";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Badge } from "app/components/ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface MusclePoint {
  points: number;
  english_name: string;
  hebrew_name?: string;
}

interface MusclePointsWithNameMap {
  [muscleId: number]: MusclePoint;
}

export function MuscleInvolvementBuilder({
  exercises,
  muscles,
}: {
  muscles: MuscleInstance[];
  exercises: ExerciseWithMuscles[];
}) {
  const { isHebrew, dir } = useLocaleInfo();
  const t = useTranslations("Components.WorkoutExerciseList");

  const musclePointsWithNames = useMemo(() => {
    const points = exercises.map((exercise) =>
      calculateMusclePointsForExercise(exercise),
    );

    const musclePointsMap: MusclePointsWithNameMap = {};

    const aggregatedMusclePoints = points.reduce(
      (accumulator, exercisePoints) => {
        for (const [key, value] of Object.entries(exercisePoints)) {
          const muscleId = Number(key);

          if (musclePointsMap[muscleId] === undefined) {
            //Not that efficent but small scale who cares
            const currentMuscle = muscles.find((m) => m.muscle_id === muscleId);
            if (!currentMuscle) return accumulator;
            if (musclePointsMap[muscleId] === undefined) {
              musclePointsMap[muscleId] = {
                points: 0,
                english_name: currentMuscle?.english_name,
                hebrew_name: currentMuscle?.hebrew_name,
              };
            }
          }
          musclePointsMap[muscleId].points += value;
        }

        return accumulator;
      },
      musclePointsMap,
    );

    return aggregatedMusclePoints;
  }, [exercises]);

  const pointsValues = Object.values(musclePointsWithNames).sort(
    (a, b) => b.points - a.points,
  );

  return (
    <Card dir={dir} className="w-full border border-secondary-foreground/30">
      <CardHeader>
        <CardTitle
          className={`${pointsValues.length === 0 ? "text-primary-foreground/30" : ""}`}
        >
          {t("muscles")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap   ">
          <ScrollArea className="lg:h-[520px] pr-3 ">
            {pointsValues.map((musclePoint: MusclePoint, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="w-full border mt-2  "
              >
                <div
                  dir={dir}
                  className="flex text-base items-center justify-between gap-2 w-full"
                >
                  <p className="">
                    {isHebrew
                      ? musclePoint.hebrew_name
                      : musclePoint.english_name}
                    {""}
                  </p>
                  <p className="font-bold flex items-center justify-center bg-primary h-8 w-8 rounded-lg">
                    <span className="text-primary-foreground">
                      {musclePoint.points}
                    </span>
                  </p>
                </div>
              </Badge>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default MuscleInvolvementBuilder;
