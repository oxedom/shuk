export type * from "../schemas";

export type * from "./models";
import {
  GymInstance,
  ProgramPlanInstance,
  ProgramPlanWorkoutInstance,
  UserInstance,
  ExerciseInstance,
  ExerciseCommentInstance,
  WorkoutCommentInstance,
  ProgramPlanWorkoutExerciseInstance,
  WorkoutActivityInstance,
  WorkoutInstanceInstance,
  MuscleInstance,
} from "./models";

export interface TraineeOption {
  user_id: number;
  first_name: string;
  last_name: string;
  is_me: boolean;
}

export interface PersonalRecord {
  previousRecord: number | null;
  newRecord: number;
  improvement: number;
}

export interface PersonalRecordCheckResult extends PersonalRecord {
  isNewRecord: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ExercisePersonalRecord {
  exerciseId: number;
  englishName: string;
  hebrewName: string;
  recordValue: number;
  achievedDate: Date;
  previousRecord: number | null;
  daysFromPreviousPR: number | null;
  activity_id: number;
}

export interface WorkoutSessionData {
  workoutInstanceId: number;
  date: Date;
  startTime: Date;
  endTime: Date | null;
  totalVolume: number;
  totalWeight: number;
  exerciseCount: number;
  completedExercises: number;
  skippedExercises: number;
  averageRpe: number | null;
  averageRir: number | null;
  programPlanWorkout: ProgramPlanWorkoutInstance;
}

export interface FrequencyAnalysisData {
  period: DateRange;
  totalWorkouts: number;
  averageWorkoutsPerWeek: number;
  averageDaysBetweenWorkouts: number;
  singleSessionConut: number;
  multiSessionCount: number;
}

export interface MuscleGroupVolumeData {
  muscleId: number;
  englishName: string;
  hebrewName: string;
  involvement: MuscleInvolvementEnum;
  totalVolume: number;
  sessionCount: number;
  averageVolumePerSession: number;
  volumePercentage: number; // of total volume
  exerciseCount: number; // unique exercises targeting this muscle
}

export interface PerformanceSummaryData {
  userId: number;
  period: DateRange;
  overallProgress: {
    totalWorkouts: number;
    totalSets: number;
    totalVolume: number;
    totalWeight: number;
  };
}

export interface WorkoutSummary {
  start_time: Date;
  end_time: Date;
  workout_instance_id: number;
  workout_comments: string[]; // Workout-level comments
  total_exercises: number; // Total number of exercises

  aggregated_weight_score: number;
  total_sets: number;
  personal_records: Record<number, PersonalRecord | null>;
  total_personal_records: number;
  performance_changes: ExercisePerformanceChange[]; // NEW: Array of performance changes
  total_performance_changes: number; // NEW: Count of exercises with performance changes
}

// Server Response Types
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Chart Data Types for Components
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface MultiSeriesChartData {
  date: string;
  [key: string]: number | string;
}

export interface ComparisonChartData {
  category: string;
  current: number;
  previous: number;
  target?: number;
}

export interface CompletedWorkoutInstance extends WorkoutInstanceInstance {
  workout_status: WorkoutStatus.COMPLETED;
  end_time: Date;
}

export interface ProgramPlanWorkoutExerciseExerciseInstance
  extends ProgramPlanWorkoutExerciseInstance {
  exercise: ExerciseInstance;
}

export interface InProgressWorkoutInstanceWithDetails
  extends WorkoutInstanceInstance {
  program_plan_instance_workout: ProgramPlanWorkoutInstance & {
    program_plan: ProgramPlanInstance & {
      user: Pick<User, "first_name" | "last_name">;
    };
    program_plan_workout_exercises: ProgramPlanWorkoutExerciseExerciseInstance[];
    exercise_comments: ExerciseCommentInstance[];
    workout_comments: WorkoutCommentInstance[];
  };
}

export interface ProgramPlanWorkoutProgramPlanWorkoutExerciseExerciseInstance
  extends ProgramPlanWorkoutInstance {
  program_plan_workout_exercises: ProgramPlanWorkoutExerciseInstance[] & {
    exercise: ExerciseInstance[];
  };
}

export interface WorkoutActivityExerciseInstance
  extends WorkoutActivityInstance {
  exercise: ExerciseInstance;
}

export interface WorkoutInstanceProgramPlanWorkoutProgramPlanInstance
  extends WorkoutInstanceInstance {
  program_plan_instance_workout: ProgramPlanWorkoutInstance & {
    program_plan: ProgramPlanInstance;
  };
}

export interface CompletedWorkoutInstanceProgramPlanWorkoutProgramPlanInstance
  extends WorkoutInstanceProgramPlanWorkoutProgramPlanInstance {
  workout_status: WorkoutStatus.COMPLETED;
}

export interface InProgressWorkoutInstanceProgramPlanWorkoutProgramPlanInstance
  extends WorkoutInstanceProgramPlanWorkoutProgramPlanInstance {
  workout_status: WorkoutStatus.IN_PROGRESS;
}

export interface ProgramPlanWorkoutExerciseProgramPlanWorkoutProgramPlanUserInstance
  extends ProgramPlanWorkoutExerciseInstance {
  program_plan_workout: ProgramPlanWorkoutWithProgramPlanInstance & {
    program_plan: ProgramPlanInstance & {
      user: UserInstance;
    };
  };
}

export interface WorkoutInstanceProgramPlanWorkoutProgramPlanProgramPlanWorkoutExerciseInstance
  extends WorkoutInstanceInstance {
  program_plan_instance_workout: ProgramPlanWorkoutInstance & {
    program_plan: ProgramPlanInstance;
    program_plan_workout_exercises: ProgramPlanWorkoutExerciseInstance[];
  };
}

export interface InProgressWorkoutInstanceWithHistory
  extends InProgressWorkoutInstanceWithDetails {
  workout_history: WorkoutHistory | null;
}

export interface WorkoutInstanceWithFullProgramPlanDetailsInstance
  extends WorkoutInstanceInstance {
  program_plan_instance_workout: ProgramPlanWorkoutInstance & {
    program_plan: ProgramPlanInstance & {
      user: Pick<UserInstance, "first_name" | "last_name">;
    };
    program_plan_workout_exercises: ProgramPlanWorkoutExerciseWithExercise[];
    exercise_comments: ExerciseCommentInstance[];
    workout_comments: WorkoutCommentInstance[];
  };
}

export interface ProgramPlanWorkoutWithProgramPlanInstance
  extends ProgramPlanWorkoutInstance {
  program_plan: ProgramPlanInstance;
}

export interface ProgramPlanWorkoutExerciseWithProgramPlanWorkoutInstance
  extends ProgramPlanWorkoutExerciseInstance {
  program_plan_workout: ProgramPlanWorkoutWithProgramPlanInstance;
}

export interface UserWithGym extends UserInstance {
  gym: Omit<GymInstance, "gym_id" | "is_active" | "createdAt" | "updatedAt">;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export enum WorkoutTypeEnum {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export interface DialogExerciseHistory {
  activity_id: number;
  exercise_id: number;
  workout_instance_id: number;
  skipped: boolean;
  weight_score: string | null;
  time_score: string | null;
  rpe_score: string | null;
  rir_score: string | null;
  set_number: number;
  repetitions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramPlanExerciseInput {
  exercise_id: number;
  position: number;
  sets: number;
  comment?: string | null;
  expected_min_kg?: number | null;
  expected_max_kg?: number | null;
  expected_min_reps?: number | null;
  expected_max_reps?: number | null;
  track_rpe_score?: boolean;
  track_rir_score?: boolean;
}

export interface AddExerciseParams {
  english_name: string;
  hebrew_name: string;
  gym_id?: number;
  type: "TIME_WEIGHT" | "WEIGHT" | "TIME";
}

export interface WorkoutInputDataType {
  workoutInstanceId: number;
}

export enum SetChangeType {
  ADDED_SETS = "ADDED_SETS",
  REMOVED_SETS = "REMOVED_SETS",
  SAME_SETS = "SAME_SETS",
}

export interface WorkoutSchema {
  english_name: string;
  hebrew_name: string;
  exercises: ProgramPlanExerciseInput[];
}

export interface MetricChange {
  previous_value: number | null;
  current_value: number | null;
  absolute_change: number;
  percentage_change: number | null;
  has_null_comparison: boolean;
}

export interface SetChange {
  previous_set_count: number;
  current_set_count: number;
  set_difference: number;
  set_change_type: SetChangeType;
}

export interface WorkoutActivitySnapshot {
  weight_score: number | null;
  repetitions: number | null;
  set_number: number;
  workout_date: Date;
}

export interface ExercisePerformanceChange {
  exercise: ExerciseInstance;
  changes: {
    weight: MetricChange | null;
    repetitions: MetricChange | null;
    sets: SetChange | null;
  };
  previous_best: WorkoutActivitySnapshot;
  current_performance: WorkoutActivitySnapshot;
}

export enum MuscleInvolvementEnum {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}

export const MuscleInvolvementPointsEnum: Record<
  MuscleInvolvementEnum,
  number
> = {
  [MuscleInvolvementEnum.PRIMARY]: 1,
  [MuscleInvolvementEnum.SECONDARY]: 0.5,
};

export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  GYM_ADMIN = "GYM_ADMIN",
  COACH = "COACH",
  TRAINEE = "TRAINEE",
}

export enum WorkoutStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  TERMINATED = "TERMINATED",
}

export interface MuscleWithType extends MuscleInstance {
  exercise_muscles_type: {
    type: MuscleInvolvementEnum;
  };
}

export interface ExerciseWithMuscles extends ExerciseInstance {
  muscles: MuscleWithType[];
}

export interface ProgramPlanWorkoutExerciseWithExercise
  extends ProgramPlanWorkoutExerciseInstance {
  exercise: ExerciseInstance;
}

export interface AddProgramPlanWorkoutExerciseResult
  extends ProgramPlanWorkoutExerciseInstance {
  exercise: ExerciseInstance;
}

export interface onExercisesAddedParam {
  ppwe: ProgramPlanWorkoutExerciseWithExercise;
  exerciseIndex: number;
}

export interface onExercisesReplacedParam {
  exercise: ExerciseInstance;
  exerciseIndex: number;
}

export interface onExercisesRemovedParam {
  exerciseIndex: number;
}

export interface onExercisesIncrementedParam {
  exerciseIndex: number;
}

export interface onExercisesDecrementedParam {
  exerciseIndex: number;
  setIndex: number;
}

export enum ActionEnum {
  REMOVE = "REMOVE",
  ADD = "ADD",
  REPLACE = "REPLACE",
  INCREMENT = "INCREMENT",
  DECREMENT = "DECREMENT",
}

export interface SetHistory {
  skipped: boolean;
  weight_score: string | number | null;
  time_score: number | null;
  rpe_score: number | null;
  set_number: number;
  repetitions: string | number;
  rir_score: number | null;
}

export interface WorkoutHistory {
  exercise_history: ExerciseHistory[];
  workout_comments: string[];
}

export interface GymRowData extends GymInstance {
  userCount: number;
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface WorkoutExercise extends ExerciseWithMuscles {
  position: number;
  sets: number;
  comment: string | null;
  kg: number;
  reps: number;
  track_rpe_score: boolean;
  track_rir_score: boolean;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface ProgramPlanWorkoutData {
  english_name: string;
  hebrew_name: string;
  exercises: ProgramPlanWorkoutExerciseData[];
}

export interface Exercise {
  program_plan_workout_exercise_id: number;
  expected_min_reps: number;
  expected_max_reps: number;
  expected_min_kg: number;
  expected_max_kg: number;
  exercise_id: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  english_name?: string;
  hebrew_name?: string;
  step?: number;
  type?: string;
  skipped?: boolean;
  sets?: number;
}

export interface ProgramPlanWorkout {
  english_name: string;
  hebrew_name: string;
  createdAt: string;
  updatedAt: string;
  program_plan_workout_id?: number;
}

export interface ProgramPlan {
  english_name: string;
  hebrew_name: string;
  is_active: boolean;
  is_locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  program_plan_workout: ProgramPlanWorkout;
  program_plan: ProgramPlan;
  exercises: Exercise[];
}

export interface ExerciseHistory {
  exercise_id: number;
  set_history: SetHistory[];
  comments: string[];
}

export interface ProgramPlanWorkoutExerciseData {
  exercise_id: number;
  position: number;
  sets: number;
  comment: string;
  kg: number;
  expected_min_kg: number;
  expected_max_kg: number;
  expected_min_reps: number;
  expected_max_reps: number;
}

export interface Program {
  program_plan_id: number;
  english_name: string;
  hebrew_name: string;
  is_active: boolean;
  is_locked: boolean;
  workouts: Workout[];
}

export interface WorkoutType {
  name: string;
  exercises: WorkoutExercise[];
  comment: string;
}

// WorkoutExercise extends Exercise with position information
export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

// New comprehensive types for workout data structure
export interface User {
  first_name: string;
  last_name: string;
}

export interface ExerciseDetail {
  exercise_id: number;
  english_name: string;
  gym_id: number | null;
  hebrew_name: string;
  type: string;
  created_by: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramPlanWorkoutExercise {
  program_plan_workout_exercise_id: number;
  program_plan_workout_id: number;
  sets: number;
  expected_min_reps: number;
  expected_max_reps: number;
  expected_min_kg: number;
  expected_max_kg: number;
  exercise_id: number;
  position: number;
  track_rpe_score: boolean;
  track_rir_score: boolean;
  createdAt: string;
  updatedAt: string;
  exercise: ExerciseDetail;
}

export interface ProgramPlanDetails {
  program_plan_id: number;
  user: User;
}

export interface ProgramPlanInstanceWorkout {
  program_plan_workout_id: number;
  position: number;
  english_name: string;
  hebrew_name: string;
  program_plan_id: number;
  createdAt: string;
  updatedAt: string;
  program_plan: ProgramPlanDetails;
  program_plan_workout_exercises: ProgramPlanWorkoutExercise[];
}

export interface ExerciseComment {
  exercise_id: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  program_plan_workout_id: number;
  exercise_comment_id: number;
}

export interface WorkoutData {
  workout_instance_id: number;
  user_id: number;
  program_plan_workout_id: number;
  start_time: string;
  end_time: string | null;
  created_by: number;
  workout_type: WorkoutTypeEnum;
  workout_status: WorkoutStatus;
  createdAt: string;
  updatedAt: string;
  program_plan_instance_workout: ProgramPlanInstanceWorkout;
  workout_history: WorkoutHistory;
}

export interface MetricChange {
  previous_value: number | null;
  current_value: number | null;
  absolute_change: number;
  percentage_change: number | null;
  has_null_comparison: boolean;
}

export interface SetChange {
  previous_set_count: number;
  current_set_count: number;
  set_difference: number;
  set_change_type: SetChangeType;
}

export interface WorkoutActivitySnapshot {
  weight_score: number | null;
  repetitions: number | null;
  set_number: number;
  workout_date: Date;
}

export interface ExercisePerformanceChange {
  exercise: ExerciseInstance;
  changes: {
    weight: MetricChange | null;
    repetitions: MetricChange | null;
    sets: SetChange | null;
  };
  previous_best: WorkoutActivitySnapshot;
  current_performance: WorkoutActivitySnapshot;
}

export interface SetHistory {
  skipped: boolean;
  weight_score: string | number | null;
  time_score: number | null;
  rpe_score: number | null;
  set_number: number;
  repetitions: string | number;
  rir_score: number | null;
}

export interface WorkoutHistory {
  exercise_history: ExerciseHistory[];
  workout_comments: string[];
}

export interface GetWorkoutPlanByInstanceIdResult
  extends WorkoutInstanceWithFullProgramPlanDetailsInstance {
  workout_history: WorkoutHistory | null;
}

export interface CreateWorkoutInstanceAndGetWorkoutPlanResult {
  workoutInstance: WorkoutInstanceInstance | null;
  workoutPlan: GetWorkoutPlanByInstanceIdResult | null;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface ProgramPlanWorkoutData {
  english_name: string;
  hebrew_name: string;
  exercises: ProgramPlanWorkoutExerciseData[];
}

export interface Exercise {
  program_plan_workout_exercise_id: number;
  expected_min_reps: number;
  expected_max_reps: number;
  expected_min_kg: number;
  expected_max_kg: number;
  exercise_id: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  english_name?: string;
  hebrew_name?: string;
  step?: number;
  type?: string;
  skipped?: boolean;
  sets?: number;
}

export interface ProgramPlanWorkout {
  english_name: string;
  hebrew_name: string;
  createdAt: string;
  updatedAt: string;
  program_plan_workout_id?: number;
}

export interface ProgramPlan {
  english_name: string;
  hebrew_name: string;
  is_active: boolean;
  is_locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  program_plan_workout: ProgramPlanWorkout;
  program_plan: ProgramPlan;
  exercises: Exercise[];
}

export interface ExerciseHistory {
  exercise_id: number;
  set_history: SetHistory[];
  comments: string[];
}

export interface ProgramPlanWorkoutExerciseData {
  exercise_id: number;
  position: number;
  sets: number;
  comment: string;
  kg: number;
  expected_min_kg: number;
  expected_max_kg: number;
  expected_min_reps: number;
  expected_max_reps: number;
}

export interface Program {
  program_plan_id: number;
  english_name: string;
  hebrew_name: string;
  is_active: boolean;
  is_locked: boolean;
  workouts: Workout[];
}

export interface WorkoutType {
  name: string;
  exercises: WorkoutExercise[];
  comment: string;
}

// WorkoutExercise extends Exercise with position information
export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

// New comprehensive types for workout data structure
export interface User {
  first_name: string;
  last_name: string;
}

export interface ExerciseDetail {
  exercise_id: number;
  english_name: string;
  gym_id: number | null;
  hebrew_name: string;
  type: string;
  created_by: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramPlanProgramPlanWorkoutInstance
  extends ProgramPlanInstance {
  program_plan_workouts: ProgramPlanWorkoutInstance[];
}
export interface WorkoutInputDataWithCommentsAndExercises {
  exercises: WorkoutInputSetUnit[];
  comment: string;
}

export interface WorkoutInputSetUnit {
  weight_score: number | null;
  repetitions: number;
  time_score: number | null;
  rpe_score: number | null;
  rir_score: number | null;
  set_number: number;
  skipped: boolean;
  exercise_id: number;
}

export interface WorkoutFrequencyStats {
  estimatedWorkouts: number | null;
  completedWorkouts: number;
}

export interface WorkoutActivityWorkoutInstanceInstance
  extends WorkoutActivityInstance {
  workout_instance: WorkoutInstanceInstance;
}

export interface WorkoutActivityWorkoutInstanceExerciseInstance
  extends WorkoutActivityInstance {
  workout_instance: WorkoutInstanceInstance;
  exercise: ExerciseInstance;
}

export interface FullProgramPlan extends ProgramPlanInstance {
  user: Pick<UserInstance, "first_name" | "last_name">;
  program_plan_workouts: (ProgramPlanWorkoutInstance & {
    program_plan_workout_exercises: (ProgramPlanWorkoutExerciseInstance & {
      exercise: ExerciseWithMuscles;
    })[];
  })[];
}

export interface CompletedWorkoutData {
  workout_instance_id: number;
  english_name: string;
  hebrew_name: string;
  end_time: Date;
  type: WorkoutTypeEnum;
}

export interface ActiveProgramPlanProgramPlanWorkout
  extends Omit<ProgramPlanProgramPlanWorkoutInstance, "is_active"> {
  is_active: true;
  countData: WorkoutFrequencyStats;
  previouslyCompletedWorkouts: CompletedWorkoutData[];
}

export interface ProgramPlanWorkoutExercise {
  program_plan_workout_exercise_id: number;
  program_plan_workout_id: number;
  sets: number;
  expected_min_reps: number;
  expected_max_reps: number;
  expected_min_kg: number;
  expected_max_kg: number;
  exercise_id: number;
  position: number;
  track_rpe_score: boolean;
  track_rir_score: boolean;
  createdAt: string;
  updatedAt: string;
  exercise: ExerciseDetail;
}

export interface ProgramPlanDetails {
  program_plan_id: number;
  user: User;
}

export interface ProgramPlanInstanceWorkout {
  program_plan_workout_id: number;
  position: number;
  english_name: string;
  hebrew_name: string;
  program_plan_id: number;
  createdAt: string;
  updatedAt: string;
  program_plan: ProgramPlanDetails;
  program_plan_workout_exercises: ProgramPlanWorkoutExercise[];
}

export interface ExerciseComment {
  exercise_id: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  program_plan_workout_id: number;
  exercise_comment_id: number;
}

export interface WorkoutData {
  workout_instance_id: number;
  user_id: number;
  program_plan_workout_id: number;
  start_time: string;
  end_time: string | null;
  created_by: number;
  workout_type: WorkoutTypeEnum;
  workout_status: WorkoutStatus;
  createdAt: string;
  updatedAt: string;
  program_plan_instance_workout: ProgramPlanInstanceWorkout;
  workout_history: WorkoutHistory;
}
