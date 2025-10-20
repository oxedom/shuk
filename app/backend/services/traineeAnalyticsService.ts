import type {
  DateRange,
  FrequencyAnalysisData,
  MuscleGroupVolumeData,
  PerformanceSummaryData,
  WorkoutSessionData,
} from "@guy-vaserman/shared-my-training-app";
import { Op } from "sequelize";
import {
  WorkoutInstance,
  WorkoutActivity,
  Exercise,
  ProgramPlanWorkout,
} from "app/backend/sequelize/models";

import {
  ProgramPlanWorkoutInstance,
  WorkoutActivityExerciseInstance,
  WorkoutInstanceInstance,
  WorkoutActivityWorkoutInstanceExerciseInstance,
} from "@guy-vaserman/shared-my-training-app";
import {
  WorkoutStatus,
  WorkoutTypeEnum,
} from "@guy-vaserman/shared-my-training-app";
import {
  countExercisesByActivities,
  countExerciseByCompletionStatus,
  calculateVolume,
  calculateTotalWeight,
  calculateAverageRpe,
  calculateAverageRir,
  groupActivitiesByExercise,
  processPersonalRecords,
} from "app/libs/calculations";
import { authorizeDataAccess } from "./authorizationService";

/**
 * Gets personal records for a user within a date range
 *
 * 🏋️ Single Responsibility: Data retrieval and orchestration
 * Uses pure calculation functions from @/libs for business logic
 */

export async function getMuscleGroupVolumeDistribution(
  userId: number,
  dateRange: DateRange,
): Promise<MuscleGroupVolumeData[]> {
  // TODO: Implement logic
  return [];
}

export async function getPersonalRecords(userId: number, dateRange: DateRange) {
  await authorizeDataAccess(userId);
  try {
    //interface WorkoutActivityWorkoutInstanceExercise
    // Data retrieval - the service's primary responsibility
    const activities = (await WorkoutActivity.findAll({
      include: [
        {
          model: WorkoutInstance,
          as: "workout_instance",
          where: {
            user_id: userId,
            start_time: {
              [Op.between]: [dateRange.startDate, dateRange.endDate],
            },
            workout_status: WorkoutStatus.COMPLETED,
          },
          attributes: ["start_time", "workout_instance_id"],
        },
        {
          model: Exercise,
          as: "exercise",
          attributes: ["exercise_id", "english_name", "hebrew_name"],
        },
      ],
      where: {
        skipped: false, // Only consider completed sets
        weight_score: { [Op.gt]: 0 }, // Must have weight
        repetitions: { [Op.gt]: 0 }, // Must have reps
      },
      attributes: ["weight_score", "repetitions", "exercise_id", "activity_id"],
      order: [
        [
          { model: WorkoutInstance, as: "workout_instance" },
          "start_time",
          "ASC",
        ],
      ],
    }).then((models) =>
      models.map((m) => m.toJSON()),
    )) as WorkoutActivityWorkoutInstanceExerciseInstance[];

    const exerciseGroups = groupActivitiesByExercise(activities);

    const personalRecords = processPersonalRecords(exerciseGroups);

    return personalRecords;
  } catch (error) {
    console.error("Error getting personal records:", error);
    throw new Error("Failed to get personal records");
  }
}

// === WORKOUT SESSION ANALYTICS ===

/**
 * Analyzes workout session volumes using Sequelize aggregations
 */

interface WorkoutInstanceActivitiesProgramPlanWorkout
  extends WorkoutInstanceInstance {
  workout_activities: WorkoutActivityExerciseInstance[];
  program_plan_instance_workout: ProgramPlanWorkoutInstance;
}

export async function getWorkoutSessionAnalysis(
  userId: number,
  dateRange: DateRange,
): Promise<WorkoutSessionData[]> {
  await authorizeDataAccess(userId);
  try {
    // Get completed workout instances with their activities and program plan workout
    let workoutInstances = await WorkoutInstance.findAll({
      where: {
        user_id: userId,
        start_time: {
          [Op.between]: [dateRange.startDate, dateRange.endDate],
        },
        workout_status: WorkoutStatus.COMPLETED,
      },
      include: [
        {
          model: WorkoutActivity,
          as: "workout_activities",
          attributes: [
            "weight_score",
            "repetitions",
            "skipped",
            "exercise_id",
            "rpe_score",
            "rir_score",
          ],
        },
        {
          model: ProgramPlanWorkout,
          as: "program_plan_instance_workout",
          attributes: [
            "english_name",
            "hebrew_name",
            "program_plan_workout_id",
          ],
        },
      ],
      order: [["start_time", "DESC"]], // Most recent first
    });

    const jsonWorkoutInstances = workoutInstances.map(
      (instance) =>
        instance.toJSON() as WorkoutInstanceActivitiesProgramPlanWorkout,
    );

    // Process each workout instance
    const sessionData: WorkoutSessionData[] = await Promise.all(
      jsonWorkoutInstances.map(async (instance) => {
        const activities = instance.workout_activities || [];

        // Calculate metrics using the existing helper function
        const totalVolume = calculateVolume(activities);
        const exerciseCount = countExercisesByActivities(activities);

        const completedExercisesCount = countExerciseByCompletionStatus(
          activities,
          true,
        );
        const skippedExercisesCount = countExerciseByCompletionStatus(
          activities,
          false,
        );

        const totalWeight = calculateTotalWeight(activities);

        // Calculate averages for RPE and RIR using utility functions
        const averageRpe = calculateAverageRpe(activities);
        const averageRir = calculateAverageRir(activities);

        return {
          workoutInstanceId: instance.workout_instance_id,
          date: instance.start_time,
          startTime: instance.start_time,
          endTime: instance.end_time || null,
          totalVolume,
          totalWeight,
          exerciseCount,
          completedExercises: completedExercisesCount,
          skippedExercises: skippedExercisesCount,
          averageRpe: averageRpe ? Math.round(averageRpe * 100) / 100 : null,
          averageRir: averageRir ? Math.round(averageRir * 100) / 100 : null,
          programPlanWorkout:
            instance.program_plan_instance_workout as ProgramPlanWorkoutInstance,
        };
      }),
    );

    return sessionData;
  } catch (error) {
    console.error("Error analyzing workout sessions:", error);
    throw new Error("Failed to analyze workout session data");
  }
}

export async function getWorkoutFrequencyPatterns(
  userId: number,
  dateRange: DateRange,
): Promise<FrequencyAnalysisData> {
  await authorizeDataAccess(userId);
  try {
    // Get all completed workouts with their start times and workout types
    const workouts = await WorkoutInstance.findAll({
      where: {
        user_id: userId,
        start_time: {
          [Op.between]: [dateRange.startDate, dateRange.endDate],
        },
        workout_status: WorkoutStatus.COMPLETED,
      },
      attributes: ["start_time", "workout_type"],
      order: [["start_time", "ASC"]], // Sort by date for calculating gaps
    });

    const totalWorkouts = workouts.length;

    // Calculate average workouts per week
    const totalDays = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const totalWeeks = totalDays / 7;
    const averageWorkoutsPerWeek =
      totalWeeks > 0 ? Math.round((totalWorkouts / totalWeeks) * 100) / 100 : 0;

    // Calculate average days between workouts
    let averageDaysBetweenWorkouts = 0;
    if (workouts.length > 1) {
      const dayGaps: number[] = [];

      for (let i = 1; i < workouts.length; i++) {
        const currentDate = new Date(workouts[i].start_time);
        const previousDate = new Date(workouts[i - 1].start_time);
        const daysDiff = Math.ceil(
          (currentDate.getTime() - previousDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        dayGaps.push(daysDiff);
      }

      averageDaysBetweenWorkouts =
        dayGaps.length > 0
          ? Math.round(
              (dayGaps.reduce((sum, gap) => sum + gap, 0) / dayGaps.length) *
                100,
            ) / 100
          : 0;
    }

    // Count single vs multi session workouts
    const singleSessionConut = workouts.filter(
      (workout) => workout.workout_type === WorkoutTypeEnum.SINGLE,
    ).length;
    const multiSessionCount = workouts.filter(
      (workout) => workout.workout_type === WorkoutTypeEnum.MULTI,
    ).length;

    return {
      period: dateRange,
      totalWorkouts,
      averageWorkoutsPerWeek,
      averageDaysBetweenWorkouts,
      singleSessionConut, // Note: keeping the typo from the interface
      multiSessionCount,
    };
  } catch (error) {
    console.error("Error analyzing workout frequency patterns:", error);
    throw new Error("Failed to analyze workout frequency patterns");
  }
}

/**
 * Generates overall trainee performance summary using other methods
 */
export async function getTraineePerformanceSummary(
  userId: number,
  dateRange: DateRange,
): Promise<PerformanceSummaryData> {
  await authorizeDataAccess(userId);
  try {
    // Get total completed workouts for the date range
    const totalWorkouts = await WorkoutInstance.count({
      where: {
        user_id: userId,
        start_time: {
          [Op.between]: [dateRange.startDate, dateRange.endDate],
        },
        workout_status: WorkoutStatus.COMPLETED,
      },
    });

    // Fetch workout activities for volume calculation
    const activitiesWithExercise = await WorkoutActivity.findAll({
      include: [
        {
          model: WorkoutInstance,
          attributes: ["user_id", "start_time", "workout_status"],
          as: "workout_instance",
          where: {
            user_id: userId,
            start_time: {
              [Op.between]: [dateRange.startDate, dateRange.endDate],
            },
            workout_status: WorkoutStatus.COMPLETED,
          },
        },
        {
          as: "exercise",
          model: Exercise,
          attributes: ["exercise_id", "english_name", "type"],
        },
      ],
      attributes: ["weight_score", "repetitions", "skipped", "exercise_id"],
    });

    const jsonActivities = activitiesWithExercise.map((a) =>
      a.toJSON(),
    ) as WorkoutActivityExerciseInstance[];

    // Calculate total volume using our helper function
    const totalVolume = calculateVolume(jsonActivities);

    const totalSets = jsonActivities.length;

    const totalWeight = calculateTotalWeight(jsonActivities);

    return {
      userId,
      period: dateRange,
      overallProgress: {
        totalWorkouts,
        totalVolume,
        totalSets,
        totalWeight,
      },
    };
  } catch (error) {
    console.error("Error generating performance summary:", error);
    throw new Error("Failed to generate trainee performance summary");
  }
}
