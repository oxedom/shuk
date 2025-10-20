import { ExerciseComment } from "../sequelize/models";
import { ExerciseCommentInstance } from "@guy-vaserman/shared-my-training-app";

export async function getExerciseCommentsByProgramPlanWorkoutId(
  programPlanWorkoutId: number,
) {
  const exerciseComments = (await ExerciseComment.findAll({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
    },
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as ExerciseCommentInstance[];
  return exerciseComments;
}
