import {
  Exercise,
  Muscle,
  ExerciseMuscleType,
  WorkoutInstance,
  WorkoutActivity,
} from "../sequelize/models";
import type { AddExerciseParams } from "@guy-vaserman/shared-my-training-app";
import { sequelize } from "../sequelize";
import {
  ExerciseInstance,
  MuscleInstance,
  ExerciseMuscleTypeInstance,
  ExerciseWithMuscles,
  MuscleInvolvementEnum,
  UserRole,
  WorkoutActivityInstance,
  WorkoutStatus,
} from "@guy-vaserman/shared-my-training-app";
import { authorizeRoles, getAuthenticatedUser } from "./authorizationService";

export async function getAllExerciseMuscles() {
  await authorizeRoles([UserRole.COACH, UserRole.GYM_ADMIN]);

  const exerciseMuscles = await ExerciseMuscleType.findAll().then(
    (models) =>
      models.map((model) => model.toJSON()) as ExerciseMuscleTypeInstance[],
  );

  return exerciseMuscles;
}

export async function getAllMuscles() {
  const muscles = await Muscle.findAll();
  return muscles.map((muscle) => muscle.toJSON() as MuscleInstance);
}

export async function getAllExercises() {
  const exercises = await Exercise.findAll();
  return exercises.map((exercise) => exercise.toJSON() as ExerciseInstance);
}

export async function getAllExercisesWithMuscles() {
  const exercises = await Exercise.findAll({
    include: [
      {
        model: Muscle,
        as: "muscles",
        through: {
          attributes: ["type"],
        },
      },
    ],
  }).then((exercises) =>
    exercises.map((exercise) => exercise.toJSON() as ExerciseWithMuscles),
  );

  return exercises;
}

export async function getExerciseById(
  exerciseId: number,
): Promise<ExerciseInstance | null> {
  const exercise = await Exercise.findByPk(exerciseId);
  if (!exercise) {
    return null;
  }

  return exercise.toJSON() as ExerciseInstance;
}

export async function deleteExercise(exerciseId: number): Promise<void> {
  const exercise = await Exercise.findByPk(exerciseId);
  if (!exercise) {
    throw new Error("Exercise not found");
  }
  await exercise.destroy();
}

export async function createExercise(
  params: AddExerciseParams,
): Promise<ExerciseInstance> {
  const currentUser = await getAuthenticatedUser();
  await authorizeRoles([UserRole.COACH, UserRole.GYM_ADMIN]);

  const gymId = currentUser.gym_id;
  const createdBy = currentUser.user_id;

  //Use Zod in the future to validate the params
  if (!params.english_name || !params.hebrew_name || !params.type) {
    throw new Error("English name, Hebrew name, and type are required");
  }

  const exerciseParams = {
    english_name: params.english_name.trim(),
    hebrew_name: params.hebrew_name.trim(),
    type: params.type,
    gym_id: gymId,
    created_by: createdBy,
  };

  const exercise = await Exercise.create(exerciseParams);
  return exercise.toJSON() as ExerciseInstance;
}

// Migrated functions from actions/index.ts

export async function assignMusclesToExercise(
  exerciseId: number,
  muscleAssignments: Record<number, MuscleInvolvementEnum>,
) {
  const transaction = await sequelize.transaction();
  try {
    // check if the exercise exists
    const exercise = await Exercise.findByPk(exerciseId, { transaction });
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    const muscleIds = Object.keys(muscleAssignments).map(Number);
    const muscles = await Muscle.findAll({
      where: { muscle_id: muscleIds },
      transaction,
    });
    if (muscles.length !== muscleIds.length) {
      throw new Error("One or more muscles not found");
    }

    const hasAnyMuscles = Object.keys(muscleAssignments).length > 0;
    const hasPrimaryMuscle = Object.values(muscleAssignments).some(
      (type) => type === MuscleInvolvementEnum.PRIMARY,
    );
    if (hasAnyMuscles && !hasPrimaryMuscle) {
      throw new Error(
        "When assigning muscles, at least one PRIMARY muscle must be assigned",
      );
    }

    await ExerciseMuscleType.destroy({
      where: { exercise_id: exerciseId },
      transaction,
    });

    await ExerciseMuscleType.bulkCreate(
      Object.entries(muscleAssignments).map(([muscleId, type]) => ({
        exercise_id: exerciseId,
        muscle_id: Number(muscleId),
        type,
      })),
      { transaction },
    );

    await transaction.commit();
    return null;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function getExerciseHistoryByExerciseIdAndUserId(
  exerciseId: number,
  userId: number,
  programPlanWorkoutId?: number,
) {
  //get all the existing workout instance ids for a user
  const workoutInstances = await WorkoutInstance.findAll({
    where: {
      user_id: userId,
      ...(programPlanWorkoutId
        ? { program_plan_workout_id: programPlanWorkoutId }
        : {}),
      workout_status: WorkoutStatus.COMPLETED,
    },
    attributes: ["workout_instance_id"],
  });

  const workoutInstancesIds = workoutInstances.map(
    (instance) => instance.workout_instance_id,
  );
  const workoutActivities = (await WorkoutActivity.findAll({
    where: {
      exercise_id: exerciseId,
      skipped: false,
      workout_instance_id: workoutInstancesIds,
    },
  }).then((models) =>
    models.map((model) => model.toJSON()),
  )) as WorkoutActivityInstance[];

  return workoutActivities;
}
