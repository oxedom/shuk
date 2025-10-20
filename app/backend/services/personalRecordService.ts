// app/backend/services/personalRecordService.ts
import {
  WorkoutStatus,
  PersonalRecordCheckResult,
} from "@guy-vaserman/shared-my-training-app";
import { WorkoutActivity, WorkoutInstance } from "../sequelize/models";
import { Op } from "sequelize";
import { authorizeDataAccess } from "./authorizationService";

export async function getPreviousRecord(
  exerciseId: number,
  userId: number,
): Promise<number | null> {
  const previousBest = await WorkoutActivity.findOne({
    where: {
      exercise_id: exerciseId,
      skipped: false,
      weight_score: {
        [Op.ne]: null,
      },
    },
    include: [
      {
        model: WorkoutInstance,
        as: "workout_instance",
        required: true,
        where: {
          user_id: userId,
          workout_status: WorkoutStatus.COMPLETED,
        },
      },
    ],
    order: [["weight_score", "DESC"]],
    limit: 1,
  });

  if (!previousBest) return null;

  const weightScore = previousBest.weight_score;

  return weightScore || null;
}

export async function checkIfNewRecord(
  exerciseId: number,
  newWeightScore: number,
  userId: number,
): Promise<PersonalRecordCheckResult> {
  await authorizeDataAccess(userId);
  const previousRecord = await getPreviousRecord(exerciseId, userId);

  // If no previous record exists, this is automatically a new record
  if (previousRecord === null) {
    return {
      isNewRecord: true,
      previousRecord: null,
      newRecord: newWeightScore,
      improvement: newWeightScore,
    };
  }

  const isNewRecord = newWeightScore > previousRecord;
  const improvement = isNewRecord ? newWeightScore - previousRecord : 0;

  return {
    isNewRecord,
    previousRecord,
    newRecord: newWeightScore,
    improvement,
  };
}
