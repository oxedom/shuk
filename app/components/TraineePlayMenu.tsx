"use client";

import type {
  ExerciseCommentInstance,
  InProgressWorkoutInstanceWithHistory,
  onExercisesAddedParam,
  onExercisesReplacedParam,
  onExercisesRemovedParam,
  onExercisesIncrementedParam,
  onExercisesDecrementedParam,
} from "@guy-vaserman/shared-my-training-app";
import type { ConfettiRef } from "./magicui/confetti";
import { useConfirmDialog } from "app/components/dialogs/ConfirmDialog";
import SelectExerciseDialog from "app/components/dialogs/SelectExerciseDialog";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { useExerciseActions } from "app/hooks/useExerciseActions";
import { useWorkoutSession } from "app/hooks/useWorkoutSession";
import { useWorkoutStateAndPersistence } from "app/hooks/useWorkoutStateAndPersistence";
import { generateAccordionItemId } from "app/libs/utils";
import {
  ActionEnum,
  WorkoutInputSetUnit,
  WorkoutTypeEnum,
} from "@guy-vaserman/shared-my-training-app";
import { CircleCheck, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ExerciseHistoryDialog from "./dialogs/ExerciseHistoryDialog";
import FinishWorkoutDialog from "./dialogs/FinishWorkoutDialog";
import { Confetti } from "./magicui/confetti";
import { ExerciseCard } from "./traineePlayMenu/ExerciseCard";
import { MasterActionsPopup } from "./traineePlayMenu/MasterActionsPopup";
import { ProgressBar } from "./traineePlayMenu/ProgressBar";
import { WorkoutSummaryCard } from "./traineePlayMenu/WorkoutSummaryCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { checkIfNewPRRecord } from "app/backend/actions";

interface TraineePlayMenuProps {
  workoutData: InProgressWorkoutInstanceWithHistory;
  workoutInstanceId: number;
  workoutType: WorkoutTypeEnum;
  onTerminate?: (workoutInstanceId: number) => void;
  onFinish?: (workoutInstanceId: number) => void;
}

export default function TraineePlayMenu({
  workoutData,
  workoutInstanceId,
  workoutType,
  onFinish,
  onTerminate,
}: TraineePlayMenuProps) {
  const t = useTranslations("Components.TraineePlayMenu");
  const tCommon = useTranslations("Common");
  const { dir, isHebrew } = useLocaleInfo();

  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<
    number | null
  >(null);

  const { ConfirmDialog, confirm } = useConfirmDialog();
  const router = useRouter();

  const currentUserId = workoutData.user_id;
  const history = workoutData.workout_history;

  const currentWorkoutExercises =
    workoutData.program_plan_instance_workout.program_plan_workout_exercises;

  const exerciseComments =
    workoutData.program_plan_instance_workout.exercise_comments;

  const exerciseCommentExerciseIdMap = exerciseComments.reduce(
    (
      acc: Record<number, ExerciseCommentInstance[]>,
      comment: ExerciseCommentInstance,
    ) => {
      if (!acc[comment.exercise_id]) {
        acc[comment.exercise_id] = [];
      }
      acc[comment.exercise_id].push(comment);
      return acc;
    },
    {},
  );

  const getPastExerciseComments = (exerciseId: number) => {
    return exerciseCommentExerciseIdMap[exerciseId] || [];
  };

  const {
    workoutInputData,
    comments,
    setInputChange,
    addSetToExercise,
    removeSet,
    toggleSkipExercise,
    commentsChange,
    removeExercise,
    replaceExercise,
    addExercise,
  } = useWorkoutStateAndPersistence(
    workoutInstanceId,
    workoutType,
    currentWorkoutExercises,
    history,
  );

  const handlePRCheck = async (exerciseIndex: number) => {
    if (!workoutInputData) return;
    const currentExerciseSets = workoutInputData[exerciseIndex];
    if (!currentExerciseSets) return;

    const maxWeightScore = Math.max(
      ...currentExerciseSets.map(
        (set: WorkoutInputSetUnit) => set.weight_score || 0,
      ),
    );

    const exerciseId =
      currentWorkoutExercises[exerciseIndex].exercise.exercise_id;
    if (!exerciseId) return;

    try {
      const result = await checkIfNewPRRecord(
        exerciseId,
        maxWeightScore,
        currentUserId,
      );
      if (!result.success || !result.data)
        throw new Error("Service failed to check PR");

      if (result.data.isNewRecord) {
        fireConfetti();
      }
    } catch (error) {
      console.error("Failed to check PR:", error);
    }
  };

  const {
    isFinishDialogOpen,
    isSavingWorkout,
    setIsFinishDialogOpen,
    finishWorkout,
    terminateWorkoutInstance,
    workoutSummary,
    setWorkoutSummary,
  } = useWorkoutSession(
    workoutInstanceId,
    workoutType,
    workoutInputData,
    comments,
    confirm,
    onTerminate,
  );

  //TOdo update run update and add isCOMPLETED LOGIC  as the workout input data is fetched from localstorage
  const [accordionValue, setAccordionValue] = useState<string[]>(() =>
    currentWorkoutExercises
      .map((_exercise, index) => {
        if (index === 0) {
          return generateAccordionItemId(index);
        }

        // if (index === 0 && workoutType === WorkoutTypeEnum.MULTI) {
        //   return generateAccordionItemId(index);
        // }

        return null;
      })
      .filter((item): item is string => item !== null),
  );

  const confettiRef = useRef<ConfettiRef>(null);

  const fireConfetti = () => {
    if (!confettiRef.current) return;
    confettiRef.current.fire({
      particleCount: 150,
      angle: 270,
      spread: 100,
      startVelocity: 30,
      gravity: 1,
      origin: { x: 0.5, y: -0.2 },
    });
  };

  useEffect(() => {
    if (workoutSummary) {
      fireConfetti();
    }
  }, [workoutSummary]);

  const handleCloseWorkoutSummary = () => {
    setWorkoutSummary(null);
    if (onFinish) {
      onFinish(workoutInstanceId);
    }

    if (workoutType === WorkoutTypeEnum.SINGLE) {
      router.push("/dashboard");
    }
  };

  function resetIndexRefreshRouter() {
    router.refresh();
    setSelectedExerciseIndex(null);
  }

  const onExercisesAdded = (onAddedParam: onExercisesAddedParam) => {
    addExercise(onAddedParam);
    resetIndexRefreshRouter();
  };

  const onExercisesReplaced = (onReplacedParam: onExercisesReplacedParam) => {
    replaceExercise(onReplacedParam);
    resetIndexRefreshRouter();
  };

  const onExercisesRemoved = (onRemovedParam: onExercisesRemovedParam) => {
    removeExercise(onRemovedParam);
    resetIndexRefreshRouter();
  };

  const onExercisesIncremented = (
    onIncrementedParam: onExercisesIncrementedParam,
  ) => {
    addSetToExercise(onIncrementedParam);
    resetIndexRefreshRouter();
  };

  const onExercisesDecremented = (
    onDecrementedParam: onExercisesDecrementedParam,
  ) => {
    removeSet(onDecrementedParam);
    resetIndexRefreshRouter();
  };

  const programPlanWorkoutId =
    workoutData.program_plan_instance_workout.program_plan_workout_id;

  const {
    allExercises,
    isSelectExerciseDialogOpen,
    setIsSelectExerciseDialogOpen,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    currentExerciseHistory,
    getHistoryForExerciseOpenDialog,
    setSelectExerciseDialogMode,
    removeExerciseAction,
    addSetExerciseAction,
    removeSetExerciseAction,
    selectExerciseConfirmAction,
  } = useExerciseActions(
    workoutInstanceId,
    programPlanWorkoutId,
    currentWorkoutExercises,
    selectedExerciseIndex,
    onExercisesAdded,
    onExercisesReplaced,
    onExercisesRemoved,
    onExercisesIncremented,
    onExercisesDecremented,
    currentUserId,
  );

  const activeExercise = useMemo(() => {
    if (selectedExerciseIndex === null) return null;
    return currentWorkoutExercises[selectedExerciseIndex];
  }, [currentWorkoutExercises, selectedExerciseIndex]);

  const currentExerciseName = useMemo(() => {
    if (!activeExercise?.exercise) return t("unknownExercise");
    const englishName = activeExercise.exercise.english_name;
    const hebrewName = activeExercise.exercise.hebrew_name;

    if (isHebrew && hebrewName) return hebrewName;
    else return englishName;
  }, [activeExercise, isHebrew, t]);

  const traineeName = useMemo(
    () =>
      `${
        workoutData?.program_plan_instance_workout?.program_plan?.user
          ?.first_name || ""
      } ${
        workoutData?.program_plan_instance_workout?.program_plan?.user
          ?.last_name || ""
      }`.trim(),
    [workoutData],
  );

  const cCompletedExercies = useMemo(() => {
    const res: boolean[] = [];
    if (!workoutInputData) return null;
    for (const exerciseSets of workoutInputData) {
      if (exerciseSets && exerciseSets.length > 0) {
        if (!exerciseSets[0].skipped) {
          res.push(true);
        } else {
          res.push(false);
        }
      }
    }
    return res;
  }, [workoutInputData]);

  const completedExercisesCount = useMemo(() => {
    let count = 0;
    if (!workoutInputData) return count;
    for (const exerciseSets of workoutInputData) {
      if (exerciseSets && exerciseSets.length > 0) {
        if (!exerciseSets[0].skipped) {
          count++;
        }
      }
    }
    return count;
  }, [workoutInputData]);

  if (!workoutInputData || currentWorkoutExercises.length === 0) {
    return <div></div>;
  }

  const handleAddExerciseClick = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setIsSelectExerciseDialogOpen(true);
    setSelectExerciseDialogMode(ActionEnum.ADD);
  };

  const handleReplaceExerciseClick = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setIsSelectExerciseDialogOpen(true);
    setSelectExerciseDialogMode(ActionEnum.REPLACE);
  };

  const handleAddSetClick = (exerciseIndex: number) => {
    const exercise = currentWorkoutExercises[exerciseIndex];
    addSetExerciseAction({
      programPlanWorkoutExerciseId: exercise.program_plan_workout_exercise_id,
      exerciseIndex,
    });
  };

  const handleRemoveSetClick = (exerciseIndex: number, setIndex: number) => {
    const exercise = currentWorkoutExercises[exerciseIndex];
    removeSetExerciseAction({
      programPlanWorkoutExerciseId: exercise.program_plan_workout_exercise_id,
      setIndex,
      exerciseIndex,
    });
  };

  const handleRemoveExerciseClick = async (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    const confirmed = await confirm({
      title: t("removeExerciseTitle"),
      message: t("removeExerciseMessage"),
      confirmLabel: tCommon("remove"),
      cancelLabel: tCommon("cancel"),
      onConfirm: () => {},
    });
    if (confirmed) {
      removeExerciseAction(exerciseIndex);
    }
  };

  //Add jsondoc
  /**
   * @param exerciseIndex - The index of the exercise to complete
   * @param prevState - Whether the exercise was previously skipped
   */
  //Add Logic to support added another according value to the next index
  const handleCompleteExerciseClick = (
    exerciseIndex: number,
    prevState: boolean,
  ) => {
    if (prevState) handlePRCheck(exerciseIndex);
    setAccordionValue((prev) => {
      if (prevState) {
        return prev.filter((item) => item !== `item-${exerciseIndex}`);
      }
      return prev;
    });
    toggleSkipExercise(exerciseIndex, !prevState);
  };

  const handleShowHistoryClick = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    getHistoryForExerciseOpenDialog(exerciseIndex);
  };

  const handleTerminateWorkoutInstanceClick = () => {
    terminateWorkoutInstance();
  };

  return (
    <div className="relative">
      <Card
        className={`flex transition-all duration-300 flex-col md:rounded-3xl px-4 pt-2 md:py-3 border-border   border-2 bg-background  `}
      >
        <Confetti
          ref={confettiRef}
          key={`confetti-${workoutInstanceId}`}
          className="absolute inset-0 z-50 h-full w-full pointer-events-none"
          manualstart
        />
        <div className="flex justify-between px-3 md:py-2">
          <div className="text-secondary-foreground flex-1 ">
            <h4
              className="text-lg font-semibold text-ellipsis line-clamp-1"
              title={workoutData.program_plan_instance_workout.english_name}
            >
              {workoutData.program_plan_instance_workout.english_name}
            </h4>
            <p className="truncate">{traineeName}</p>
          </div>

          <MasterActionsPopup
            workoutSummary={workoutSummary}
            onCloseWorkout={handleTerminateWorkoutInstanceClick}
          />
        </div>

        {!workoutSummary && (
          <div className="px-6">
            <ProgressBar
              completedExerciseArray={cCompletedExercies}
              total={currentWorkoutExercises.length}
            />
          </div>
        )}
        <div className="flex-1 ">
          {workoutSummary ? (
            <div>
              <WorkoutSummaryCard
                onClose={handleCloseWorkoutSummary}
                workoutSummary={workoutSummary}
              />
              {/* <pre>{JSON.stringify(workoutSummary, null, 2)}</pre> */}
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={accordionValue}
              onValueChange={setAccordionValue}
            >
              <ScrollArea className="h-full md:h-[calc(100vh-45vh)] lg:h-[calc(100vh-35vh)]  md:px-4">
                {currentWorkoutExercises.map((exerciseData, index: number) => (
                  <AccordionItem
                    dir={dir}
                    key={`${exerciseData.exercise.exercise_id}-${index}`}
                    className="mt-3 border-b-0 rounded-3xl bg-secondary"
                    value={`item-${index}`}
                  >
                    <AccordionTrigger
                      dir={dir}
                      className={`border 
                        
               rounded-3xl p-3  text-secondary-foreground
               duration-300
              data-[state=open]:border-b-1 data-[state=open]:rounded-b-none 
              ${cCompletedExercies?.[index] ? "border-primary text-muted-foreground " : " border-secondary-foreground/30"}
        `}
                    >
                      <div className="flex items-center gap-x-2">
                        <Label className="text-sm md:text-base text-ellipsis ">
                          {isHebrew
                            ? exerciseData.exercise.hebrew_name
                            : exerciseData.exercise.english_name}
                        </Label>

                        <CircleCheck
                          className={`w-4 h-4 duration-300
                      ${cCompletedExercies?.[index] ? "opacity-100" : "opacity-0"}
                      `}
                        />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {workoutInputData && workoutInputData[index] && (
                        <ExerciseCard
                          isExerciseCompleted={
                            cCompletedExercies?.[index] ?? false
                          }
                          pastExerciseComments={getPastExerciseComments(
                            exerciseData.exercise.exercise_id,
                          )}
                          exerciseData={exerciseData}
                          exerciseIndex={index}
                          workoutInputDataForExercise={workoutInputData[index]}
                          comment={comments[index]}
                          onCompleteExercise={handleCompleteExerciseClick}
                          onAddSetToExercise={handleAddSetClick}
                          onRemoveSet={handleRemoveSetClick}
                          onSetInputChange={setInputChange}
                          onCommentsChange={commentsChange}
                          onAddExercise={handleAddExerciseClick}
                          onReplaceExercise={handleReplaceExerciseClick}
                          onRemoveExercise={handleRemoveExerciseClick}
                          onShowHistory={handleShowHistoryClick}
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
                <div className="md:hidden flex justify-center my-3">
                  <Button
                    className="w-full rounded-3xl bg-primary  "
                    onClick={() => setIsFinishDialogOpen(true)}
                  >
                    {t("finishWorkout")}
                  </Button>
                </div>
              </ScrollArea>
              <div className="hidden  md:flex justify-center my-2 ">
                <Button
                  className="w-full rounded-3xl bg-primary  "
                  onClick={() => setIsFinishDialogOpen(true)}
                >
                  <span className="font-title font-bold text-base">
                    {t("finishWorkout")}
                  </span>
                </Button>
              </div>
            </Accordion>
          )}
        </div>
        <FinishWorkoutDialog
          title={workoutData.program_plan_instance_workout.english_name}
          isOpen={isFinishDialogOpen}
          isLoading={isSavingWorkout}
          completed={completedExercisesCount}
          total={currentWorkoutExercises.length}
          onOpenChange={setIsFinishDialogOpen}
          onConfirm={finishWorkout}
        />
        <SelectExerciseDialog
          isOpen={isSelectExerciseDialogOpen}
          exercises={allExercises}
          onOpenChange={(value) => {
            if (value === false) setSelectedExerciseIndex(null);
            setIsSelectExerciseDialogOpen(value);
          }}
          onConfirm={selectExerciseConfirmAction}
        />
        <ExerciseHistoryDialog
          isOpen={isHistoryDialogOpen}
          onOpenChange={(value) => {
            if (value === false) setSelectedExerciseIndex(null);
            setIsHistoryDialogOpen(value);
          }}
          exerciseHistory={currentExerciseHistory}
          activeExerciseName={currentExerciseName}
        />
        <ConfirmDialog />
      </Card>
    </div>
  );
}
