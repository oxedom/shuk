"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import SetInput from "app/components/ui/SetInput";
import { CircleCheck, Plus, Trash, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { ExerciseActionsPopup } from "./ExerciseActionsPopup";
import { Input } from "../ui/input";
import {
  ExerciseCommentInstance,
  ProgramPlanWorkoutExerciseExerciseInstance,
  WorkoutInputSetUnit,
} from "@guy-vaserman/shared-my-training-app";
import ExerciseCommentsDialog from "../dialogs/ExerciseCommentsDialog";
import { useState } from "react";

interface ExerciseCardProps {
  exerciseData: ProgramPlanWorkoutExerciseExerciseInstance; // The specific exercise data for this slide
  exerciseIndex: number;
  workoutInputDataForExercise: WorkoutInputSetUnit[]; // Sets for this specific exercise
  pastExerciseComments: ExerciseCommentInstance[];
  comment: string;
  isExerciseCompleted: boolean;
  onSetInputChange: (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string,
  ) => void;
  onAddSetToExercise: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onCompleteExercise: (exerciseIndex: number, prevState: boolean) => void;
  onCommentsChange: (exerciseIndex: number, value: string) => void;
  onAddExercise: (exerciseIndex: number) => void;
  onReplaceExercise: (exerciseIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onShowHistory: (exerciseIndex: number) => void;
}

export function ExerciseCard({
  exerciseData,
  exerciseIndex,
  workoutInputDataForExercise,
  comment,

  pastExerciseComments,
  onSetInputChange,
  onAddSetToExercise,
  onRemoveSet,
  onAddExercise,
  onReplaceExercise,
  onRemoveExercise,
  onShowHistory,
  onCommentsChange,
  onCompleteExercise,
  isExerciseCompleted,
}: ExerciseCardProps) {
  const t = useTranslations("Components.TraineePlayMenu");
  const tCommon = useTranslations("Common");
  const { dir, isHebrew } = useLocaleInfo();
  const isSkipped = workoutInputDataForExercise?.[0]?.skipped;
  if (!workoutInputDataForExercise) {
    // This can happen if workoutInputData is null initially
    return (
      <Card className="h-full overflow-y-auto">
        <CardContent>{t("loadingSets")}</CardContent>
      </Card>
    );
  }

  const zeroComments = pastExerciseComments.length === 0;
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);

  const handleDisplayCommentsModal = () => {
    setIsCommentsDialogOpen(true);
  };

  return (
    <Card
      className={`${isExerciseCompleted ? "border-primary" : "border-secondary-foreground/30 "} border-t-0  duration-300 rounded-none bg-secondary rounded-b-2xl pb-0  `}
    >
      <CardHeader dir={dir} className="p-1" />
      <CardContent>
        <div>
          <div className="flex flex-col justify-center items-center gap-y-4 lg:gap-2 my-2 ">
            <div className="flex items-center gap-x-3 mb-6 ">
              <div className="flex items-center gap-x-2 w-full">
                <Input
                  placeholder={
                    zeroComments
                      ? t("addNotes")
                      : pastExerciseComments[pastExerciseComments.length - 1]
                          .comment
                  }
                  value={comment}
                  onChange={(e) =>
                    onCommentsChange(exerciseIndex, e.target.value)
                  }
                  //bg-box-3

                  dir={dir}
                  className="
                  focus:border-b-0 
                  font-thin text-xs border-b border-t-0 border-l-0 border-r-0 rounded  "
                />
              </div>
              <div className="flex items-center gap-x-2">
                <Button
                  disabled={zeroComments}
                  size="icon"
                  onClick={handleDisplayCommentsModal}
                  variant="outline"
                  className="relative rounded-xl "
                >
                  {!zeroComments && (
                    <>
                      <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        {pastExerciseComments.length > 0
                          ? pastExerciseComments.length
                          : ""}
                      </span>{" "}
                    </>
                  )}
                  <MessageSquare />
                </Button>
                <ExerciseActionsPopup
                  amountOfExercises={workoutInputDataForExercise.length}
                  exerciseIndex={exerciseIndex}
                  onAddExercise={onAddExercise}
                  onReplaceExercise={onReplaceExercise}
                  onRemoveExercise={onRemoveExercise}
                  onShowHistory={onShowHistory}
                />
              </div>
            </div>
            {workoutInputDataForExercise.map((set, setIndex) => (
              <React.Fragment key={setIndex}>
                <SetInput
                  onChange={(value, field) =>
                    onSetInputChange(exerciseIndex, setIndex, field, value)
                  }
                  activeExercise={exerciseData} // Pass the original exercise for SetInput context if needed
                  index={setIndex}
                  workoutInputData={set} // Pass the specific set data
                  isLastSet={
                    setIndex === workoutInputDataForExercise.length - 1
                  }
                  addSetToExercise={() => onAddSetToExercise(exerciseIndex)} // Ensure correct exerciseIndex
                />
                {setIndex === workoutInputDataForExercise.length - 1 && (
                  <div className="flex flex-col gap-x-2">
                    <div className="flex gap-x-3 mt-2">
                      <Button
                        variant="outline"
                        className="rounded-2xl col-span-3  bg-box-3"
                        size="sm"
                        onClick={() => onAddSetToExercise(exerciseIndex)}
                      >
                        <Plus className="mr-1 h-2 w-2" /> {t("addSet")}
                        {/* Added mr-1 for spacing */}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={workoutInputDataForExercise.length <= 1}
                        className="hover:text-destructive 
                        col-span-3
                         disabled:text-destructive/50  rounded-2xl bg-box-3"
                        onClick={() => onRemoveSet(exerciseIndex, setIndex)}
                        title={tCommon("removeSet")}
                      >
                        <Trash className="ml-1 h-2 w-2" />
                        <span className="text-secondary-foreground">
                          {tCommon("removeSet")}
                        </span>
                        {/* Added ml-1 for spacing */}
                      </Button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center justify-center gap-y-2 ">
            <Button
              onClick={() =>
                onCompleteExercise(
                  exerciseIndex,
                  workoutInputDataForExercise[0].skipped,
                )
              }
              className={`bg-white w-full rounded-2xl  text-black hover:text-secondary-foreground mt-3 ${
                isSkipped ? "" : "bg-primary"
              }`}
              variant="outline"
            >
              <div className="flex items-center font-title text-base font-semibold justify-center gap-x-1 ">
                <span>
                  {isSkipped
                    ? tCommon("completeExercise")
                    : tCommon("completedExercise")}
                </span>
                {!isSkipped && (
                  <div className="duration-200 opacity-100">
                    <CircleCheck size={48} />
                  </div>
                )}
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
      <ExerciseCommentsDialog
        isOpen={isCommentsDialogOpen}
        onOpenChange={setIsCommentsDialogOpen}
        exerciseComments={pastExerciseComments}
        exerciseName={
          isHebrew && exerciseData.exercise.hebrew_name
            ? exerciseData.exercise.hebrew_name
            : exerciseData.exercise.english_name
        }
      />
    </Card>
  );
}
