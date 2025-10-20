import {
  WorkoutActivityWorkoutInstanceExerciseInstance,
  WorkoutActivityExerciseInstance,
  WorkoutActivityInstance,
  WorkoutInstanceInstance,
} from "@guy-vaserman/shared-my-training-app";
import { ExercisePersonalRecord } from "@guy-vaserman/shared-my-training-app";
import { validateWorkoutActivitiesShareTheSameWorkoutInstanceId } from "app/backend/services/validation";
import { mapWorkoutActivitiesByExerciseId } from "../wrangling";
import { PersonalRecord } from "@guy-vaserman/shared-my-training-app";

// Utility function to parse exercise ID from string
function parseExerciseId(exerciseIdStr: string): number {
  return parseInt(exerciseIdStr, 10);
}

// Generic function to get the highest weight score from workout activities
function getMaxWeightScore<T extends { weight_score?: number | null }>(
  activities: T[],
): number | null {
  return activities.reduce((acc: number | null, activity) => {
    if (!activity.weight_score) return acc;
    const activityWeightScore: number = activity.weight_score;
    if (acc === null) return activityWeightScore;
    if (acc < activityWeightScore) return activityWeightScore;
    return acc;
  }, null);
}

// Factory function to create PersonalRecord objects
function createPersonalRecord(
  newRecord: number,
  previousRecord: number | null = null,
): PersonalRecord {
  const improvement =
    previousRecord === null ? newRecord : newRecord - previousRecord;

  return {
    improvement,
    newRecord,
    previousRecord,
  };
}

// Function to clean up null records from the result map
function cleanupNullRecords(
  recordMap: Record<number, PersonalRecord | null>,
): Record<number, PersonalRecord | null> {
  Object.keys(recordMap).forEach((key) => {
    const exerciseId = parseExerciseId(key);
    if (recordMap[exerciseId] === null) {
      delete recordMap[exerciseId];
    }
  });
  return recordMap;
}

export function calculateWorkoutSummaryPR(
  mostRecentWorkoutActivities: WorkoutActivityWorkoutInstanceExerciseInstance[],
  recordWorkoutActivities: WorkoutActivityExerciseInstance[],
  corrospondingWorkoutInstance: WorkoutInstanceInstance,
): Record<number, PersonalRecord | null> {
  //check that recent workout activties have the same workout instance id
  validateWorkoutActivitiesShareTheSameWorkoutInstanceId(
    mostRecentWorkoutActivities,
    corrospondingWorkoutInstance,
  );

  const recentWorkoutActivitiesMap = mapWorkoutActivitiesByExerciseId(
    mostRecentWorkoutActivities,
  );

  const recordMap = mapWorkoutActivitiesByExerciseId(recordWorkoutActivities);

  const res: Record<number, PersonalRecord | null> = {};

  for (const [exerciseIdStr, recentWorkoutActivities] of Object.entries(
    recentWorkoutActivitiesMap,
  )) {
    const exerciseId = parseExerciseId(exerciseIdStr);
    if (res[exerciseId] === undefined) {
      res[exerciseId] = null;
    }

    const maxRecentWeightScore = getMaxWeightScore(recentWorkoutActivities);

    // Skip if no weight score found in recent activities
    if (maxRecentWeightScore === null) {
      continue;
    }

    // Get previous record activities for this exercise
    const previousRecordActivities = recordMap[exerciseId];

    if (!previousRecordActivities || previousRecordActivities.length === 0) {
      // No previous record - this is a new record
      res[exerciseId] = createPersonalRecord(maxRecentWeightScore);
    } else {
      const maxPreviousWeightScore = getMaxWeightScore(
        previousRecordActivities,
      );

      if (maxPreviousWeightScore === null) {
        // Previous record had no weight scores - treat as new record
        res[exerciseId] = createPersonalRecord(maxRecentWeightScore);
      } else if (maxRecentWeightScore > maxPreviousWeightScore) {
        // New personal record
        res[exerciseId] = createPersonalRecord(
          maxRecentWeightScore,
          maxPreviousWeightScore,
        );
      } else {
        // No new record
        res[exerciseId] = null;
      }
    }
  }

  return cleanupNullRecords(res);
}

export function calculateTotalWeight(
  workoutActivities: WorkoutActivityInstance[],
): number {
  return workoutActivities.reduce((acc, activity) => {
    if (activity.skipped) return acc;
    const activityWeightScore = activity.weight_score;
    if (activityWeightScore) acc = acc + activityWeightScore;
    return acc;
  }, 0);
}

export function getTotalWorkoutSets(activities: WorkoutActivityInstance[]) {
  return activities.reduce((acc, activity) => {
    if (activity.skipped) return acc;
    return acc + 1;
  }, 0);
}

export function countExerciseByCompletionStatus(
  activities: WorkoutActivityInstance[],
): number {
  // Get unique exercise IDs to avoid counting the same exercise multiple times
  const uniqueExerciseIds = [...new Set(activities.map((a) => a.exercise_id))];

  const totalSkippedExercises = uniqueExerciseIds.reduce((acc, exerciseId) => {
    const exerciseActivities = activities.filter(
      (a) => a.exercise_id === exerciseId,
    );
    const allSetsSkipped = exerciseActivities.every((a) => a.skipped);
    if (allSetsSkipped) {
      acc = acc + 1;
    }
    return acc;
  }, 0);
  return totalSkippedExercises;
}
