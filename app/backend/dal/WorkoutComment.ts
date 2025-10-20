import { WorkoutCommentInstance } from "node_modules/@guy-vaserman/shared-my-training-app/src/types";
import { WorkoutComment } from "../sequelize/models";

export async function getWorkoutCommentsByProgramPlanWorkoutId(
  programPlanWorkoutId: number,
) {
  const workoutComments = (await WorkoutComment.findAll({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
    },
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as WorkoutCommentInstance[];
  return workoutComments;
}
