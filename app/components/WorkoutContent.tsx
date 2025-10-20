"use client";

import type { MuscleInstance } from "@guy-vaserman/shared-my-training-app";
import type {
  WorkoutExercise,
  ExerciseWithMuscles,
  WorkoutType,
} from "@guy-vaserman/shared-my-training-app";

import ExerciseCardViewer from "app/components/ExerciseCardViewer";

import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Textarea } from "app/components/ui/textarea";
import WorkoutExerciseList from "app/components/WorkoutExerciseList";
import WorkoutHeader from "app/components/WorkoutHeader";
import { useTranslations } from "next-intl";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { useState } from "react";
import MuscleInvolvementBuilder from "./MuscleInvolvementBuilder";

interface WorkoutContentProps {
  workout: WorkoutType;
  index: number;
  exercises: ExerciseWithMuscles[];
  muscles: MuscleInstance[];
  onEditName: () => void;
  onAssign: () => void;
  assignButtonDisabled: boolean;
  onUpdateComment: (comment: string) => void;
  onAddExercise: (exercise: ExerciseWithMuscles) => void;
  onRemoveExercise: (exerciseId: number) => void;
  onReorderExercise: (exerciseId: number, newPosition: number) => void;
  onUpdateExercise: (
    exerciseId: number,
    property: keyof WorkoutExercise,
    value: number | string | "rpe" | "rir" | boolean,
  ) => void;
  onUpdateProgram: () => void;
  loadedProgramData?: {
    user_id: number | null;
    program_plan_id: number | null;
  };
  traineeName: string;
  isUpdating?: boolean;
}

export default function WorkoutContent({
  workout,
  index,
  exercises,
  muscles = [],
  onEditName,
  onAssign,
  assignButtonDisabled,
  onUpdateComment,
  onAddExercise,
  onRemoveExercise,
  onReorderExercise,
  onUpdateExercise,
  onUpdateProgram,
  loadedProgramData,
  traineeName,
  isUpdating = false,
}: WorkoutContentProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");

  const [isMuscleInvovlmentBuilderOpen, setIsMuscleInvovlmentBuilderOpen] =
    useState(true);

  const handleToggleMuscleInvolment = () => {
    setIsMuscleInvovlmentBuilderOpen((prev) => !prev);
  };

  const { dir } = useLocaleInfo();

  return (
    <Card className="border-secondary-foreground/30">
      <CardHeader>
        <WorkoutHeader
          assignButtonDisabled={assignButtonDisabled}
          name={workout.name}
          onEditName={onEditName}
          onAssign={onAssign}
          onUpdateProgram={onUpdateProgram}
          loadedProgramData={loadedProgramData}
          traineeName={traineeName}
          isUpdating={isUpdating}
        />
      </CardHeader>
      <CardContent className="space-y-2 ">
        <div className="mx-auto grid grid-cols-1 transition-all md:grid-cols-2 lg:grid-cols-10 gap-4">
          <div
            className={` ${isMuscleInvovlmentBuilderOpen ? "col-span-2 block duration-300" : "hidden absolute duration-300 "}`}
          >
            <MuscleInvolvementBuilder
              exercises={workout.exercises}
              muscles={muscles}
            />
          </div>

          <WorkoutExerciseList
            workoutId={index.toString()}
            gridClass={
              isMuscleInvovlmentBuilderOpen ? "lg:col-span-4" : "lg:col-span-5"
            }
            exercises={workout.exercises}
            onRemoveExercise={(_, exerciseId) => onRemoveExercise(exerciseId)}
            onReorderExercise={(_, exerciseId, newPosition) =>
              onReorderExercise(exerciseId, newPosition)
            }
            onUpdateExercise={(_, exerciseId, property, value) =>
              //@ts-ignore
              onUpdateExercise(exerciseId, property, value)
            }
          />
          <ExerciseCardViewer
            gridClass={
              isMuscleInvovlmentBuilderOpen ? "lg:col-span-4" : "lg:col-span-5 "
            }
            activeWorkoutId={index.toString()}
            onAddExercise={(_, exercise) => onAddExercise(exercise)}
            exercises={exercises}
            muscles={muscles}
            addedExercises={workout.exercises}
          />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground" dir={dir}>
            {t("comments")}
          </p>

          <Textarea
            dir={dir}
            className="h-12 border-secondary-foreground/30 font-thin"
            id={`workout-comment-${index}`}
            placeholder={t("addWorkoutComment")}
            value={workout.comment}
            onChange={(e) => onUpdateComment(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
