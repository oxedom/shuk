import {
  WorkoutActivityExerciseInstance,
  ExerciseInstance,
} from "@guy-vaserman/shared-my-training-app";

export function mapWorkoutActivitiesByExerciseId<
  T extends { exercise_id: number },
>(activities: T[]): Record<number, T[]> {
  const exerciseIdMap: Record<number, T[]> = {};

  activities.forEach((activity) => {
    const exerciseId = activity.exercise_id;

    if (exerciseIdMap[exerciseId] === undefined) {
      exerciseIdMap[exerciseId] = [activity];
    } else {
      exerciseIdMap[exerciseId].push(activity);
    }
  });

  return exerciseIdMap;
}

export function getExerciseMapFromWorkoutActivitiesExercise(
  activities: WorkoutActivityExerciseInstance[],
) {
  const exerciseMap: { [key: number]: ExerciseInstance } = {};
  activities.forEach((activity) => {
    if (!exerciseMap[activity.exercise_id]) {
      const possibleExercise = activity.exercise;
      exerciseMap[activity.exercise_id] = possibleExercise;
    }
  });

  return exerciseMap;
}

export function getExerciseIdMapFromWorkoutActivitiesExercise(
  activities: WorkoutActivityExerciseInstance[],
) {
  const exerciseIdMap: { [key: number]: WorkoutActivityExerciseInstance } = {};
  activities.forEach((activity) => {
    exerciseIdMap[activity.exercise_id] = activity;
  });
  return exerciseIdMap;
}
