"use server";

import type {
  ExerciseInstance,
  WorkoutInputDataWithCommentsAndExercises,
} from "@guy-vaserman/shared-my-training-app";
import type { ProgramPlanInstance } from "@guy-vaserman/shared-my-training-app";
import type { AddExerciseParams } from "@guy-vaserman/shared-my-training-app";
//Schema imports
import {
  WorkoutSchema,
  addUserToGymSchema,
  AddUserToGymSchemaType,
  softDeleteUserSchema,
  SignupFormSchema,
  SignupFormSchemaType,
  UpdateUserSchemaType,
  updateUserSchema,
  assignGymAdminSchema,
  addGymSchema,
  updateGymSchema,
  UpdateGymSchemaType,
  UserInstance,
} from "@guy-vaserman/shared-my-training-app";
import type {
  UserWithGym,
  GymInstance,
  ApiResponse,
  AssignGymAdminSchemaType,
  AddGymSchemaType,
  GymRowData,
} from "@guy-vaserman/shared-my-training-app";
import type { MuscleInstance } from "@guy-vaserman/shared-my-training-app";
import type { MuscleInvolvementEnum } from "@guy-vaserman/shared-my-training-app";
import { signIn, signOut } from "app/backend/auth";
import { User, Gym } from "app/backend/sequelize/models";
import {
  userService,
  gymService,
  exerciseService,
  programPlanService,
  workoutService,
} from "../services";

import { checkIfNewRecord } from "../services/personalRecordService";
import { createResponse, createError } from "../utils";
import { formatUserDataWithCountryCode } from "@guy-vaserman/shared-my-training-app";
import * as TraineeAnalyticsService from "../services/traineeAnalyticsService";
import type {
  DateRange,
  ExercisePersonalRecord,
  WorkoutSessionData,
  FrequencyAnalysisData,
  CreateWorkoutInstanceAndGetWorkoutPlanResult,
  MuscleGroupVolumeData,
  PerformanceSummaryData,
} from "@guy-vaserman/shared-my-training-app";
import {
  getAuthenticatedUser,
  getFullAuthenticatedUser,
} from "../services/authorizationService";

import type { Session } from "next-auth";
export interface ProgramPlanWorkoutExerciseUpsertDetails {
  sets: number; // Mandatory
  expected_min_reps: number; // Mandatory as per model, validate min:1 elsewhere or ensure valid input
  expected_max_reps?: number | null;
  expected_min_kg?: number | null;
  expected_max_kg?: number | null;
  // Add other relevant fields from ProgramPlanWorkoutExercise model if they can be set during add/swap
}

// --- Start of  Helper Functions ---

export async function getAuthenticatedUserAction(): Promise<
  ApiResponse<Session["user"] | null>
> {
  try {
    const user = await getAuthenticatedUser();
    return createResponse(user);
  } catch (error) {
    return createError(error, "Failed to fetch authenticated user");
  }
}

export async function getFullAuthenticatedUserAction(): Promise<
  ApiResponse<UserInstance | null>
> {
  try {
    const user = await getFullAuthenticatedUser();
    return createResponse(user);
  } catch (error) {
    return createError(error, "Failed to fetch authenticated user");
  }
}

export async function getCensoredAuthenticatedUser() {
  const userSession = await getAuthenticatedUser();
  const email = userSession.email;

  const user = await User.findOne({
    where: { email },
    attributes: {
      include: [
        "user_id",
        "first_name",
        "last_name",
        "gender",
        "gym_id",
        "is_super_admin",
        "is_coach",
        "is_gym_admin",
        "is_trainee",
      ],
    },
    include: [
      {
        as: "gym",
        model: Gym,
        attributes: [
          "english_name",
          "hebrew_name",
          "primary_color",
          "primary_color_foreground",
        ],
      },
    ],
  });
  if (!user) {
    // This case should ideally not happen if the session exists, but good practice to check
    throw new Error("Authenticated user not found in database.");
  }

  return user.toJSON() as UserWithGym;
}

interface ProgramPlanWithWorkouts extends ProgramPlanInstance {
  workouts: WorkoutInput[];
}

// --- End Helper Functions ---

//Migrated to Services Architecture

export async function incrementPpwExerciseSet(
  programPlanWorkoutExerciseId: number,
): Promise<ApiResponse<null>> {
  try {
    await programPlanService.incrementProgramPlanWorkoutExerciseSet(
      programPlanWorkoutExerciseId,
    );
    return createResponse(null, "Set incremented successfully");
  } catch (error) {
    return createError(
      error,
      "Failed to increment program plan workout exercise set",
    );
  }
}

export async function decrementPpwExerciseSet(
  programPlanWorkoutExerciseId: number,
): Promise<ApiResponse<null>> {
  try {
    await programPlanService.decrementProgramPlanWorkoutExerciseSet(
      programPlanWorkoutExerciseId,
    );
    return createResponse(null, "Set decremented successfully");
  } catch (error) {
    return createError(
      error,
      "Failed to decrement program plan workout exercise set",
    );
  }
}

export async function superAdminAddUserToGymAction(
  userData: AddUserToGymSchemaType,
): Promise<ApiResponse<UserInstance | null>> {
  try {
    addUserToGymSchema.parse(userData);
    await userService.superAdminAddUserToGym(userData);
    return createResponse(null, "User added to gym successfully");
  } catch (error) {
    return createError(error, "Failed to add user to gym");
  }
}

export async function getAllUsers(): Promise<
  ApiResponse<UserInstance[] | null>
> {
  try {
    const users = await userService.findAllUsers();

    return createResponse(users);
  } catch (error) {
    return createError(error, "Failed to fetch all users");
  }
}

export async function getExerciseMuscles() {
  try {
    const exerciseMuscles = await exerciseService.getAllExerciseMuscles();
    return createResponse(exerciseMuscles);
  } catch (error) {
    return createError(error, "Failed to fetch exercise muscles");
  }
}

export async function getAllGymsTableData(): Promise<
  ApiResponse<GymRowData[] | null>
> {
  try {
    const gyms = await gymService.findAllGymsTableData();
    return createResponse(gyms);
  } catch (error) {
    return createError(error, "Failed to fetch all gyms");
  }
}

export async function getActiveGyms(): Promise<
  ApiResponse<GymInstance[] | null>
> {
  try {
    const gyms = await gymService.findActiveGyms();
    return createResponse(gyms);
  } catch (error) {
    return createError(error, "Failed to fetch active gyms");
  }
}

export async function terminateWorkoutInstance(workoutInstanceId: number) {
  try {
    await workoutService.terminateWorkoutInstance(workoutInstanceId);
    return createResponse(null, "Workout instance terminated successfully");
  } catch (error) {
    return createError(error, "Failed to terminate workout instance");
  }
}

export async function getUserById(userId: number) {
  try {
    const user = await userService.findUserById(userId);
    return createResponse(user);
  } catch (error) {
    return createError(error, "Failed to fetch user by ID");
  }
}

export async function createUser(
  userData: AddUserToGymSchemaType,
): Promise<ApiResponse<UserInstance | null>> {
  try {
    addUserToGymSchema.parse(userData);

    userData.phone = formatUserDataWithCountryCode(userData);
    const newUser = await userService.createUser(userData);
    return createResponse(newUser as UserInstance, "User created successfully");
  } catch (error) {
    return createError(error, "Failed to create user");
  }
}

export async function getExercises(): Promise<
  ApiResponse<ExerciseInstance[] | null>
> {
  try {
    const exercises = await exerciseService.getAllExercises();
    return createResponse(exercises);
  } catch (error) {
    return createError(error, "Failed to fetch exercises");
  }
}

export async function getExercisesWithMuscles() {
  try {
    const exercises = await exerciseService.getAllExercisesWithMuscles();
    return createResponse(exercises);
  } catch (error) {
    return createError(error, "Failed to fetch exercises with muscles");
  }
}

export async function getMuscles() {
  try {
    const muscles = await exerciseService.getAllMuscles();
    return createResponse(muscles);
  } catch (error) {
    return createError(error, "Failed to fetch muscles");
  }
}

export async function deleteExerciseById(exerciseId: number) {
  try {
    await exerciseService.deleteExercise(exerciseId);
    return createResponse(null, "Exercise deleted successfully");
  } catch (error) {
    return createError(error, "Failed to delete exercise");
  }
}

// --- End of Migrated to Services Architecture ---

export async function createWorkoutInstanceAndGetWorkoutPlan(
  workoutId: number,
) {
  try {
    const {
      data: workoutInstance,
      success: workoutInstanceSuccess,
      message: workoutInstanceMessage,
    } = await createWorkoutInstanceForTrainee(workoutId);
    if (!workoutInstanceSuccess) {
      throw new Error(workoutInstanceMessage);
    }
    if (!workoutInstance) {
      throw new Error(
        workoutInstanceMessage ||
          "Workout instance data is null despite success status.",
      );
    }
    const {
      data: workoutPlan,
      success: workoutPlanSuccess,
      message: workoutPlanMessage,
    } = await getWorkoutPlanByInstanceId(workoutInstance.workout_instance_id);
    if (!workoutPlanSuccess) {
      throw new Error(workoutPlanMessage);
    }
    return createResponse({ workoutInstance, workoutPlan }, workoutPlanMessage);
  } catch (error) {
    return createError(
      error,
      "Failed to create workout instance and get workout plan",
    );
  }
}

export async function getWorkoutSummaryByInstanceId(workoutInstanceId: number) {
  try {
    const data =
      await workoutService.getWorkoutSummaryByInstanceId(workoutInstanceId);
    return createResponse(data);
  } catch (error) {
    return createError(error, "Failed to get workout summary by instance id");
  }
}

export async function deleteProgramPlanById(programPlanId: number) {
  try {
    await programPlanService.deleteProgramPlan(programPlanId);
    return createResponse(null, "Program Plan deleted successfully");
  } catch (error) {
    return createError(error, "Failed to delete Program Plan");
  }
}

export async function updateUser(userData: UpdateUserSchemaType) {
  try {
    updateUserSchema.parse(userData);

    userData.phone = formatUserDataWithCountryCode(userData);

    const updatedUser = await userService.updateUser(userData);

    return createResponse(updatedUser, "User updated successfully");
  } catch (error) {
    return createError(error, "Failed to update user");
  }
}

export async function getProgramPlanById(programId: number) {
  try {
    const programJson =
      await programPlanService.findProgramPlanByIdDetails(programId);

    if (!programJson) {
      return createError(null, "Program not found");
    }
    return createResponse(programJson);
  } catch (error) {
    return createError(error, "Failed to fetch program plan");
  }
}
export async function getProgramsByUserId(userId: number) {
  try {
    const programs = await programPlanService.getProgramsByUserId(userId);
    return createResponse(programs);
  } catch (error) {
    return createError(error, "Failed to fetch programs by user ID");
  }
}
export async function getCompletedWorkoutInstancesByUserSession() {
  try {
    const currentUser = await getAuthenticatedUser();
    const userId = currentUser.user_id;
    const completedWorkoutInstances =
      await workoutService.getCompletedWorkoutInstancesByUser(userId);
    return createResponse(completedWorkoutInstances);
  } catch (error) {
    return createError(error, "Failed to fetch completed workout instances");
  }
}

export async function doLogin(provider: string) {
  await signIn(provider as string, { redirectTo: "/dashboard" });
}

export async function doLogout() {
  // delete all cookies
  await signOut({ redirectTo: "/" });
}

export async function addGymAction(addGymData: AddGymSchemaType) {
  try {
    addGymSchema.parse(addGymData);
    await gymService.addGym(addGymData);
    return createResponse(null, "Gym added successfully");
  } catch (error) {
    return createError(error, "Failed to add gym");
  }
}

export async function assignGymAdminAction(
  assignGymAdminData: AssignGymAdminSchemaType,
) {
  try {
    assignGymAdminSchema.parse(assignGymAdminData);
    await userService.assignGymAdmin(
      assignGymAdminData.gym_id,
      assignGymAdminData.user_id,
    );
    return createResponse(null, "Gym admin assigned successfully");
  } catch (error) {
    return createError(error, "Failed to assign gym admin");
  }
}

export async function updateGymAction(gymData: UpdateGymSchemaType) {
  try {
    updateGymSchema.parse(gymData);
    await gymService.updateGym(gymData);
    return createResponse(null, "Gym updated successfully");
  } catch (error) {
    return createError(error, "Failed to update gym");
  }
}

export async function checkIfNewPRRecord(
  exerciseId: number,
  weightScore: number,
  userId: number,
) {
  try {
    const result = await checkIfNewRecord(exerciseId, weightScore, userId);
    return createResponse(result);
  } catch (error) {
    return createError(error, "Failed to check if new PR");
  }
}

export async function lockProgramPlan(programPlanId: number) {
  try {
    const result = await programPlanService.lockProgramPlan(programPlanId);
    return createResponse(
      true,
      `Program plan ${result.isLocked ? "locked" : "unlocked"} successfully`,
    );
  } catch (error) {
    return createError(error, "Failed to toggle program plan lock");
  }
}

export async function activateProgramPlan(
  programPlanId: number,
): Promise<ApiResponse<boolean | null>> {
  try {
    await programPlanService.activateProgramPlan(programPlanId);
    return createResponse(true, "Program plan activated");
  } catch (error) {
    return createError(error, "Failed to activate program plan");
  }
}

export async function addExercise(params: AddExerciseParams) {
  try {
    const exercise = await exerciseService.createExercise(params);
    return createResponse(exercise, "Exercise created successfully");
  } catch (error) {
    return createError(error, "Failed to create exercise");
  }
}

export async function getActiveWorkoutInstancesByUserSession() {
  try {
    const currentUser = await getAuthenticatedUser();
    const userId = currentUser.user_id;
    const activeWorkoutInstances =
      await workoutService.getActiveWorkoutInstancesByUser(userId);
    return createResponse(activeWorkoutInstances);
  } catch (error) {
    return createError(error, "Failed to fetch active workout instances");
  }
}

export async function getActiveProgramByUserSession() {
  try {
    const user = await getAuthenticatedUser();
    const userId = user.user_id;
    const res = await programPlanService.getActiveProgramByUserId(userId);
    return createResponse(res);
  } catch (error) {
    return createError(error, "Failed to fetch active program plan");
  }
}

export async function getProgramPlansByUserId(
  userId: number,
): Promise<ApiResponse<any | null>> {
  try {
    const programPlans =
      await programPlanService.findAllProgramPlansByUserId(userId);

    return createResponse(programPlans);
  } catch (error) {
    return createError(
      error,
      `Failed to fetch program plans for user ID ${userId}`,
    );
  }
}

export async function doesUserHaveActiveProgram(userId: number) {
  try {
    const hasActiveProgram =
      await programPlanService.doesUserHaveActiveProgram(userId);
    return createResponse(hasActiveProgram);
  } catch (error) {
    return createError(error, "Failed to check active program");
  }
}

export async function getTraineesOptions() {
  try {
    const trainees = await userService.getTraineesOptions();
    return createResponse(trainees);
  } catch (error) {
    return createError(error, "Failed to fetch trainees");
  }
}

//Based off  current user session
export async function getAllUsersForGym(): Promise<
  ApiResponse<UserInstance[] | null>
> {
  try {
    const users = await userService.getAllUsersForGym();
    return createResponse(users, "Users fetched successfully");
  } catch (error) {
    return createError(error, "Failed to fetch users for gym");
  }
}

export async function addUserToGym(
  userData: AddUserToGymSchemaType,
): Promise<ApiResponse<UserInstance | null>> {
  try {
    addUserToGymSchema.parse(userData);
    const newUser = await userService.addUserToGym(userData);
    return createResponse(newUser, "User added to gym successfully");
  } catch (error) {
    return createError(error, "Failed to add user to gym");
  }
}

export async function softDeleteUser(
  targetUserId: number,
): Promise<ApiResponse<null>> {
  try {
    softDeleteUserSchema.parse(targetUserId);
    await userService.softDeleteUser(targetUserId);
    return createResponse(null, "User deleted successfully");
  } catch (error) {
    return createError(error, "Failed to delete user");
  }
}

export interface WorkoutInput extends ProgramPlanWithWorkouts {
  comment: string;
  exercises: ExerciseInstance;
}

// New function to assign a program to a trainee
export async function assignProgramToTrainee(programData: {
  english_name: string;
  hebrew_name: string;
  user_id: number;
  workouts: WorkoutSchema[];
  is_active?: boolean;
  is_locked?: boolean;
  estimated_workouts?: number | null;
  make_main?: boolean;
}) {
  try {
    programPlanService.validateProgramDataInput(programData);

    const result = await programPlanService.assignProgramToTrainee(programData);

    return createResponse(result, "Program assigned successfully");
  } catch (error) {
    return createError(error, "Failed to assign program");
  }
}

export async function updateProgramPlan(
  programPlanId: number,
  programData: {
    english_name: string;
    hebrew_name: string;
    user_id: number;
    workouts: WorkoutSchema[];
  },
) {
  try {
    programPlanService.validateProgramDataInput(programData);

    const result = await programPlanService.updateProgramPlan(
      programPlanId,
      programData,
    );

    return createResponse(result, "Program plan updated successfully");
  } catch (error) {
    return createError(error, "Failed to update program plan");
  }
}

export async function getProgramPlanWorkouts(user_id: number) {
  try {
    const result = await programPlanService.getProgramPlanWorkouts(user_id);
    return createResponse(result);
  } catch (error) {
    return createError(error, "Failed to fetch program plan workouts");
  }
}

//Used for New user Signup Form
export async function userSignup(formData: SignupFormSchemaType) {
  try {
    const userSession = await getAuthenticatedUser();
    SignupFormSchema.parse(formData);
    for (let i = 0; i < 100; i++) {
      console.log("formData", formData);
    }
    const email = userSession.email;
    if (!email) {
      throw new Error("Email is required");
    }
    await userService.userSignup(email, formData);
    return createResponse("User created successfully");
  } catch (error) {
    return createError(error, "Unknown Error");
  }
}

export async function createWorkoutInstanceForCurrentUser(
  programPlanWorkoutId: number,
) {
  try {
    const result =
      await workoutService.createWorkoutInstanceForCurrentUser(
        programPlanWorkoutId,
      );
    return createResponse(result, "Workout instance created successfully");
  } catch (error) {
    return createError(error, "Failed to create workout instance");
  }
}

export async function createWorkoutInstanceForTrainee(
  programPlanWorkoutId: number,
) {
  try {
    const result =
      await workoutService.createWorkoutInstanceForTrainee(
        programPlanWorkoutId,
      );
    return createResponse(result, "Workout instance created successfully");
  } catch (error) {
    return createError(error, "Failed to create workout instance for trainee");
  }
}

export async function getWorkoutPlanByInstanceId(workoutInstanceId: number) {
  try {
    const result =
      await workoutService.getWorkoutPlanByInstanceId(workoutInstanceId);
    return createResponse(result);
  } catch (error) {
    return createError(error, "Failed to fetch workout plan by instance ID");
  }
}
//TBD WorkoutInputDataType instead of any
export async function saveWorkoutActivities(
  workoutInstanceId: number,
  workoutInputData: WorkoutInputDataWithCommentsAndExercises[],
) {
  try {
    await getAuthenticatedUser();
    const result = await workoutService.saveWorkoutActivities(
      workoutInstanceId,
      workoutInputData,
    );
    return createResponse(result);
  } catch (error: unknown | AggregateError) {
    if (error instanceof AggregateError) {
      const message = error.errors.map((err: Error) => err.message).join(", ");
      return createError(error, message);
    }

    return createError(error, "Failed to save workout activities");
  }
}

export async function getAllInprogressWorkoutInstancesByCoach() {
  try {
    const instances =
      await workoutService.getAllInprogressWorkoutInstancesByCoach();
    return createResponse(instances);
  } catch (error) {
    return createError(
      error,
      "Failed to fetch in-progress workout instances for coach",
    );
  }
}

//New to be migrated to Services
export async function assignMusclesToExercise(
  exerciseId: number,
  muscleAssignments: Record<number, MuscleInvolvementEnum>,
) {
  try {
    await exerciseService.assignMusclesToExercise(
      exerciseId,
      muscleAssignments,
    );
    return createResponse(null, "Muscles assigned to exercise successfully");
  } catch (error) {
    return createError(error, "Failed to assign muscles to exercise");
  }
}

export async function getExerciseHistoryByExerciseIdAndUserId(
  exerciseId: number,
  userId: number,
  programPlanWorkoutId?: number,
) {
  try {
    const workoutActivitiesData =
      await exerciseService.getExerciseHistoryByExerciseIdAndUserId(
        exerciseId,
        userId,
        programPlanWorkoutId ?? undefined,
      );
    return createResponse(
      workoutActivitiesData,
      "Exercise history fetched successfully.",
    );
  } catch (error) {
    return createError(error, "Failed to fetch exercise history.");
  }
}
export async function replaceProgramPlanWorkoutExerciseAction({
  programPlanWorkoutExerciseId,
  newExerciseId,
}: {
  programPlanWorkoutExerciseId: number;
  newExerciseId: number;
}) {
  try {
    const result = await programPlanService.replaceProgramPlanWorkoutExercise({
      programPlanWorkoutExerciseId,
      newExerciseId,
    });
    return createResponse(
      result,
      "Program plan workout exercise replaced successfully",
    );
  } catch (error) {
    return createError(
      error,
      "Failed to replace program plan workout exercise",
    );
  }
}

export async function removeProgramPlanWorkoutExerciseAction({
  programPlanWorkoutExerciseId,
  workoutInstanceId,
}: {
  programPlanWorkoutExerciseId: number;
  workoutInstanceId: number;
}) {
  try {
    const result = await programPlanService.removeProgramPlanWorkoutExercise(
      programPlanWorkoutExerciseId,
      workoutInstanceId,
    );
    return createResponse(
      result,
      "Program plan workout exercise removed successfully",
    );
  } catch (error) {
    return createError(error, "Failed to remove program plan workout exercise");
  }
}

export async function addProgramPlanWorkoutExerciseAction({
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
  try {
    const result = await programPlanService.addProgramPlanWorkoutExercise({
      programPlanWorkoutId,
      exerciseId,
      position,
      details,
    });

    return createResponse(
      result,
      "Program plan workout exercise added successfully",
    );
  } catch (error) {
    return createError(error, "Failed to add program plan workout exercise");
  }
}

// === ANALYTICS ACTIONS ===

/**
 * Get personal records for user
 */
export async function getPersonalRecordsAction(
  userId: number,
  dateRange: DateRange,
): Promise<ApiResponse<ExercisePersonalRecord[] | null>> {
  try {
    const data = await TraineeAnalyticsService.getPersonalRecords(
      userId,
      dateRange,
    );

    return createResponse(data, "Personal records retrieved successfully");
  } catch (error) {
    return createError(error, "Failed to fetch personal records");
  }
}

export async function getMuscleGroupVolumeDistributionAction(
  userId: number,
  dateRange: DateRange,
): Promise<ApiResponse<MuscleGroupVolumeData[] | null>> {
  try {
    const data = await TraineeAnalyticsService.getMuscleGroupVolumeDistribution(
      userId,
      dateRange,
    );

    return createResponse(
      data,
      "Muscle group volume distribution retrieved successfully",
    );
  } catch (error) {
    return createError(
      error,
      "Failed to fetch muscle group volume distribution",
    );
  }
}

/**
 * Get workout session analysis
 */
export async function getWorkoutSessionAnalysisAction(
  userId: number,
  dateRange: DateRange,
): Promise<ApiResponse<WorkoutSessionData[] | null>> {
  try {
    const data = await TraineeAnalyticsService.getWorkoutSessionAnalysis(
      userId,
      dateRange,
    );

    return createResponse(
      data,
      "Workout session analysis retrieved successfully",
    );
  } catch (error) {
    return createError(error, "Failed to fetch workout session analysis");
  }
}

/**
 * Get workout frequency patterns
 */
export async function getWorkoutFrequencyPatternsAction(
  userId: number,
  dateRange: DateRange,
): Promise<ApiResponse<FrequencyAnalysisData | null>> {
  try {
    const data = await TraineeAnalyticsService.getWorkoutFrequencyPatterns(
      userId,
      dateRange,
    );

    return createResponse(
      data,
      "Workout frequency patterns retrieved successfully",
    );
  } catch (error) {
    return createError(error, "Failed to fetch workout frequency patterns");
  }
}

/**
 * Get trainee performance summary
 */
export async function getTraineePerformanceSummaryAction(
  userId: number,
  dateRange: DateRange,
): Promise<ApiResponse<PerformanceSummaryData | null>> {
  try {
    const data = await TraineeAnalyticsService.getTraineePerformanceSummary(
      userId,
      dateRange,
    );

    return createResponse(
      data,
      "Trainee performance summary retrieved successfully",
    );
  } catch (error) {
    return createError(error, "Failed to fetch trainee performance summary");
  }
}
