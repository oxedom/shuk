// app/backend/services/programPlanService.ts

import {
  ProgramPlan,
  ProgramPlanWorkout,
  ProgramPlanWorkoutExercise,
  Exercise,
  User,
  WorkoutInstance,
  WorkoutComment,
  ExerciseComment,
  Muscle,
} from "../sequelize/models";
import { Op, Transaction } from "sequelize";
import {
  WorkoutStatus,
  ProgramPlanExerciseInput,
  WorkoutSchema,
  UserRole,
  ProgramPlanWorkoutInstance,
  ExerciseInstance,
  ProgramPlanWorkoutProgramPlanWorkoutExerciseExerciseInstance,
  ProgramPlanWorkoutExerciseInstance,
  ActiveProgramPlanProgramPlanWorkout,
  FullProgramPlan,
  WorkoutInstanceInstance,
  ExerciseCommentSchema,
  CompletedWorkoutData,
  AddProgramPlanWorkoutExerciseResult,
} from "@guy-vaserman/shared-my-training-app";
import { sequelize } from "../sequelize";
import type { ProgramPlanWorkoutExerciseUpsertDetails } from "../actions";
import { authorizeDataAccess, authorizeRoles } from "./authorizationService";
import type {
  ProgramPlanWorkoutExerciseWithProgramPlanWorkoutModel,
  ProgramPlanWorkoutWithProgramPlanModel,
  ProgramPlanWorkoutExerciseProgramPlanWorkoutProgramPlanUserModel,
  ProgramPlanWorkoutProgramPlanWorkoutExerciseExerciseModel,
} from "../sequelize/models";

// Type definitions for program plan operations

export interface ProgramPlanWorkoutInput {
  english_name: string;
  hebrew_name: string;
  comment?: string | null;
  exercises: ProgramPlanExerciseInput[];
}

export interface ProgramPlanInput {
  english_name: string;
  hebrew_name: string;
  user_id: number;
  workouts: ProgramPlanWorkoutInput[];
  is_active?: boolean;
  is_locked?: boolean;
  estimated_workouts?: number | null;
  make_main?: boolean;
}

export interface AssignProgramResult {
  programPlanId: number;
}

export interface UpdateProgramResult {
  programPlanId: number;
  workouts: WorkoutSchema[];
}

async function terminateExistingWorkouts(
  programPlanWorkoutIds: number[],
  transaction: Transaction,
) {
  await Promise.all(
    programPlanWorkoutIds.map((ppwId) =>
      WorkoutInstance.update(
        {
          workout_status: WorkoutStatus.TERMINATED,
        },
        {
          where: {
            workout_status: WorkoutStatus.IN_PROGRESS,
            program_plan_workout_id: ppwId,
          },
          transaction,
        },
      ),
    ),
  );
}

export async function findAllProgramPlansByUserId(userId: number) {
  const programPlans = await ProgramPlan.findAll({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: ProgramPlanWorkout,
        as: "program_plan_workouts",
        include: [
          {
            model: ProgramPlanWorkoutExercise,
            separate: true,
            as: "program_plan_workout_exercises",
            include: [
              {
                model: Exercise,
                as: "exercise",
                attributes: [
                  "exercise_id",
                  "english_name",
                  "hebrew_name",
                  "type",
                ],
              },
            ],
            order: [["position", "ASC"]],
            attributes: {
              exclude: ["program_plan_workout_id", "exercise_id"],
            },
          },
        ],
        attributes: {
          exclude: ["program_plan_id"],
        },
      },
    ],
  });

  return programPlans.map((plan) => plan.toJSON());
}

export async function replaceProgramPlanWorkoutExercise({
  programPlanWorkoutExerciseId,
  newExerciseId,
}: {
  programPlanWorkoutExerciseId: number;
  newExerciseId: number;
}) {
  try {
    //target userId is of the user who is replacing the exercise

    const ppwePpwPpUser = (await ProgramPlanWorkoutExercise.findByPk(
      programPlanWorkoutExerciseId,
      {
        attributes: [
          "program_plan_workout_exercise_id",
          "program_plan_workout_id",
        ],
        include: [
          {
            model: ProgramPlanWorkout,
            as: "program_plan_workout",
            attributes: ["program_plan_workout_id", "program_plan_id"],
            include: [
              {
                model: ProgramPlan,
                as: "program_plan",
                attributes: ["program_plan_id", "user_id"],
                include: [
                  {
                    model: User,
                    as: "user",
                  },
                ],
              },
            ],
          },
        ],
      },
    )) as ProgramPlanWorkoutExerciseProgramPlanWorkoutProgramPlanUserModel | null;

    if (!ppwePpwPpUser) {
      throw new Error("Program Plan Workout Exercise not found.");
    }

    await authorizeDataAccess(
      ppwePpwPpUser.program_plan_workout.program_plan.user.user_id,
    );

    const transaction = await sequelize.transaction();
    try {
      const oldExercise = await ProgramPlanWorkoutExercise.findByPk(
        programPlanWorkoutExerciseId,
        { transaction },
      );
      if (!oldExercise) {
        throw new Error("Old exercise not found.");
      }
      const newExercise = await Exercise.findByPk(newExerciseId, {
        transaction,
      });
      if (!newExercise) {
        throw new Error("New exercise not found.");
      }

      await oldExercise.update({ exercise_id: newExerciseId }, { transaction });

      await transaction.commit();

      return newExercise.toJSON() as ExerciseInstance;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

export async function removeProgramPlanWorkoutExercise(
  programPlanWorkoutExerciseId: number,
  workoutInstanceId: number,
) {
  try {
    //Check how many exercises are left in the workout
    const programPlanWorkoutExerciseAmount = await WorkoutInstance.count({
      where: {
        workout_instance_id: workoutInstanceId,
      },
      include: [
        {
          model: ProgramPlanWorkout,
          as: "program_plan_instance_workout",
          include: [
            {
              model: ProgramPlanWorkoutExercise,
              as: "program_plan_workout_exercises",
            },
          ],
        },
      ],
    });

    if (programPlanWorkoutExerciseAmount <= 1) {
      throw new Error("Workout must have at least one exercise.");
    }

    const transaction = await sequelize.transaction();

    const exerciseToRemove = (await ProgramPlanWorkoutExercise.findByPk(
      programPlanWorkoutExerciseId,
      {
        include: [
          {
            model: ProgramPlanWorkout,
            as: "program_plan_workout",
            include: [
              {
                model: ProgramPlan,
                as: "program_plan",
              },
            ],
          },
        ],
        transaction,
      },
    )) as ProgramPlanWorkoutExerciseWithProgramPlanWorkoutModel | null;

    if (!exerciseToRemove) {
      throw new Error("Program Plan Workout Exercise not found.");
    }

    const programPlan = exerciseToRemove.program_plan_workout?.program_plan;
    if (!programPlan) {
      throw new Error("Could not find parent Program Plan for the exercise.");
    }

    if (programPlan.is_locked) {
      throw new Error(
        "Parent Program Plan is locked, exercise cannot be removed.",
      );
    }

    const workoutId = exerciseToRemove.program_plan_workout_id;
    const removedPosition = exerciseToRemove.position;

    await exerciseToRemove.destroy({ transaction });

    await ProgramPlanWorkoutExercise.update(
      { position: sequelize.literal("position - 1") },
      {
        where: {
          program_plan_workout_id: workoutId,
          position: { [Op.gt]: removedPosition },
        },
        transaction,
      },
    );

    await transaction.commit();

    return null;
  } catch (error) {
    throw error;
  }
}

export async function addProgramPlanWorkoutExercise({
  programPlanWorkoutId,
  exerciseId,
  position,
  details,
}: {
  programPlanWorkoutId: number;
  exerciseId: number;
  position: number;
  details: ProgramPlanWorkoutExerciseUpsertDetails;
}) {
  const transaction = await sequelize.transaction();
  try {
    const programPlanWorkout = (await ProgramPlanWorkout.findByPk(
      programPlanWorkoutId,
      {
        include: [
          {
            model: ProgramPlan,
            as: "program_plan",
            required: true,
          },
        ],
        transaction,
      },
    )) as ProgramPlanWorkoutWithProgramPlanModel | null;

    if (!programPlanWorkout) {
      throw new Error("Program Plan Workout not found.");
    }

    if (programPlanWorkout.program_plan.is_locked) {
      throw new Error(
        "Parent Program Plan is locked, exercise cannot be added.",
      );
    }

    const exerciseToAdd = await Exercise.findByPk(exerciseId, {
      transaction,
    });
    if (!exerciseToAdd) {
      throw new Error(`Exercise with ID ${exerciseId} not found.`);
    }

    if (position < 1) {
      throw new Error("Position must be a positive integer.");
    }

    await ProgramPlanWorkoutExercise.increment(
      { position: 1 },
      {
        where: {
          program_plan_workout_id: programPlanWorkoutId,
          position: { [Op.gte]: position },
        },
        transaction,
      },
    );

    const newPpwe = await ProgramPlanWorkoutExercise.create(
      {
        program_plan_workout_id: programPlanWorkoutId,
        exercise_id: exerciseId,
        position: position,
        sets: details.sets,
        expected_min_reps: details.expected_min_reps,
        expected_max_reps: details.expected_max_reps ?? null,
        expected_min_kg: details.expected_min_kg ?? null,
        expected_max_kg: details.expected_max_kg ?? null,
        track_rpe_score: false,
        track_rir_score: false,
      },
      { transaction },
    );

    const newPpweId = newPpwe.program_plan_workout_exercise_id;
    if (!newPpweId) throw new Error("Failed to add exercise.");
    await transaction.commit();

    const res = {
      exercise: exerciseToAdd.toJSON(),
      ...(newPpwe.toJSON() as ProgramPlanWorkoutExerciseInstance),
    };

    return res as AddProgramPlanWorkoutExerciseResult;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function findWorkoutSchemaByPpwId(programPlanWorkoutId: number) {
  const programPlanWorkout = await ProgramPlanWorkout.findOne({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
    },
    include: [
      {
        separate: true,
        model: ProgramPlanWorkoutExercise,
        as: "program_plan_workout_exercises",
        include: [
          {
            model: Exercise,
            as: "exercise",
          },
        ],
      },
    ],
  });

  if (!programPlanWorkout) {
    return null;
  }
  return programPlanWorkout.toJSON();
}

export async function findProgramPlanByIdDetails(
  programId: number,
): Promise<FullProgramPlan | null> {
  const program = await ProgramPlan.findOne({
    where: {
      program_plan_id: programId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["first_name", "last_name"],
      },
      {
        model: ProgramPlanWorkout,
        separate: true,
        as: "program_plan_workouts",
        include: [
          {
            separate: true,
            model: ProgramPlanWorkoutExercise,
            as: "program_plan_workout_exercises",
            include: [
              {
                model: Exercise,
                as: "exercise",
                include: [
                  {
                    model: Muscle,
                    as: "muscles",
                    through: {
                      attributes: ["type"],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!program) {
    return null;
  }
  return program.toJSON() as FullProgramPlan;
}

export async function getActiveProgramByUserId(userId: number) {
  const activeProgramPlan = (await ProgramPlan.findOne({
    where: {
      user_id: userId,
      is_active: true,
    },
    include: [
      {
        model: ProgramPlanWorkout,
        as: "program_plan_workouts",
        attributes: {
          exclude: ["program_plan_id"],
        },
      },
    ],
  }).then((model) =>
    model?.toJSON(),
  )) as ActiveProgramPlanProgramPlanWorkout | null;

  if (!activeProgramPlan) {
    return null;
  }

  const { countData, previouslyCompletedWorkouts } =
    await getProgramPlanHistory(activeProgramPlan.program_plan_id);

  const planData = activeProgramPlan;

  const result = {
    ...planData,
    countData,
    previouslyCompletedWorkouts,
  };

  return result;
}

export async function getProgramPlanHistory(programId: number) {
  const program = await ProgramPlan.findByPk(programId);

  if (!program) throw new Error(`Program with ID ${programId} not found`);

  const estimatedWorkouts = program.estimated_workouts;

  const programPlanWorkouts = await ProgramPlanWorkout.findAll({
    where: { program_plan_id: programId },
    attributes: ["program_plan_workout_id", "english_name", "hebrew_name"],
  });

  const ppwIds = programPlanWorkouts.map((p) => p.program_plan_workout_id);

  // Early return if no workouts exist to avoid unnecessary database query
  if (ppwIds.length === 0) {
    const countData = {
      completedWorkouts: 0,
      estimatedWorkouts,
    };
    return { countData, previouslyCompletedWorkouts: [] };
  }

  const completedInstances = await WorkoutInstance.findAndCountAll({
    where: {
      program_plan_workout_id: { [Op.in]: ppwIds },
      workout_status: WorkoutStatus.COMPLETED,
      end_time: { [Op.ne]: null },
    },
    order: [["end_time", "DESC"]],
  });

  const previouslyCompletedWorkoutsOrNull = completedInstances.rows.map(
    (completedInstance) => {
      let currentWorkoutInstance =
        completedInstance.toJSON() as WorkoutInstanceInstance;

      let workout = programPlanWorkouts.find(
        (p) =>
          p.program_plan_workout_id ===
          currentWorkoutInstance.program_plan_workout_id,
      );

      if (!workout || currentWorkoutInstance.end_time === null) {
        return null;
      }

      const res: CompletedWorkoutData = {
        workout_instance_id: currentWorkoutInstance.workout_instance_id,
        english_name: workout.english_name,
        hebrew_name: workout.hebrew_name,
        end_time: currentWorkoutInstance.end_time,
        type: currentWorkoutInstance.workout_type,
      };

      return res;
    },
  );

  const previouslyCompletedWorkouts = previouslyCompletedWorkoutsOrNull.filter(
    (w): w is CompletedWorkoutData => w !== null,
  );

  const countData = {
    completedWorkouts: completedInstances.count,
    estimatedWorkouts,
  };

  return { countData, previouslyCompletedWorkouts };
}
export async function getProgramPlanWorkoutCounts(programId: number) {
  const program = await ProgramPlan.findByPk(programId);

  if (!program) throw new Error("Program Not Found");

  const estimatedWorkouts = program.estimated_workouts;

  const programPlanWorkouts = await ProgramPlanWorkout.findAll({
    where: { program_plan_id: programId },
    attributes: ["program_plan_workout_id"],
  });
  const ppwIds = programPlanWorkouts.map((p) => p.program_plan_workout_id);
  const completedInstances = await WorkoutInstance.findAndCountAll({
    where: {
      program_plan_workout_id: { [Op.in]: ppwIds },
      workout_status: WorkoutStatus.COMPLETED,
    },
  });

  return { completedWorkouts: completedInstances.count, estimatedWorkouts };
}

export async function incrementProgramPlanWorkoutExerciseSet(
  programPlanWorkoutExerciseId: number,
): Promise<void> {
  const programPlanWorkoutExercise = await ProgramPlanWorkoutExercise.findByPk(
    programPlanWorkoutExerciseId,
  );
  if (!programPlanWorkoutExercise) {
    throw new Error("Program Plan Workout Exercise not found");
  }
  await programPlanWorkoutExercise.increment("sets");
}

export async function decrementProgramPlanWorkoutExerciseSet(
  programPlanWorkoutExerciseId: number,
): Promise<void> {
  const programPlanWorkoutExercise = await ProgramPlanWorkoutExercise.findByPk(
    programPlanWorkoutExerciseId,
  );
  if (!programPlanWorkoutExercise) {
    throw new Error("Program Plan Workout Exercise not found");
  }
  if (programPlanWorkoutExercise.sets === 1) {
    throw new Error("Program Plan Workout Exercise has only one set");
  }
  await programPlanWorkoutExercise.decrement("sets");
}

export async function deleteProgramPlan(programPlanId: number): Promise<void> {
  const transaction = await sequelize.transaction();
  try {
    const programPlan = await ProgramPlan.findByPk(programPlanId, {
      transaction,
    });
    if (!programPlan) {
      throw new Error("Program Plan does not exist");
    }

    const programPlanWorkouts = await ProgramPlanWorkout.findAll({
      where: { program_plan_id: programPlanId },
      transaction,
    });

    for (const workout of programPlanWorkouts) {
      const workoutId = workout.program_plan_workout_id;

      await WorkoutInstance.update(
        {
          workout_status: WorkoutStatus.TERMINATED,
          end_time: new Date(),
        },
        {
          where: { program_plan_workout_id: workoutId },
          transaction,
        },
      );

      await WorkoutComment.destroy({
        where: { program_plan_workout_id: workoutId },
        transaction,
      });

      await ExerciseComment.destroy({
        where: { program_plan_workout_id: workoutId },
        transaction,
      });

      await ProgramPlanWorkoutExercise.destroy({
        where: { program_plan_workout_id: workoutId },
        transaction,
      });

      await workout.destroy({ transaction });
    }

    await programPlan.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    console.error("Error deleting program plan:", error);
    await transaction.rollback();
    throw error;
  }
}

export async function lockProgramPlan(
  programPlanId: number,
): Promise<{ isLocked: boolean }> {
  const programPlan = await ProgramPlan.findOne({
    where: {
      program_plan_id: programPlanId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id"],
      },
    ],
  });

  if (!programPlan) {
    throw new Error("Program Plan does not exist");
  }

  const transaction = await sequelize.transaction();
  try {
    const newLockStatus = !programPlan.is_locked;

    await ProgramPlan.update(
      { is_locked: newLockStatus },
      {
        where: {
          program_plan_id: programPlanId,
        },
        transaction,
      },
    );

    if (!newLockStatus) {
      const programPlanWorkouts = await ProgramPlanWorkout.findAll({
        where: {
          program_plan_id: programPlanId,
        },
      });

      const programPlanWorkoutIds = programPlanWorkouts.map(
        (workout) => workout.program_plan_workout_id,
      );

      await WorkoutInstance.update(
        {
          workout_status: WorkoutStatus.TERMINATED,
          end_time: new Date(),
        },
        {
          where: {
            program_plan_workout_id: programPlanWorkoutIds,
            workout_status: WorkoutStatus.IN_PROGRESS,
          },
          transaction,
        },
      );
    }

    await transaction.commit();
    return { isLocked: newLockStatus };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function activateProgramPlan(
  programPlanId: number,
): Promise<void> {
  const programPlan = await ProgramPlan.findOne({
    where: {
      program_plan_id: programPlanId,
    },
    include: [
      {
        model: User,
        as: "user",
        required: true,
        attributes: ["user_id"],
      },
    ],
  });

  if (!programPlan) {
    throw new Error("Program Plan does not exist");
  }

  const userId = programPlan.user_id;
  const transaction = await sequelize.transaction();

  try {
    await ProgramPlan.update(
      { is_active: false },
      {
        where: {
          user_id: userId,
          program_plan_id: { [Op.ne]: programPlanId },
        },
        transaction,
      },
    );

    await ProgramPlan.update(
      { is_active: true },
      {
        where: {
          program_plan_id: programPlanId,
          user_id: userId,
        },
        transaction,
      },
    );

    const programPlanWorkouts = await ProgramPlanWorkout.findAll({
      where: {
        program_plan_id: programPlanId,
      },
    });

    const programPlanWorkoutIds = programPlanWorkouts.map(
      (workout) => workout.program_plan_workout_id,
    );

    await WorkoutInstance.update(
      {
        workout_status: WorkoutStatus.TERMINATED,
        end_time: new Date(),
      },
      {
        where: {
          program_plan_workout_id: programPlanWorkoutIds,
          workout_status: WorkoutStatus.IN_PROGRESS,
        },
      },
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function assignProgramToTrainee(
  programData: ProgramPlanInput,
): Promise<AssignProgramResult> {
  await authorizeDataAccess(programData.user_id);
  await authorizeRoles([UserRole.COACH, UserRole.GYM_ADMIN]);

  const transaction = await sequelize.transaction();
  try {
    const traineeUser = await User.findOne({
      where: {
        user_id: programData.user_id,
        is_active: true,
      },
      transaction,
    });
    if (!traineeUser) {
      throw new Error("Trainee not found or not active");
    }

    // Check if user already has a program plan with the same title
    const existingProgramPlan = await ProgramPlan.findOne({
      where: {
        user_id: programData.user_id,
        english_name: programData.english_name,
      },
      transaction,
    });

    if (existingProgramPlan) {
      throw new Error(
        "A program plan with this title already exists for this trainee",
      );
    }

    if (programData.make_main) {
      await ProgramPlan.update(
        {
          is_active: false,
        },
        {
          where: { user_id: programData.user_id },
          transaction,
        },
      );
    }

    const programPlan = await ProgramPlan.create(
      {
        english_name: programData.english_name,
        hebrew_name: programData.hebrew_name,
        is_active: programData.make_main || false,
        user_id: programData.user_id,
        estimated_workouts: programData.estimated_workouts,
        is_locked: false,
      },
      {
        transaction,
      },
    );

    let position = 1;
    for (const workout of programData.workouts) {
      const programPlanWorkout = await ProgramPlanWorkout.create(
        {
          english_name: workout.english_name,
          position,
          hebrew_name: workout.hebrew_name,
          program_plan_id: programPlan.get("program_plan_id"),
        },
        {
          transaction,
        },
      );
      position++;
      if (workout.comment) {
        await WorkoutComment.create(
          {
            program_plan_workout_id: programPlanWorkout.get(
              "program_plan_workout_id",
            ),
            comment: workout.comment,
          },
          {
            transaction,
          },
        );
      }
      if (
        workout.exercises &&
        Array.isArray(workout.exercises) &&
        workout.exercises.length > 0
      ) {
        const exercisesToCreate = workout.exercises.map(
          (exercise: ProgramPlanExerciseInput) => ({
            program_plan_workout_id: programPlanWorkout.get(
              "program_plan_workout_id",
            ),
            exercise_id: exercise.exercise_id,
            position: exercise.position,
            sets: exercise.sets || 3,
            expected_min_kg: exercise.expected_min_kg || 1,
            expected_max_kg: exercise.expected_max_kg || null,
            expected_min_reps: exercise.expected_min_reps || 1,
            expected_max_reps: exercise.expected_max_reps || null,
            track_rpe_score: exercise.track_rpe_score || false,
            track_rir_score: exercise.track_rir_score || false,
          }),
        );
        const exerciseCommentsToCreate = workout.exercises
          .filter((exercise: ProgramPlanExerciseInput) => exercise.comment)
          .map((exercise: ProgramPlanExerciseInput) => ({
            program_plan_workout_id: programPlanWorkout.get(
              "program_plan_workout_id",
            ),
            comment: exercise.comment!,
            exercise_id: exercise.exercise_id,
          }));
        await ProgramPlanWorkoutExercise.bulkCreate(exercisesToCreate, {
          transaction,
          validate: true,
        });
        await ExerciseComment.bulkCreate(exerciseCommentsToCreate, {
          transaction,
          validate: true,
        });
      }
    }
    await transaction.commit();
    return {
      programPlanId: programPlan.get("program_plan_id"),
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function updateProgramPlan(
  programPlanId: number,
  programData: ProgramPlanInput,
) {
  await authorizeDataAccess(programData.user_id);
  await authorizeRoles([UserRole.COACH, UserRole.GYM_ADMIN]);

  const transaction = await sequelize.transaction();
  try {
    // Find the program plan to update
    const programPlan = await ProgramPlan.findByPk(programPlanId, {
      transaction,
    });

    if (!programPlan) {
      throw new Error("Program plan not found");
    }

    // Update the program plan basic info
    await programPlan.update(
      {
        english_name: programData.english_name,
        hebrew_name: programData.hebrew_name,
        estimated_workouts: programData.estimated_workouts,
      },
      { transaction },
    );

    // Get existing workouts ordered by position
    const existingWorkouts = await ProgramPlanWorkout.findAll({
      where: { program_plan_id: programPlanId },
      order: [["position", "ASC"]],
      transaction,
    });

    // Terminate all in-progress workout instances

    const programPlanWorkoutIds = existingWorkouts.map(
      (workout) => workout.program_plan_workout_id,
    );

    await terminateExistingWorkouts(programPlanWorkoutIds, transaction);

    const newWorkoutCount = programData.workouts.length;
    const existingWorkoutCount = existingWorkouts.length;

    // Handle workout count changes
    if (newWorkoutCount > existingWorkoutCount) {
      // Need to create additional workouts
      for (let i = existingWorkoutCount; i < newWorkoutCount; i++) {
        const workout = programData.workouts[i];
        await ProgramPlanWorkout.create(
          {
            english_name: workout.english_name,
            position: i + 1,
            hebrew_name: workout.hebrew_name,
            program_plan_id: programPlanId,
          },
          { transaction },
        );
      }
    } else if (newWorkoutCount < existingWorkoutCount) {
      // Need to delete excess workouts
      const workoutsToDelete = existingWorkouts.slice(newWorkoutCount);
      for (const workout of workoutsToDelete) {
        const workoutId = workout.program_plan_workout_id;

        await ProgramPlanWorkoutExercise.destroy({
          where: { program_plan_workout_id: workoutId },
          transaction,
        });

        await workout.destroy({ transaction });
      }
    }

    // Re-fetch existing workouts after count adjustments
    const currentWorkouts = await ProgramPlanWorkout.findAll({
      where: { program_plan_id: programPlanId },
      order: [["position", "ASC"]],
      transaction,
    });

    // Update existing workouts in place
    for (
      let i = 0;
      i < Math.min(newWorkoutCount, currentWorkouts.length);
      i++
    ) {
      const existingWorkout = currentWorkouts[i];
      const newWorkoutData = programData.workouts[i];

      // Update workout details
      await existingWorkout.update(
        {
          english_name: newWorkoutData.english_name,
          hebrew_name: newWorkoutData.hebrew_name,
          position: i + 1,
        },
        { transaction },
      );

      const workoutId = existingWorkout.program_plan_workout_id;

      await ProgramPlanWorkoutExercise.destroy({
        where: { program_plan_workout_id: workoutId },
        transaction,
      });

      if (newWorkoutData.comment) {
        await WorkoutComment.create(
          {
            program_plan_workout_id: workoutId,
            comment: newWorkoutData.comment,
          },
          { transaction },
        );
      }

      // Create new exercises for this workout
      if (
        newWorkoutData.exercises &&
        Array.isArray(newWorkoutData.exercises) &&
        newWorkoutData.exercises.length > 0
      ) {
        const exercisesToCreate = newWorkoutData.exercises.map(
          (exercise: ProgramPlanExerciseInput) => ({
            program_plan_workout_id: workoutId,
            exercise_id: exercise.exercise_id,
            position: exercise.position,
            sets: exercise.sets || 3,
            expected_min_kg: exercise.expected_min_kg || 1,
            expected_max_kg: exercise.expected_max_kg || null,
            expected_min_reps: exercise.expected_min_reps || 1,
            expected_max_reps: exercise.expected_max_reps || null,
            track_rpe_score: exercise.track_rpe_score || false,
            track_rir_score: exercise.track_rir_score || false,
          }),
        );

        await ProgramPlanWorkoutExercise.bulkCreate(exercisesToCreate, {
          transaction,
          validate: true,
        });

        const exerciseCommentsToCreate: ExerciseCommentSchema[] = [];

        for (const exercise of newWorkoutData.exercises) {
          if (exercise.comment) {
            exerciseCommentsToCreate.push({
              program_plan_workout_id: workoutId,
              comment: exercise.comment,
              exercise_id: exercise.exercise_id,
            });
          }
        }

        if (exerciseCommentsToCreate.length > 0) {
          await ExerciseComment.bulkCreate(exerciseCommentsToCreate, {
            transaction,
            validate: true,
          });
        }
      }
    }

    //interface ProgramPlanWorkoutProgramPlanWorkoutExerciseExerciseInstance

    // Fetch updated workouts to return
    const updatedWorkouts = (await ProgramPlanWorkout.findAll({
      where: { program_plan_id: programPlanId },
      include: [
        {
          model: ProgramPlanWorkoutExercise,
          as: "program_plan_workout_exercises",
          include: [
            {
              model: Exercise,
              as: "exercise",
            },
          ],
        },
      ],
      transaction,
    })) as ProgramPlanWorkoutProgramPlanWorkoutExerciseExerciseModel[];

    await transaction.commit();

    const jsonUpdatedWorkouts = updatedWorkouts.map(
      (workout) =>
        workout.toJSON() as ProgramPlanWorkoutProgramPlanWorkoutExerciseExerciseInstance,
    );

    return {
      programPlanId: programPlan.program_plan_id,
      workouts: jsonUpdatedWorkouts,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function getProgramPlanWorkouts(user_id: number) {
  await authorizeDataAccess(user_id);

  const programPlan = await ProgramPlan.findOne({
    where: { user_id, is_active: true },
    include: [
      {
        model: ProgramPlanWorkout,
        as: "program_plan_workouts",
      },
    ],
  });

  if (!programPlan) {
    return null;
  }

  const workouts = await ProgramPlanWorkout.findAll({
    where: { program_plan_id: programPlan.get("program_plan_id") },
  });

  return workouts.map((workout) =>
    workout.toJSON(),
  ) as ProgramPlanWorkoutInstance[];
}

//TODO We will usez zod to validate the program data in the future
export function validateProgramDataInput(
  programData: Omit<
    ProgramPlanInput,
    | "program_plan_id"
    | "is_active"
    | "is_locked"
    | "make_main"
    | "estimated_workouts"
  >,
) {
  if (
    !programData.english_name ||
    !programData.hebrew_name ||
    !programData.user_id ||
    !programData.workouts ||
    !Array.isArray(programData.workouts)
  ) {
    throw new Error("Invalid program data");
  }
}

export async function getProgramsByUserId(userId: number) {
  const programs = await ProgramPlan.findAll({
    where: {
      user_id: userId,
    },
    order: [
      ["is_active", "DESC"], // Active programs first
      ["english_name", "ASC"], // Then sort by name alphabetically
    ],
  });
  return programs.map((program) => program.toJSON());
}

export async function getUserPrograms(userId: number) {
  const programs = await ProgramPlan.findAll({
    where: {
      user_id: userId,
    },
  });
  return programs.map((program) => program.toJSON());
}

export async function doesUserHaveActiveProgram(
  userId: number,
): Promise<boolean> {
  const activeProgram = await ProgramPlan.findOne({
    where: {
      user_id: userId,
      is_active: true,
    },
  });
  return !!activeProgram;
}
