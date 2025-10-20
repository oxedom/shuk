import type { Exercise as ExerciseModelType } from "./Exercise";
import type { ExerciseComment as ExerciseCommentModelType } from "./ExerciseComment";
import type { ExerciseMuscleType as ExerciseMuscleTypeModelType } from "./ExerciseMuscleType";
import type { Gym as GymModelType } from "./Gym";
import type { Muscle as MuscleModelType } from "./Muscle";
import type { ProgramPlan as ProgramPlanModelType } from "./ProgramPlan";
import type { ProgramPlanWorkout as ProgramPlanWorkoutModelType } from "./ProgramPlanWorkout";
import type { ProgramPlanWorkoutExercise as ProgramPlanWorkoutExerciseModelType } from "./ProgramPlanWorkoutExercise";
import type { User as UserModelType } from "./User";
import type { Video as VideoModelType } from "./Video";
import type { WorkoutActivity as WorkoutActivityModelType } from "./WorkoutActivity";
import type { WorkoutComment as WorkoutCommentModelType } from "./WorkoutComment";
import type { WorkoutInstance as WorkoutInstanceModelType } from "./WorkoutInstance";

export {
  ProgramPlanModelType,
  ProgramPlanWorkoutModelType,
  ProgramPlanWorkoutExerciseModelType,
  UserModelType,
  VideoModelType,
  WorkoutActivityModelType,
  WorkoutCommentModelType,
  WorkoutInstanceModelType,
  ExerciseModelType,
  ExerciseCommentModelType,
  ExerciseMuscleTypeModelType,
  GymModelType,
  MuscleModelType,
};

export interface WorkoutActivityWorkoutInstanceExerciseModel
  extends WorkoutActivityModelType {
  workout_instance: WorkoutInstanceModelType;
  exercise: ExerciseModelType;
}

export interface ProgramPlanWorkoutProgramPlanWorkoutExerciseExerciseModel
  extends ProgramPlanWorkoutModelType {
  program_plan_workout_exercises: ProgramPlanWorkoutExerciseModelType & {
    exercise: ExerciseModelType;
  };
}

export interface ProgramPlanWorkoutExerciseProgramPlanWorkoutProgramPlanUserModel
  extends ProgramPlanWorkoutExerciseModelType {
  program_plan_workout: ProgramPlanWorkoutWithProgramPlanModel & {
    program_plan: ProgramPlanModelType & {
      user: UserModelType;
    };
  };
}

export interface WorkoutInstanceWithProgramPlanWorkoutProgramPlanUserModel
  extends WorkoutInstanceModelType {
  program_plan_instance_workout: ProgramPlanWorkoutWithProgramPlanModel;
}

export interface WorkoutActivityIncludesExerciseModel
  extends WorkoutActivityModelType {
  exercise: ExerciseModelType;
}

export interface ProgramPlanWorkoutWithProgramPlanModel
  extends ProgramPlanWorkoutModelType {
  program_plan: ProgramPlanModelType;
}

export interface ProgramPlanWorkoutExerciseWithProgramPlanWorkoutModel
  extends ProgramPlanWorkoutExerciseModelType {
  program_plan_workout: ProgramPlanWorkoutWithProgramPlanModel;
}

export interface ProgramPlanWorkoutWithProgramPlanWithUserModel
  extends ProgramPlanWorkoutWithProgramPlanModel {
  program_plan: ProgramPlanModelType & {
    user: UserModelType;
  };
}

export interface WorkoutInstanceProgramPlanWorkoutProgramPlanProgramPlanWorkoutExerciseModel
  extends WorkoutInstanceModelType {
  program_plan_instance_workout: ProgramPlanWorkoutModelType & {
    program_plan: ProgramPlanModelType;
    program_plan_workout_exercises: ProgramPlanWorkoutExerciseModelType;
  };
}

export interface WorkoutInstanceWithProgramPlanWorkoutProgramPlanUserProgramPlanWorkoutExerciseExerciseExerciseCommentWorkoutCommentModel
  extends WorkoutInstanceModelType {
  program_plan_instance_workout: ProgramPlanWorkoutModelType & {
    program_plan: ProgramPlanModelType & {
      user: UserModelType;
    };
    program_plan_workout_exercises: ProgramPlanWorkoutExerciseModelType & {
      exercise: ExerciseModelType;
    };
    exercise_comments: ExerciseCommentModelType;
    workout_comments: WorkoutCommentModelType;
  };
}
