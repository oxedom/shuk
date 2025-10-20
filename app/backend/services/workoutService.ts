// app/backend/services/workoutService.ts
import {
  WorkoutInstance,
  WorkoutActivity,
  WorkoutComment,
  ExerciseComment,
  Exercise,
  ProgramPlanWorkout,
  ProgramPlanWorkoutExercise,
  ProgramPlan,
  User,
  WorkoutInstanceWithProgramPlanWorkoutProgramPlanUserModel,
  ProgramPlanWorkoutWithProgramPlanWithUserModel,
  WorkoutInstanceProgramPlanWorkoutProgramPlanProgramPlanWorkoutExerciseModel,
  WorkoutInstanceWithProgramPlanWorkoutProgramPlanUserProgramPlanWorkoutExerciseExerciseExerciseCommentWorkoutCommentModel,
} from "../sequelize/models";
import { calculateWorkoutPerformanceChanges } from "./performanceTrackingService";
import {
  calculateTotalWeight,
  calculateWorkoutSummaryPR,
  getTotalWorkoutSets,
} from "../domain/calculations";
import {
  authorizeRoles,
  authorizeDataAccess,
  getAuthenticatedUser,
  authorizeGymAccess,
} from "./authorizationService";

import { sequelize } from "../sequelize";

import {
  WorkoutStatus,
  WorkoutTypeEnum,
  WorkoutHistory,
  ExerciseHistory,
  UserRole,
  WorkoutActivityInstance,
  WorkoutCommentInstance,
  ExerciseCommentInstance,
  WorkoutInstanceInstance,
  WorkoutActivitySchema,
  CompletedWorkoutInstanceProgramPlanWorkoutProgramPlanInstance,
  InProgressWorkoutInstanceProgramPlanWorkoutProgramPlanInstance,
  WorkoutInstanceWithFullProgramPlanDetailsInstance,
  ExerciseCommentSchema,
  InProgressWorkoutInstanceWithHistory,
  InProgressWorkoutInstanceWithDetails,
  GetWorkoutPlanByInstanceIdResult,
  WorkoutInputDataWithCommentsAndExercises,
  WorkoutActivityWorkoutInstanceExerciseInstance,
} from "@guy-vaserman/shared-my-training-app";
import { Op } from "sequelize";

import {
  getWorkoutCommentsByProgramPlanWorkoutId,
  getWorkoutInstanceById,
  getPreviousRecords,
} from "../dal";

import { validateCompletedWorkoutInstance } from "./validation";
import { getExerciseMapFromWorkoutActivitiesExercise } from "../domain/wrangling";

export async function getWorkoutSummaryByInstanceId(workoutInstanceId: number) {
  const workoutInstance = await getWorkoutInstanceById(workoutInstanceId);

  await authorizeDataAccess(workoutInstance.user_id);

  validateCompletedWorkoutInstance(workoutInstance);

  const workoutComments = await getWorkoutCommentsByProgramPlanWorkoutId(
    workoutInstance.program_plan_workout_id,
  );

  const recentWorkoutActivities = (await WorkoutActivity.findAll({
    where: {
      workout_instance_id: workoutInstanceId,
      skipped: false,
    },
    include: [
      {
        model: Exercise,
        as: "exercise",
      },
      {
        model: WorkoutInstance,
        as: "workout_instance",
      },
    ],
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as WorkoutActivityWorkoutInstanceExerciseInstance[];

  if (recentWorkoutActivities.length === 0) {
    return {
      workout_instance_id: workoutInstanceId,
      total_exercises: 0,
      start_time: workoutInstance.start_time,
      end_time: workoutInstance.end_time,
      aggregated_weight_score: 0,
      total_sets: 0,
      workout_comments: workoutComments.map((comment) => comment.comment),
      performance_changes: [],
      total_performance_changes: 0,
      personal_records: {},
      total_personal_records: 0,
    };
  }

  const totalWorkoutSets = getTotalWorkoutSets(recentWorkoutActivities);

  const exercisesMap = getExerciseMapFromWorkoutActivitiesExercise(
    recentWorkoutActivities,
  );

  // Calculate performance changes
  const userId = workoutInstance.user_id;
  const performanceChanges = await calculateWorkoutPerformanceChanges(
    workoutInstanceId,
    userId,
  );

  const exerciseIds = Object.keys(exercisesMap).map((id) => Number(id));

  const previousWorkoutRecords = await getPreviousRecords(
    userId,
    workoutInstance.createdAt,
    exerciseIds,
  );

  const personalRecords = calculateWorkoutSummaryPR(
    recentWorkoutActivities,
    previousWorkoutRecords,
    workoutInstance,
  );

  const amountOfExercises = Object.keys(exercisesMap).length;

  const totalWeight = calculateTotalWeight(recentWorkoutActivities);

  const totalPersonalRecords = Object.keys(personalRecords).length;

  return {
    workout_instance_id: workoutInstanceId,
    total_exercises: amountOfExercises,
    start_time: workoutInstance.start_time,
    end_time: workoutInstance.end_time,
    aggregated_weight_score: totalWeight,
    total_sets: totalWorkoutSets,
    workout_comments: workoutComments.map((comment) => comment.comment),

    performance_changes: performanceChanges,
    total_performance_changes: performanceChanges.length,
    personal_records: personalRecords,
    total_personal_records: totalPersonalRecords,
  };
}

export async function terminateWorkoutInstance(workoutInstanceId: number) {
  const workoutInstanceWithUser = (await WorkoutInstance.findOne({
    where: { workout_instance_id: workoutInstanceId },
    include: [
      {
        model: ProgramPlanWorkout,

        as: "program_plan_instance_workout",
        include: [
          {
            model: ProgramPlan,
            as: "program_plan",

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
  })) as WorkoutInstanceWithProgramPlanWorkoutProgramPlanUserModel;

  await authorizeDataAccess(
    workoutInstanceWithUser.program_plan_instance_workout.program_plan.user_id,
  );

  const transaction = await sequelize.transaction();
  const workoutInstance = await WorkoutInstance.findByPk(workoutInstanceId, {
    transaction,
  });
  if (!workoutInstance) {
    return null;
  }
  await workoutInstance.update(
    { workout_status: WorkoutStatus.TERMINATED },
    { transaction },
  );
  await transaction.commit();
  return workoutInstance;
}

export async function getPPWHistory(programPlanWorkoutId: number) {
  const mostRecentWorkoutInstance = await WorkoutInstance.findOne({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
      workout_status: WorkoutStatus.COMPLETED,
    },
    order: [["workout_instance_id", "DESC"]],
  });

  if (!mostRecentWorkoutInstance) {
    return null;
  }

  const workoutActivities = await WorkoutActivity.findAll({
    where: {
      skipped: false,
      workout_instance_id: mostRecentWorkoutInstance.workout_instance_id,
    },
  });

  const workoutComments = await WorkoutComment.findAll({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
    },
    attributes: ["comment"],
  });

  const workoutCommentsArray = workoutComments.map(
    (comment) => comment.comment,
  );

  const exerciseComments = (await ExerciseComment.findAll({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
    },
    attributes: ["exercise_id", "comment"],
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as ExerciseCommentInstance[];

  //We will now group the exercises by their id
  const exerciseMap = workoutActivities.reduce(
    (acc, activity) => {
      const exerciseId = activity.exercise_id;
      if (!acc[exerciseId]) {
        acc[exerciseId] = [];
      }
      acc[exerciseId].push(activity.toJSON() as WorkoutActivityInstance);
      return acc;
    },
    {} as { [key: number]: WorkoutActivityInstance[] },
  );

  const exerciseHistory: ExerciseHistory[] = [];
  Object.entries(exerciseMap).forEach(([key, value]) => {
    const exerciseHistoryEntry: ExerciseHistory = {
      exercise_id: parseInt(key),
      set_history: value.map((workoutActivity) => {
        return {
          skipped: workoutActivity.skipped,
          weight_score: workoutActivity.weight_score,
          time_score: workoutActivity.time_score,
          rpe_score: workoutActivity.rpe_score,
          rir_score: workoutActivity.rir_score,
          set_number: workoutActivity.set_number,
          repetitions: workoutActivity.repetitions,
        };
      }),
      comments: exerciseComments
        .filter((comment) => comment.exercise_id === parseInt(key))
        .map((comment) => comment.comment),
    };
    exerciseHistory.push(exerciseHistoryEntry);
  });

  const workoutHistory: WorkoutHistory = {
    exercise_history: exerciseHistory,
    workout_comments: workoutCommentsArray,
  };

  return workoutHistory;
}

export async function getBulkPPWHistory(programPlanWorkoutIds: number[]) {
  if (!programPlanWorkoutIds || programPlanWorkoutIds.length === 0) {
    return {};
  }

  // 1. Find the most recent completed workout instance for each program plan workout id.
  const mostRecentInstancesData = await WorkoutInstance.findAll({
    attributes: [
      "program_plan_workout_id",
      [
        sequelize.fn("MAX", sequelize.col("workout_instance_id")),
        "workout_instance_id",
      ],
    ],
    where: {
      program_plan_workout_id: { [Op.in]: programPlanWorkoutIds },
      workout_status: WorkoutStatus.COMPLETED,
    },
    group: ["program_plan_workout_id"],
    raw: true,
  });

  const typedRecentInstances = mostRecentInstancesData as {
    program_plan_workout_id: number;
    workout_instance_id: number;
  }[];

  if (typedRecentInstances.length === 0) {
    const nullHistories: Record<number, null> = {};
    programPlanWorkoutIds.forEach((id) => {
      nullHistories[id] = null;
    });
    return nullHistories;
  }

  const mostRecentInstanceIds = typedRecentInstances.map(
    (i) => i.workout_instance_id,
  );
  const ppwIdToInstanceIdMap: Record<number, number> =
    typedRecentInstances.reduce(
      (acc, i) => {
        acc[i.program_plan_workout_id] = i.workout_instance_id;
        return acc;
      },
      {} as Record<number, number>,
    );

  const instanceIdToPpwId: Record<number, number> = Object.entries(
    ppwIdToInstanceIdMap,
  ).reduce(
    (acc, [ppwId, instanceId]) => {
      acc[instanceId] = Number(ppwId);
      return acc;
    },
    {} as Record<number, number>,
  );

  // 2. Fetch all workout activities for these instances.
  const allWorkoutActivities = (await WorkoutActivity.findAll({
    where: {
      workout_instance_id: { [Op.in]: mostRecentInstanceIds },
    },
  }).then((models) =>
    models.map((a) => a.toJSON()),
  )) as WorkoutActivityInstance[];

  const activitiesByPpwId: Record<number, WorkoutActivityInstance[]> = {};

  allWorkoutActivities.forEach((activity) => {
    const ppwId = instanceIdToPpwId[activity.workout_instance_id];
    if (!ppwId) return;
    if (!activitiesByPpwId[ppwId]) {
      activitiesByPpwId[ppwId] = [];
    }
    activitiesByPpwId[ppwId].push(activity);
  });

  // 3. Fetch workout comments
  const workoutComments = (await WorkoutComment.findAll({
    where: {
      program_plan_workout_id: { [Op.in]: programPlanWorkoutIds },
    },
    raw: true,
  })) as unknown as WorkoutCommentInstance[];

  const commentsByPpwId: Record<number, string[]> = {};
  workoutComments.forEach((comment) => {
    const ppwId = comment.program_plan_workout_id;
    if (!commentsByPpwId[ppwId]) {
      commentsByPpwId[ppwId] = [];
    }
    commentsByPpwId[ppwId].push(comment.comment);
  });

  // 4. Fetch exercise comments
  const exerciseComments = (await ExerciseComment.findAll({
    where: {
      program_plan_workout_id: { [Op.in]: programPlanWorkoutIds },
    },
  }).then((models) =>
    models.map((m) => m.toJSON()),
  )) as ExerciseCommentInstance[];

  const exerciseCommentsByPpwId: Record<number, ExerciseCommentInstance[]> = {};

  exerciseComments.forEach((comment) => {
    const ppwId = comment.program_plan_workout_id;
    if (ppwId === null) return;

    if (!exerciseComments[ppwId]) {
      exerciseCommentsByPpwId[ppwId] = [];
    }
    exerciseCommentsByPpwId[ppwId].push(comment);
  });

  // 5. Build the result object
  const histories: Record<number, WorkoutHistory | null> = {};

  programPlanWorkoutIds.forEach((ppwId) => {
    if (!ppwIdToInstanceIdMap[ppwId]) {
      histories[ppwId] = null;
      return;
    }

    const currentActivities = activitiesByPpwId[ppwId] || [];
    const currentWorkoutComments = commentsByPpwId[ppwId] || [];
    const currentExerciseComments = exerciseCommentsByPpwId[ppwId] || [];

    const exerciseMap: { [key: number]: WorkoutActivityInstance[] } = {};
    currentActivities.forEach((activity) => {
      const exerciseId = activity.exercise_id;
      if (!exerciseMap[exerciseId]) {
        exerciseMap[exerciseId] = [];
      }
      exerciseMap[exerciseId].push(activity);
    });

    const exerciseHistory: ExerciseHistory[] = [];
    Object.entries(exerciseMap).forEach(([key, value]) => {
      const exerciseId = parseInt(key);
      exerciseHistory.push({
        exercise_id: exerciseId,
        set_history: value.map((wa) => ({
          skipped: wa.skipped,
          weight_score: wa.weight_score || null,
          time_score: wa.time_score || null,
          rpe_score: wa.rpe_score || null,
          rir_score: wa.rir_score || null,
          set_number: wa.set_number,
          repetitions: wa.repetitions,
        })),
        comments: currentExerciseComments
          .filter((c) => c.exercise_id === exerciseId)
          .map((c) => c.comment),
      });
    });

    histories[ppwId] = {
      exercise_history: exerciseHistory,
      workout_comments: currentWorkoutComments,
    };
  });

  return histories;
}

export async function createWorkoutInstanceForCurrentUser(
  programPlanWorkoutId: number,
): Promise<{ workoutInstanceId: number }> {
  const programPlanWorkout = (await ProgramPlanWorkout.findByPk(
    programPlanWorkoutId,
    {
      include: [
        {
          model: ProgramPlan,
          as: "program_plan",

          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
      ],
    },
  )) as ProgramPlanWorkoutWithProgramPlanWithUserModel;

  await authorizeDataAccess(programPlanWorkout.program_plan.user_id);

  const currentUser = await getAuthenticatedUser();
  const userId = currentUser.user_id;

  const existingInstance = await WorkoutInstance.findOne({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
      created_by: userId,
      workout_status: WorkoutStatus.IN_PROGRESS,
      workout_type: WorkoutTypeEnum.SINGLE,
    },
  });

  if (existingInstance) {
    throw new Error("A workout instance with this workout already exists");
  }

  const workout = await WorkoutInstance.create({
    program_plan_workout_id: programPlanWorkoutId,
    user_id: userId,
    created_by: userId,
    workout_type: WorkoutTypeEnum.SINGLE,
  });

  return { workoutInstanceId: workout.workout_instance_id };
}

export async function createWorkoutInstanceForTrainee(
  programPlanWorkoutId: number,
) {
  const currentUser = await getAuthenticatedUser();
  const coachId = currentUser.user_id;

  await authorizeRoles([UserRole.COACH, UserRole.GYM_ADMIN]);

  //ProgramPlanWorkoutWithProgramPlanWithUserModel

  const programPlanWorkout = (await ProgramPlanWorkout.findByPk(
    programPlanWorkoutId,
    {
      include: [
        {
          model: ProgramPlan,
          as: "program_plan",
          required: true,
          include: [
            {
              model: User,
              as: "user",
              required: true,
              attributes: ["user_id", "gym_id"],
            },
          ],
        },
      ],
    },
  )) as ProgramPlanWorkoutWithProgramPlanWithUserModel | null;

  if (!programPlanWorkout) {
    throw new Error("Program plan workout not found");
  }

  const ppwWithUser = programPlanWorkout;

  const targetUserId = ppwWithUser.program_plan.user.user_id;

  const targetUserGymId = ppwWithUser.program_plan.user.gym_id;

  if (!targetUserId) {
    throw new Error("User not found");
  }

  if (!targetUserGymId) {
    throw new Error("User has no gym assigned");
  }

  await authorizeGymAccess(targetUserGymId);

  const existingInstances = await WorkoutInstance.findAll({
    where: {
      program_plan_workout_id: programPlanWorkoutId,
      created_by: coachId,
      workout_status: WorkoutStatus.IN_PROGRESS,
      workout_type: WorkoutTypeEnum.MULTI,
    },
  });

  if (existingInstances.length >= 1) {
    throw new Error("Multiple workout instances found, only one allowed");
  }

  const workout = await WorkoutInstance.create({
    program_plan_workout_id: programPlanWorkoutId,
    created_by: coachId,
    user_id: targetUserId,
    workout_type: WorkoutTypeEnum.MULTI,
  });

  return workout.toJSON() as WorkoutInstanceInstance;
}

export async function getWorkoutPlanByInstanceId(
  workoutInstanceId: number,
): Promise<GetWorkoutPlanByInstanceIdResult> {
  const workoutInstance = (await WorkoutInstance.findByPk(workoutInstanceId, {
    include: [
      {
        model: ProgramPlanWorkout,
        required: true,
        as: "program_plan_instance_workout",
        include: [
          {
            model: ProgramPlanWorkoutExercise,
            required: true,
            as: "program_plan_workout_exercises",
            separate: true,
            include: [
              {
                model: Exercise,
                required: true,
                as: "exercise",
              },
            ],
            order: [["position", "ASC"]],
          },

          {
            model: WorkoutComment,
            as: "workout_comments",
            separate: true,
            required: false,
          },
          {
            model: ExerciseComment,
            as: "exercise_comments",
            separate: true,
            required: false,
          },
          {
            model: ProgramPlan,
            required: true,
            as: "program_plan",
            include: [
              {
                model: User,
                as: "user",
                required: true,
                attributes: ["first_name", "last_name"],
              },
            ],
          },
        ],
      },
    ],
  }).then((model) =>
    model?.toJSON(),
  )) as WorkoutInstanceWithFullProgramPlanDetailsInstance | null;

  if (!workoutInstance) {
    throw new Error("Workout instance not found");
  }

  if (workoutInstance.workout_status !== WorkoutStatus.IN_PROGRESS) {
    throw new Error(
      `Workout instance is not IN_PROGRESS (current status: ${workoutInstance.workout_status}).`,
    );
  }

  const programPlanWorkoutId = workoutInstance.program_plan_workout_id;
  const workoutHistory = await getPPWHistory(programPlanWorkoutId);

  return {
    ...workoutInstance,
    workout_history: workoutHistory,
  };
}

export async function saveWorkoutActivities(
  workoutInstanceId: number,
  workoutInputData: WorkoutInputDataWithCommentsAndExercises[],
) {
  // Pre-process data outside transaction to minimize transaction time
  const activitiesToCreate: WorkoutActivitySchema[] = [];
  const commentsToCreate: ExerciseCommentSchema[] = [];

  const transaction = await sequelize.transaction();
  try {
    const workoutInstanceRaw = await WorkoutInstance.findByPk(
      workoutInstanceId,
      {
        transaction,
      },
    );
    if (!workoutInstanceRaw) {
      throw new Error("Workout instance not found.");
    }

    const workoutInstance = workoutInstanceRaw.toJSON();
    if (workoutInstance.workout_status !== WorkoutStatus.IN_PROGRESS) {
      throw new Error(
        `Workout instance is not IN_PROGRESS (current status: ${workoutInstance.workout_status}). Cannot save activities.`,
      );
    }

    const programPlanWorkoutExercises =
      await ProgramPlanWorkoutExercise.findAll({
        where: {
          program_plan_workout_id: workoutInstance.program_plan_workout_id,
        },
        transaction,
      });

    workoutInputData.forEach((exercise, exerciseIndex) => {
      const currentExerciseId = exercise.exercises[0].exercise_id;

      if (!currentExerciseId) {
        throw new Error(
          `Saving Failed: Exercise id not found for exercise: ${JSON.stringify(
            exercise,
          )}`,
        );
      }

      if (exercise.comment) {
        commentsToCreate.push({
          program_plan_workout_id: workoutInstance.program_plan_workout_id,
          exercise_id: currentExerciseId,
          comment: exercise.comment,
        });
      }
      // Find the program plan workout exercise for validation (optional for dynamic exercises)
      const programPlanWorkoutExercise = programPlanWorkoutExercises.find(
        (ppwe) => ppwe.get("exercise_id") === currentExerciseId,
      );

      if (!programPlanWorkoutExercise) return;

      for (const key in exercise.exercises) {
        const exercisePosition = programPlanWorkoutExercise.position;

        const set = exercise.exercises[key];
        const rpeScoreValue = programPlanWorkoutExercise.track_rpe_score
          ? set.rpe_score
          : null;
        const rirScoreValue = programPlanWorkoutExercise.track_rir_score
          ? set.rir_score
          : null;

        const res: WorkoutActivitySchema = {
          workout_instance_id: workoutInstanceId,
          exercise_id: set.exercise_id,
          set_number: set.set_number,
          skipped: set.skipped,
          exercise_position: exercisePosition,
          rpe_score: rpeScoreValue,
          rir_score: rirScoreValue,
          repetitions: set.repetitions,
          weight_score: set.weight_score,
          time_score: set.time_score ?? null,
        };

        activitiesToCreate.push(res);
      }
    });

    // Bulk operations
    if (activitiesToCreate.length > 0) {
      await WorkoutActivity.bulkCreate(activitiesToCreate, {
        transaction,
        validate: true,
      });
    }
    if (commentsToCreate.length > 0) {
      await ExerciseComment.bulkCreate(commentsToCreate, { transaction });
    }
    workoutInstanceRaw.set("workout_status", WorkoutStatus.COMPLETED);
    workoutInstanceRaw.set("end_time", new Date());
    await workoutInstanceRaw.save({ transaction });

    await transaction.commit();
    return "Workout activities saved successfully";
  } catch (error: unknown | AggregateError) {
    await transaction.rollback();
    throw error;
  }
}

export async function getAllInprogressWorkoutInstancesByCoach(): Promise<
  InProgressWorkoutInstanceWithHistory[]
> {
  await authorizeRoles([UserRole.COACH, UserRole.GYM_ADMIN]);
  const currentUser = await getAuthenticatedUser();
  const currentUserId = currentUser.user_id;

  const inProgressInstances = (await WorkoutInstance.findAll({
    where: {
      created_by: currentUserId,
      workout_status: WorkoutStatus.IN_PROGRESS,
      workout_type: WorkoutTypeEnum.MULTI,
    },
    include: [
      {
        model: ProgramPlanWorkout,
        as: "program_plan_instance_workout",
        include: [
          {
            model: ProgramPlan,
            as: "program_plan",
            attributes: ["program_plan_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["first_name", "last_name"],
              },
            ],
          },
          {
            model: ProgramPlanWorkoutExercise,
            as: "program_plan_workout_exercises",
            separate: true,
            include: [
              {
                model: Exercise,
                as: "exercise",
              },
            ],
            order: [["position", "ASC"]],
          },
          {
            model: ExerciseComment,
            required: false,
            as: "exercise_comments",
            separate: true,
          },
          {
            model: WorkoutComment,
            as: "workout_comments",
            separate: true,
            required: false,
          },
        ],
      },
    ],
    order: [["start_time", "ASC"]],
  })) as WorkoutInstanceWithProgramPlanWorkoutProgramPlanUserProgramPlanWorkoutExerciseExerciseExerciseCommentWorkoutCommentModel[];

  const instances = inProgressInstances.map(
    (instance) => instance.toJSON() as InProgressWorkoutInstanceWithDetails,
  );
  const bulkPPWHistory = await getBulkPPWHistory(
    instances.map((instance) => instance.program_plan_workout_id),
  );
  const instancesWithHistory = instances.map((instance) => {
    const ppwHistory = bulkPPWHistory[instance.program_plan_workout_id];
    return { ...instance, workout_history: ppwHistory };
  });
  return instancesWithHistory;
}

export async function getCompletedWorkoutInstancesByUser(userId: number) {
  const completedWorkoutInstances = await WorkoutInstance.findAll({
    include: [
      {
        model: ProgramPlanWorkout,
        required: true,
        as: "program_plan_instance_workout",
        include: [
          {
            model: ProgramPlan,
            as: "program_plan",
            required: true,
            where: {
              user_id: userId,
            },
          },
        ],
      },
    ],
    where: {
      workout_status: WorkoutStatus.COMPLETED,
    },
  });

  const jsonCompletedWorkoutInstances = completedWorkoutInstances.map(
    (instance) =>
      instance.toJSON() as CompletedWorkoutInstanceProgramPlanWorkoutProgramPlanInstance,
  );

  return jsonCompletedWorkoutInstances;
}

export async function getActiveWorkoutInstancesByUser(userId: number) {
  return (await WorkoutInstance.findAll({
    include: [
      {
        model: ProgramPlanWorkout,
        required: true,
        as: "program_plan_instance_workout",
        include: [
          {
            model: ProgramPlan,
            as: "program_plan",
            required: true,
            where: {
              user_id: userId,
            },
          },
        ],
      },
    ],
    where: {
      workout_status: WorkoutStatus.IN_PROGRESS,
    },
  }).then((models) =>
    models.map((model) => model.toJSON()),
  )) as InProgressWorkoutInstanceProgramPlanWorkoutProgramPlanInstance[];
}
