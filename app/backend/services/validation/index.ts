import {
  WorkoutInstanceInstance,
  WorkoutStatus,
  WorkoutActivityInstance,
} from "@guy-vaserman/shared-my-training-app";

type CompletedWorkoutInstance = Omit<
  WorkoutInstanceInstance,
  "workout_status"
> & {
  workout_status: WorkoutStatus.COMPLETED;
  end_time: Date;
};
export function validateCompletedWorkoutInstance(
  workoutInstance: WorkoutInstanceInstance,
): asserts workoutInstance is CompletedWorkoutInstance {
  if (workoutInstance.workout_status !== WorkoutStatus.COMPLETED) {
    throw new Error("Workout instance is not completed");
  }
}

export function validateEndTime(
  workoutInstance: WorkoutInstanceInstance,
): asserts workoutInstance is CompletedWorkoutInstance {
  if (!workoutInstance.end_time) {
    throw new Error("Workout instance end time is required");
  }
}

export function validateLengthOfWorkoutActivities(
  workoutActivities: WorkoutActivityInstance[],
) {
  if (workoutActivities.length === 0) {
    throw new Error("Length of workout activities is 0");
  }
}

export function validateWorkoutActivitiesShareTheSameWorkoutInstanceId(
  workoutActivities: WorkoutActivityInstance[],
  workoutInstance: WorkoutInstanceInstance,
) {
  const allWorkoutActivitiesHaveTheSameId = workoutActivities.every(
    (activity) =>
      activity.workout_instance_id === workoutInstance.workout_instance_id,
  );
  if (!allWorkoutActivitiesHaveTheSameId) {
    throw new Error(
      "All workout activities must have the same workout instance id",
    );
  }
}
