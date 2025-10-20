// app/backend/services/performanceTrackingService.ts
import {
  WorkoutInstance,
  WorkoutActivity,
  Exercise,
  WorkoutInstanceModelType,
  WorkoutActivityModelType,
  WorkoutActivityIncludesExerciseModel,
} from "../sequelize/models";

import { Op } from "sequelize";
import {
  WorkoutStatus,
  ExerciseInstance,
  WorkoutActivityInstance,
  WorkoutInstanceInstance,
  ExercisePersonalRecord,
  WorkoutActivityWorkoutInstanceExerciseInstance,
} from "@guy-vaserman/shared-my-training-app";

import {
  ExercisePerformanceChange,
  WorkoutActivitySnapshot,
  MetricChange,
  SetChange,
  SetChangeType,
} from "@guy-vaserman/shared-my-training-app";

async function getPreviousWorkoutInstance(
  programPlanWorkoutId: number,
  userId: number,
  beforeDate: Date,
): Promise<WorkoutInstanceModelType | null> {
  const previousInstance = await WorkoutInstance.findOne({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
      user_id: userId,
      workout_status: WorkoutStatus.COMPLETED,
      end_time: {
        [Op.lt]: beforeDate,
      },
    },
    order: [["end_time", "DESC"]],
  });

  return previousInstance;
}

function calculateMetricChange(
  previousValue: number | null,
  currentValue: number | null,
): MetricChange | null {
  // If both values are the same or both null, no change
  if (previousValue === currentValue) {
    return null;
  }

  const hasNullComparison = previousValue === null || currentValue === null;
  let absoluteChange: number;
  let percentageChange: number | null = null;

  if (previousValue === null && currentValue !== null) {
    // First time doing this exercise
    absoluteChange = currentValue;
  } else if (previousValue !== null && currentValue === null) {
    // Performance dropped to null (shouldn't happen in practice)
    absoluteChange = -previousValue;
  } else if (previousValue !== null && currentValue !== null) {
    // Normal comparison
    absoluteChange = currentValue - previousValue;
    percentageChange = parseFloat(
      ((absoluteChange / previousValue) * 100).toFixed(2),
    );
  } else {
    // Both null (shouldn't trigger this function)
    return null;
  }

  return {
    previous_value: previousValue,
    current_value: currentValue,
    absolute_change: absoluteChange,
    percentage_change: percentageChange,
    has_null_comparison: hasNullComparison,
  };
}

function calculateSetChange(
  previousSetCount: number,
  currentSetCount: number,
): SetChange | null {
  if (previousSetCount === currentSetCount) {
    return null;
  }

  const setDifference = currentSetCount - previousSetCount;
  let setChangeType: SetChangeType;

  if (setDifference > 0) {
    setChangeType = SetChangeType.ADDED_SETS;
  } else if (setDifference < 0) {
    setChangeType = SetChangeType.REMOVED_SETS;
  } else {
    setChangeType = SetChangeType.SAME_SETS;
  }

  return {
    previous_set_count: previousSetCount,
    current_set_count: currentSetCount,
    set_difference: setDifference,
    set_change_type: setChangeType,
  };
}

function findBestPerformance(
  activities: WorkoutActivityInstance[],
  metric: "weight_score" | "repetitions",
) {
  // Filter out skipped activities
  const validActivities = activities.filter((activity) => !activity.skipped);

  if (validActivities.length === 0) {
    return null;
  }

  // Find the activity with the best performance for the given metric
  const bestActivity = validActivities.reduce((best, current) => {
    const bestValue = best[metric];
    const currentValue = current[metric];

    // Handle null values - treat null as 0 for comparison
    const bestNum = bestValue ?? 0;
    const currentNum = currentValue ?? 0;

    return currentNum > bestNum ? current : best;
  });

  return bestActivity;
}

function createWorkoutActivitySnapshot(
  activity: WorkoutActivityInstance | null,
  workoutDate: Date,
): WorkoutActivitySnapshot {
  if (!activity) {
    return {
      weight_score: null,
      repetitions: null,
      set_number: 0,
      workout_date: workoutDate,
    };
  }

  return {
    weight_score: activity.weight_score,
    repetitions: activity.repetitions,
    set_number: activity.set_number,
    workout_date: workoutDate,
  };
}

export async function calculateWorkoutPerformanceChanges(
  workoutInstanceId: number,
  userId: number,
): Promise<ExercisePerformanceChange[]> {
  // Get current workout instance
  const currentWorkout = await WorkoutInstance.findByPk(workoutInstanceId);
  if (!currentWorkout) {
    throw new Error("Workout instance not found");
  }

  if (currentWorkout.get("workout_status") !== WorkoutStatus.COMPLETED) {
    throw new Error(
      "Workout must be completed to calculate performance changes",
    );
  }

  //WorkoutActivityIncludesExerciseModel

  // Get current workout activities
  const currentActivities = (await WorkoutActivity.findAll({
    where: {
      workout_instance_id: workoutInstanceId,
    },
    include: [
      {
        model: Exercise,
        as: "exercise",
      },
    ],
  })) as WorkoutActivityIncludesExerciseModel[];

  if (currentActivities.length === 0) {
    return [];
  }

  // Get previous workout instance for the same program plan workout
  const programPlanWorkoutId = currentWorkout.program_plan_workout_id;

  const currentEndTime = currentWorkout.end_time;
  if (!currentEndTime) {
    throw new Error("Current workout end time is null");
  }

  const previousWorkout = await getPreviousWorkoutInstance(
    programPlanWorkoutId,
    userId,
    currentEndTime,
  );

  let previousActivities: WorkoutActivityModelType[] = [];
  if (previousWorkout) {
    previousActivities = await WorkoutActivity.findAll({
      where: {
        workout_instance_id: previousWorkout.get("workout_instance_id"),
      },
    });
  }

  // Group activities by exercise
  const currentExerciseGroups = currentActivities.reduce(
    (groups, activity) => {
      const exerciseId = activity.activity_id;
      if (!groups[exerciseId]) {
        groups[exerciseId] = [];
      }
      groups[exerciseId].push(activity.toJSON() as WorkoutActivityInstance);
      return groups;
    },
    {} as Record<number, WorkoutActivityInstance[]>,
  );

  const previousExerciseGroups = previousActivities.reduce(
    (groups, activity) => {
      const exerciseId = activity.activity_id;
      if (!groups[exerciseId]) {
        groups[exerciseId] = [];
      }
      groups[exerciseId].push(activity.toJSON() as WorkoutActivityInstance);
      return groups;
    },
    {} as Record<number, WorkoutActivityInstance[]>,
  );

  const performanceChanges: ExercisePerformanceChange[] = [];

  // Analyze each exercise in current workout
  for (const [exerciseIdStr, currentExerciseActivities] of Object.entries(
    currentExerciseGroups,
  )) {
    const exerciseId = parseInt(exerciseIdStr);
    const previousExerciseActivities = previousExerciseGroups[exerciseId] || [];

    // Get exercise details
    const exerciseActivity = currentActivities.find(
      (a) => a.exercise_id === exerciseId,
    );
    if (!exerciseActivity) continue;

    const exercise = exerciseActivity.exercise;
    const exerciseData = exercise.toJSON() as ExerciseInstance;

    // Find best performances for each metric
    const currentBestWeight = findBestPerformance(
      currentExerciseActivities,
      "weight_score",
    );
    const currentBestReps = findBestPerformance(
      currentExerciseActivities,
      "repetitions",
    );
    const previousBestWeight = findBestPerformance(
      previousExerciseActivities,
      "weight_score",
    );
    const previousBestReps = findBestPerformance(
      previousExerciseActivities,
      "repetitions",
    );

    // Calculate metric changes
    const weightChange = calculateMetricChange(
      previousBestWeight?.weight_score ?? null,
      currentBestWeight?.weight_score ?? null,
    );

    const repsChange = calculateMetricChange(
      previousBestReps?.repetitions ?? null,
      currentBestReps?.repetitions ?? null,
    );

    // Calculate set count change
    const currentSetCount = currentExerciseActivities.filter(
      (a) => !a.skipped,
    ).length;
    const previousSetCount = previousExerciseActivities.filter(
      (a) => !a.skipped,
    ).length;
    const setChange = calculateSetChange(previousSetCount, currentSetCount);

    // If no changes detected, skip this exercise
    if (!weightChange && !repsChange && !setChange) {
      continue;
    }

    // Create snapshots - use best overall performance (prioritize weight over reps)
    const currentBest = currentBestWeight || currentBestReps;
    const previousBest = previousBestWeight || previousBestReps;

    const currentSnapshot = createWorkoutActivitySnapshot(
      currentBest,
      currentEndTime,
    );

    const previousSnapshot = createWorkoutActivitySnapshot(
      previousBest,
      (previousWorkout?.get("end_time") as Date) || currentEndTime,
    );

    performanceChanges.push({
      exercise: exerciseData,
      changes: {
        weight: weightChange,
        repetitions: repsChange,
        sets: setChange,
      },
      previous_best: previousSnapshot,
      current_performance: currentSnapshot,
    });
  }

  return performanceChanges;
}
