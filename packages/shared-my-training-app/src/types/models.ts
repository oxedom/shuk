import {
  Gender,
  MuscleInvolvementEnum,
  WorkoutTypeEnum,
  WorkoutStatus,
} from ".";
interface TimeSchema {
  createdAt: Date;
  updatedAt: Date;
}

export interface GymSchema {
  english_name: string;
  hebrew_name?: string;
  is_active: boolean;
  primary_color: string;
  primary_color_foreground: string;
}

//Used in the client side code and toJSON()
export interface GymInstance extends GymSchema, TimeSchema {
  gym_id: number;
}

export interface ProgramPlanWorkoutSchema {
  english_name: string;
  hebrew_name: string;
  program_plan_id: number;
  position: number;
}

//Used in the client side code and toJSON()
export interface ProgramPlanWorkoutInstance
  extends ProgramPlanWorkoutSchema,
    TimeSchema {
  program_plan_workout_id: number;
}

export interface ProgramPlanSchema {
  english_name: string;
  hebrew_name: string;
  is_active: boolean;
  is_locked: boolean;
  user_id: number;
  estimated_workouts: number | null;
}

//Used in the client side code and toJSON()
export interface ProgramPlanInstance extends ProgramPlanSchema, TimeSchema {
  program_plan_id: number;
}

export interface UserSchema {
  gender: Gender;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  birthday: Date | null;
  is_active: boolean;
  is_coach: boolean;
  is_trainee: boolean;
  is_gym_admin: boolean;
  is_super_admin: boolean;
  gym_id: number | null;
}

//Used in the client side code and toJSON()
export interface UserInstance extends UserSchema, TimeSchema {
  user_id: number;
}

export interface ExerciseSchema {
  english_name: string;
  gym_id: number | null;
  hebrew_name: string | null;
  type: "TIME_WEIGHT" | "WEIGHT" | "TIME";
  created_by: number;
}

//Used in the client side code and toJSON()
export interface ExerciseInstance extends ExerciseSchema, TimeSchema {
  exercise_id: number;
}

export interface MuscleSchema {
  english_name: string;
  hebrew_name: string;
}

//Used in the client side code and toJSON()
export interface MuscleInstance extends MuscleSchema, TimeSchema {
  muscle_id: number;
}

export interface VideoSchema {
  english_name: string;
  hebrew_name: string | null;
  video_url: string | null;
}

//Used in the client side code and toJSON()
export interface VideoInstance extends VideoSchema, TimeSchema {
  video_id: number;
}

export interface ExerciseCommentSchema {
  program_plan_workout_id: number | null;
  exercise_id: number;
  comment: string;
}

//Used in the client side code and toJSON()
export interface ExerciseCommentInstance
  extends ExerciseCommentSchema,
    TimeSchema {
  exercise_comment_id: number;
}

export interface ExerciseMuscleTypeSchema {
  exercise_id: number;
  muscle_id: number;
  type: MuscleInvolvementEnum.PRIMARY | MuscleInvolvementEnum.SECONDARY;
}

//Used in the client side code and toJSON()
export interface ExerciseMuscleTypeInstance
  extends ExerciseMuscleTypeSchema,
    TimeSchema {
  exercise_muscle_type_id: number;
}

export interface WorkoutCommentSchema {
  program_plan_workout_id: number;
  comment: string;
}

//Used in the client side code and toJSON()
export interface WorkoutCommentInstance
  extends WorkoutCommentSchema,
    TimeSchema {
  workout_comment_id: number;
}

export interface ProgramPlanWorkoutExerciseSchema {
  program_plan_workout_id: number;
  sets: number;
  expected_min_reps: number;
  expected_max_reps: number | null;
  expected_min_kg: number | null;
  expected_max_kg: number | null;
  exercise_id: number;
  position: number;
  track_rpe_score: boolean;
  track_rir_score: boolean;
}

//Used in the client side code and toJSON()
export interface ProgramPlanWorkoutExerciseInstance
  extends ProgramPlanWorkoutExerciseSchema,
    TimeSchema {
  program_plan_workout_exercise_id: number;
}

export interface WorkoutActivitySchema {
  exercise_id: number;
  workout_instance_id: number;
  skipped: boolean;
  weight_score: number | null;
  time_score: number | null;
  rpe_score: number | null;
  rir_score: number | null;
  set_number: number;
  repetitions: number;
  exercise_position: number;
}

//Used in the client side code and toJSON()
export interface WorkoutActivityInstance
  extends WorkoutActivitySchema,
    TimeSchema {
  activity_id: number;
}

export interface WorkoutInstanceSchema {
  user_id: number;
  program_plan_workout_id: number;
  start_time: Date;
  end_time: Date | null;
  created_by: number;
  workout_type: WorkoutTypeEnum.SINGLE | WorkoutTypeEnum.MULTI;
  workout_status:
    | WorkoutStatus.IN_PROGRESS
    | WorkoutStatus.COMPLETED
    | WorkoutStatus.TERMINATED;
}

//Used in the client side code and toJSON()
export interface WorkoutInstanceInstance
  extends WorkoutInstanceSchema,
    TimeSchema {
  workout_instance_id: number;
}
