import {
  DateRange,
  WorkoutActivityExerciseInstance,
  WorkoutActivityInstance,
  WorkoutActivityWorkoutInstanceExerciseInstance,
  WorkoutStatus,
} from "@guy-vaserman/shared-my-training-app";
import { Exercise, WorkoutActivity } from "../sequelize/models";
import { getWorkoutInstanceById } from "./WorkoutInstance";
import { sequelize } from "../sequelize";
import { QueryTypes } from "sequelize";

export async function getWorkoutActivitiesByInstanceId(
  workoutInstanceId: number,
) {
  if (!workoutInstanceId) {
    throw new Error("Workout instance id is required");
  }

  const workoutActivities = (await WorkoutActivity.findAll({
    where: {
      workout_instance_id: workoutInstanceId,
    },
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as WorkoutActivityExerciseInstance[];

  return workoutActivities;
}

export async function getWorkoutActivitiesExerciseByInstanceId(
  workoutInstanceId: number,
) {
  if (!workoutInstanceId) {
    throw new Error("Workout instance id is required");
  }

  const workoutInstance = await getWorkoutInstanceById(workoutInstanceId);
  if (workoutInstance.workout_status !== WorkoutStatus.COMPLETED) {
    throw new Error("Workout instance must be completed");
  }

  const workoutActivities = (await WorkoutActivity.findAll({
    where: {
      workout_instance_id: workoutInstanceId,
    },
    include: [
      {
        model: Exercise,
        as: "exercise",
      },
    ],
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as WorkoutActivityExerciseInstance[];

  return workoutActivities;
}

export async function getWorkoutActivitiesByWorkoutInstanceId(
  workoutInstanceId: number,
) {
  if (!workoutInstanceId) {
    throw new Error("Workout instance id is required");
  }

  const workoutActivities = (await WorkoutActivity.findAll({
    where: {
      workout_instance_id: workoutInstanceId,
    },
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as WorkoutActivityInstance[];

  return workoutActivities;
}

export async function getPreviousRecords(
  userId: number,
  endDate: Date,
  exerciseIds: number[],
) {
  if (!userId) {
    throw new Error("User id is required");
  }

  function buildGetPreviousRecordsQuery(params: {
    userId: number;
    endDate: Date;
    exerciseIds: number[];
  }): { query: string; replacements: Record<string, any> } {
    const query = `
      WITH max_scores AS (
        SELECT
          wa.exercise_id,
          MAX(wa.weight_score) as max_weight_score
        FROM workout_activities wa
        INNER JOIN workout_instances wi ON wa.workout_instance_id = wi.workout_instance_id
        INNER JOIN users u ON wi.user_id = u.user_id
        WHERE wi.user_id = :userId
          AND wa.exercise_id = ANY(ARRAY[:exerciseIds])
          AND wa.skipped = false
          AND wa.weight_score IS NOT NULL
          AND wi.workout_status = '${WorkoutStatus.COMPLETED}'
          AND wi.end_time BETWEEN u."createdAt" AND :endDate
        GROUP BY wa.exercise_id
      )
      SELECT DISTINCT ON (wa.exercise_id)
        wa.activity_id,
        wa.exercise_id,
        wa.workout_instance_id,
        wa.skipped,
        CAST(wa.weight_score AS DECIMAL) as weight_score,
        wa.time_score,
        wa.rpe_score,
        wa.rir_score,
        wa.set_number,
        wa.exercise_position,
        CAST(wa.repetitions AS DECIMAL) as repetitions,
        wa."createdAt",
        wa."updatedAt",
        e.english_name as exercise_name,
        e.hebrew_name,
        wi.end_time as workout_end_time
      FROM workout_activities wa
      INNER JOIN workout_instances wi ON wa.workout_instance_id = wi.workout_instance_id
      INNER JOIN exercises e ON wa.exercise_id = e.exercise_id
      INNER JOIN max_scores ms ON wa.exercise_id = ms.exercise_id AND wa.weight_score = ms.max_weight_score
      INNER JOIN users u ON wi.user_id = u.user_id
      WHERE wi.user_id = :userId
        AND wa.exercise_id = ANY(ARRAY[:exerciseIds])
        AND wa.skipped = false
        AND wa.weight_score IS NOT NULL
        AND wi.workout_status = '${WorkoutStatus.COMPLETED}'
        AND wi.end_time BETWEEN u."createdAt" AND :endDate
      ORDER BY wa.exercise_id, wi.end_time DESC
    `;

    const replacements = {
      userId: params.userId,
      endDate: params.endDate,
      exerciseIds: params.exerciseIds,
    };

    return { query, replacements };
  }

  const { query, replacements } = buildGetPreviousRecordsQuery({
    userId,
    endDate,
    exerciseIds,
  });

  const allActivities = (await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  })) as WorkoutActivityExerciseInstance[];

  return allActivities;
}
