import { WorkoutInstance } from "../sequelize/models";
import {
  WorkoutInstanceInstance,
  WorkoutStatus,
} from "@guy-vaserman/shared-my-training-app";
import { Op } from "sequelize";

export async function getWorkoutInstanceById(workoutInstanceId: number) {
  const workoutInstance = (await WorkoutInstance.findByPk(
    workoutInstanceId,
  ).then((model) => model?.toJSON())) as WorkoutInstanceInstance | null;
  if (!workoutInstance) {
    throw new Error("Workout instance not found");
  }
  return workoutInstance;
}

export async function getPreviousWorkoutInstanceByPPWId(
  programPlanWorkoutId: number,
  userId: number,
  beforeDate: Date,
) {
  const previousInstance = (await WorkoutInstance.findOne({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
      user_id: userId,
      workout_status: WorkoutStatus.COMPLETED,
      end_time: {
        [Op.lt]: beforeDate,
      },
    },
    order: [["end_time", "DESC"]],
  }).then((model) => model?.toJSON())) as WorkoutInstanceInstance | null;

  return previousInstance;
}
