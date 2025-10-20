import {
  MuscleInvolvementEnum,
  ExerciseWithMuscles,
  MuscleInvolvementPointsEnum,
} from "../types";

interface MusclePoints {
  [muscleId: number]: number;
}

export const calculateMusclePointsForExercise = (
  exerciseMuscle: ExerciseWithMuscles,
) => {
  const musclePoints: MusclePoints = {};
  exerciseMuscle.muscles.reduce((acc, curr) => {
    const currType = curr.exercise_muscles_type.type;

    let res;

    if (currType === MuscleInvolvementEnum.PRIMARY)
      res = MuscleInvolvementPointsEnum.PRIMARY;
    else if (currType === MuscleInvolvementEnum.SECONDARY)
      res = MuscleInvolvementPointsEnum.SECONDARY;
    else return acc;

    acc[curr["muscle_id"]] = res;

    return acc;
  }, musclePoints);

  return musclePoints;
};
