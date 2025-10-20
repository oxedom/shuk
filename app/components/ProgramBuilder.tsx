"use client";

import type {
  TraineeOption,
  ExerciseWithMuscles,
  MuscleInstance,
  WorkoutType,
  FullProgramPlan,
} from "@guy-vaserman/shared-my-training-app";

import {
  WEIGHT_SCORE,
  SET_NUMBER,
  REPETITIONS,
} from "app/shared/business-rules";

import type {
  ProgramPlanInput,
  ProgramPlanWorkoutInput,
} from "app/backend/services/programPlanService";
import {
  assignProgramToTrainee,
  getProgramPlanById,
  updateProgramPlan,
  addExercise,
} from "app/backend/actions";
import { AssignProgramDialog } from "app/components/dialogs/AssignProgramDialog";
import { LoadProgramDialog } from "app/components/dialogs/LoadProgramDialog";
import AddExerciseDialog from "app/components/dialogs/AddExerciseDialog";
import { useConfirmDialog } from "app/components/dialogs/ConfirmDialog";
import ProgramActions from "app/components/ProgramActions";
import { Tabs, TabsContent } from "app/components/ui/tabs";
import WorkoutContent from "app/components/WorkoutContent";
import WorkoutTabs from "app/components/WorkoutTabs";
import { toast } from "app/hooks/use-toast";
import useWorkoutManager from "app/hooks/useWorkoutManager";
import { cn, concatTraineeName } from "app/libs/utils";
import { useTranslations } from "next-intl";
import { use, useEffect, useMemo, useState } from "react";
import {
  ApiResponse,
  unwrapApiResponse,
} from "@guy-vaserman/shared-my-training-app";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { useRouter } from "next/navigation";
import { useLoadProgramFlow } from "app/hooks/useLoadProgramFlow";
import type { ProgramPlanExerciseInput } from "@guy-vaserman/shared-my-training-app";
import useGlobalStore from "app/store/globalStore";

// Transform function with proper types
function transformProgramData(data: {
  programTitle: string;
  workouts: WorkoutType[];
  userId: number;
  estimatedWorkouts?: number | null;
  makeMain?: boolean;
}): ProgramPlanInput {
  return {
    english_name: data.programTitle,
    hebrew_name: data.programTitle,
    is_active: true,
    is_locked: false,
    user_id: data.userId,
    workouts: data.workouts.map(
      (workout): ProgramPlanWorkoutInput => ({
        english_name: workout.name,
        hebrew_name: workout.name,
        comment: workout.comment || null,
        exercises: workout.exercises.map(
          (exercise): ProgramPlanExerciseInput => ({
            exercise_id: exercise.exercise_id,
            position: exercise.position,
            sets: exercise.sets,
            comment: exercise.comment || null,
            expected_min_kg: exercise.kg || null,
            expected_max_kg: exercise.kg || null,
            expected_min_reps: exercise.reps || null,
            expected_max_reps: exercise.reps || null,
            track_rpe_score: exercise.track_rpe_score || false,
            track_rir_score: exercise.track_rir_score || false,
          }),
        ),
      }),
    ),
    estimated_workouts: data.estimatedWorkouts || null,
    ...(data.makeMain && { make_main: data.makeMain }),
  };
}

export interface ProgramBuilderProps {
  data: Promise<
    [
      ApiResponse<ExerciseWithMuscles[] | null>,
      ApiResponse<MuscleInstance[] | null>,
      ApiResponse<TraineeOption[] | null>,
    ]
  >;
  className?: string;
}

export default function ProgramBuilder({
  data,
  className,
}: ProgramBuilderProps) {
  const { isHebrew, dir } = useLocaleInfo();
  const router = useRouter();
  //TODO Support Hebrew correctly
  const DEFAULT_PROGRAM_TITLE = isHebrew ? "תוכנית ללא שם" : "Untitled Program";
  // Program title state
  const [programTitle, setProgramTitle] = useState(DEFAULT_PROGRAM_TITLE);
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");
  const tAddExercise = useTranslations("Components.AddExerciseDialog");

  // Dialog states
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { closeSidebar } = useGlobalStore();

  // Load program flow hook and dialog state
  const {
    isLoadProgramDialogOpen,
    preselectedUserId,
    openLoadProgramDialog,
    closeLoadProgramDialog,
  } = useLoadProgramFlow();

  const [loadedProgramData, setLoadedProgramData] = useState<{
    user_id: number | null;
    program_plan_id: number | null;
  }>({ user_id: null, program_plan_id: null });

  const [isAssigning, setIsAssigning] = useState(false);

  // Workout management logic
  const {
    workouts,
    activeTabIndex,
    setActiveTabIndex,
    addWorkout,
    editWorkoutName,
    deleteWorkout,
    updateWorkoutComment,
    updateExerciseProperty,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    reorderExercise,
    emptyWorkoutExists,
    setWorkouts,
    createDefaultWorkout,
  } = useWorkoutManager();

  const [exercisesData, musclesData, traineesData] = use(data);

  const exercises = unwrapApiResponse(exercisesData);
  const muscles = unwrapApiResponse(musclesData);
  const trainees = unwrapApiResponse(traineesData);

  if (!exercises || !muscles || !trainees) {
    return <div>Error loading program builder data</div>;
  }

  const loadedProgramTrainee = useMemo(
    () =>
      trainees.find(
        (t) => t.user_id.toString() === loadedProgramData.user_id?.toString(),
      ),
    [trainees, loadedProgramData.user_id],
  );

  const handleUpdateProgramForTrainee = async () => {
    if (
      !loadedProgramData.program_plan_id ||
      !loadedProgramData.user_id ||
      !loadedProgramTrainee
    ) {
      toast({
        title: t("updateFailed"),
        description: t("noTraineeOrProgramSelected"),
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = await confirm({
      title: t("confirmUpdateTitle"),
      message: t("confirmUpdateMessage", {
        traineeName: concatTraineeName(loadedProgramTrainee),
        programTitle: programTitle,
      }),
      confirmLabel: t("updateProgram"),
      cancelLabel: tCommon("cancel"),
      onConfirm: () => {},
    });

    if (!confirmed) {
      return;
    }

    try {
      setIsAssigning(true);
      const transformedData = transformProgramData({
        programTitle,
        workouts,
        userId: loadedProgramData.user_id,
      });

      const result = await updateProgramPlan(
        loadedProgramData.program_plan_id,
        transformedData,
      );

      //clear the state of the program builder
      resetProgramData();

      if (result.success) {
        toast({
          title: t("updateSuccess"),
          description: t("programUpdatedSuccessfully", {
            traineeName: concatTraineeName(loadedProgramTrainee),
          }),
        });
      } else {
        toast({
          title: t("updateFailed"),
          description: result.message || t("updateFailed"),
        });
      }
    } catch (error) {
      toast({
        title: t("updateFailed"),
        description: error instanceof Error ? error.message : t("updateFailed"),
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Program title handling
  const handleTitleClick = () => {
    // 'TODO USE DIALOG'
    const newTitle = prompt("Enter a new program title:", programTitle);
    if (newTitle === null) return; // User cancelled

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setProgramTitle(DEFAULT_PROGRAM_TITLE);
    } else {
      setProgramTitle(trimmedTitle);
    }
  };

  // Assignment dialog handling
  const handleAssignButtonClick = () => {
    setIsAssignDialogOpen(true);
  };

  const handleAssignProgram = async ({
    userId,
    estimatedWorkouts = null,
    makeMain = false,
  }: {
    userId: number;
    estimatedWorkouts?: number | null;
    makeMain: boolean;
  }) => {
    if (activeTabIndex === -1) {
      alert(t("selectTraineeWorkout"));
      return;
    }

    const workout = workouts[activeTabIndex];
    if (!workout) return;

    const trainee = trainees.find((t) => t.user_id === userId);
    if (!trainee) return;

    try {
      setIsAssigning(true);

      const transformedData = transformProgramData({
        programTitle,
        workouts,
        userId,
        estimatedWorkouts,
        makeMain,
      });

      const result = await assignProgramToTrainee(transformedData);
      if (result.success) {
        toast({
          title: t("assignSuccess", {
            workoutName: workout.name,
            traineeName: concatTraineeName(trainee),
          }),
          description: t("assignSuccess", {
            workoutName: workout.name,
            traineeName: concatTraineeName(trainee),
          }),
        });
        setIsAssignDialogOpen(false);
        resetProgramData();
      } else {
        toast({
          title: t("assignFailed"),
          description: result.message || t("assignFailed"),
        });
      }
    } catch (error) {
      toast({
        title: t("assignFailed"),
        description: error instanceof Error ? error.message : t("assignFailed"),
      });
    } finally {
      setIsAssigning(false);
    }
  };

  function resetProgramData() {
    setLoadedProgramData({ user_id: null, program_plan_id: null });
    setProgramTitle(DEFAULT_PROGRAM_TITLE);
    setWorkouts([createDefaultWorkout()]);
    setActiveTabIndex(0);
  }

  const handleLoadProgram = async (programId: number) => {
    setLoadedProgramData({ user_id: null, program_plan_id: null });
    const { data, success, message } = await getProgramPlanById(programId);

    if (!success || !data) {
      toast({
        title: t(message),
        description: t(message),
      });
      return;
    }

    function setProgramPlanState(programPlanServer: FullProgramPlan) {
      setProgramTitle(programPlanServer.english_name);

      const parsedWorkouts = programPlanServer.program_plan_workouts.map(
        (workout) => {
          return {
            name: workout.english_name,
            comment: "",
            exercises: workout.program_plan_workout_exercises.map(
              (programPlanWorkoutExercise) => {
                return {
                  comment: "",
                  english_name:
                    programPlanWorkoutExercise.exercise.english_name,
                  exercise_id: programPlanWorkoutExercise.exercise.exercise_id,
                  hebrew_name: programPlanWorkoutExercise.exercise.hebrew_name,
                  kg:
                    programPlanWorkoutExercise.expected_min_kg ||
                    WEIGHT_SCORE.default,
                  position: programPlanWorkoutExercise.position,
                  gym_id: programPlanWorkoutExercise.exercise.gym_id,
                  reps:
                    programPlanWorkoutExercise.expected_min_reps ||
                    REPETITIONS.default,
                  sets: programPlanWorkoutExercise.sets || SET_NUMBER.default,
                  createdAt: programPlanWorkoutExercise.createdAt,
                  updatedAt: programPlanWorkoutExercise.updatedAt,
                  type: programPlanWorkoutExercise.exercise.type,
                  created_by: programPlanWorkoutExercise.exercise.created_by,
                  track_rpe_score: programPlanWorkoutExercise.track_rpe_score
                    ? true
                    : false,
                  track_rir_score: programPlanWorkoutExercise.track_rir_score
                    ? true
                    : false,
                  muscles: programPlanWorkoutExercise.exercise.muscles,
                };
              },
            ),
          };
        },
      );
      setWorkouts(parsedWorkouts);
      setActiveTabIndex(0);
      closeLoadProgramDialog();
    }

    const { first_name, last_name } = data.user;
    const programName = data.english_name;
    const traineeName = `${first_name} ${last_name}`;
    setLoadedProgramData({
      user_id: data.user_id,
      program_plan_id: data.program_plan_id,
    });
    setProgramPlanState(data);
    toast({
      duration: 4000,
      title: t("programLoadedSuccessfully", { traineeName, programName }),
      description: t("programLoadedSuccessfully", { traineeName, programName }),
    });
  };

  const handleCancelLoadProgram = () => {
    closeLoadProgramDialog();
  };

  // Exercise handling
  const handleExerciseAdd = (exercise: ExerciseWithMuscles) => {
    if (activeTabIndex === -1) return;
    addExerciseToWorkout(activeTabIndex, exercise);
  };

  const handleCreateExercise = async (exerciseData: {
    english_name: string;
    hebrew_name: string;
    type: "TIME_WEIGHT" | "WEIGHT" | "TIME";
  }) => {
    try {
      const result = await addExercise(exerciseData);
      if (result.success) {
        toast({
          title: tAddExercise("exerciseCreated"),
          description: `${exerciseData.english_name} / ${exerciseData.hebrew_name}`,
        });
      } else {
        toast({
          title: tAddExercise("exerciseCreationFailed"),
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: tAddExercise("exerciseCreationFailed"),
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
    router.refresh();
  };

  // Prevent multiple dialogs from being open simultaneously
  useEffect(() => {
    if (isAssignDialogOpen && isLoadProgramDialogOpen) {
      closeLoadProgramDialog();
    }
  }, [isAssignDialogOpen, isLoadProgramDialogOpen, closeLoadProgramDialog]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  }, []);

  return (
    <div className={cn("lg:mx-8", className)}>
      <h4
        className="text-xl font-bold mb-2 cursor-pointer hover:text-primary transition-colors"
        onClick={handleTitleClick}
        title={t("clickToEditProgramTitle")}
      >
        {programTitle}
      </h4>

      <Tabs
        value={activeTabIndex.toString()}
        onValueChange={(value) => setActiveTabIndex(Number.parseInt(value))}
        className="rounded-lg"
      >
        <div dir={dir} className="flex justify-between gap-2 items-center">
          <WorkoutTabs
            workouts={workouts}
            activeTabIndex={activeTabIndex}
            setActiveTabIndex={setActiveTabIndex}
            onDeleteWorkout={deleteWorkout}
            onAddWorkout={addWorkout}
          />
          <ProgramActions
            onLoadExistingProgram={openLoadProgramDialog}
            onAddExerciseClick={() => setIsAddExerciseDialogOpen(true)}
          />
        </div>

        {workouts.map((workout, index) => (
          <TabsContent key={index} value={index.toString()}>
            <WorkoutContent
              workout={workout}
              index={index}
              exercises={exercises}
              muscles={muscles}
              onUpdateProgram={handleUpdateProgramForTrainee}
              loadedProgramData={loadedProgramData}
              traineeName={loadedProgramTrainee?.first_name || ""}
              isUpdating={isAssigning}
              onEditName={() => editWorkoutName(index)}
              onAssign={handleAssignButtonClick}
              assignButtonDisabled={isAssigning || emptyWorkoutExists}
              onUpdateComment={(comment) =>
                updateWorkoutComment(index, comment)
              }
              onAddExercise={handleExerciseAdd}
              onRemoveExercise={(exerciseId) =>
                removeExerciseFromWorkout(index, exerciseId)
              }
              onReorderExercise={(exerciseId, newPosition) =>
                reorderExercise(index, exerciseId, newPosition)
              }
              onUpdateExercise={(exerciseId, property, value) =>
                updateExerciseProperty(index, exerciseId, property, value)
              }
            />
          </TabsContent>
        ))}
      </Tabs>

      <AssignProgramDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        trainees={trainees}
        onAssign={handleAssignProgram}
        isAssigning={isAssigning}
      />

      <LoadProgramDialog
        isOpen={isLoadProgramDialogOpen}
        onOpenChange={closeLoadProgramDialog}
        trainees={trainees}
        onLoadProgram={handleLoadProgram}
        onCancel={handleCancelLoadProgram}
        preselectedUserId={preselectedUserId}
      />

      <AddExerciseDialog
        isOpen={isAddExerciseDialogOpen}
        onClose={() => setIsAddExerciseDialogOpen(false)}
        onAddExercise={handleCreateExercise}
      />

      <ConfirmDialog />
    </div>
  );
}
