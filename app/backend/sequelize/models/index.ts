import Exercise from "./Exercise";
import ExerciseComment from "./ExerciseComment";
import ExerciseMuscleType from "./ExerciseMuscleType";
import Gym from "./Gym";
import Muscle from "./Muscle";
import ProgramPlan from "./ProgramPlan";
import ProgramPlanWorkout from "./ProgramPlanWorkout";
import ProgramPlanWorkoutExercise from "./ProgramPlanWorkoutExercise";
import User from "./User";
import Video from "./Video";
import WorkoutActivity from "./WorkoutActivity";
import WorkoutComment from "./WorkoutComment";
import WorkoutInstance from "./WorkoutInstance";

export type * from "./types";

// import ProgramTemplate from './ProgramTemplate'
// import ProgramTemplateExercise from './ProgramTemplateWorkoutTemplate'
// import WorkoutTemplate from './WorkoutTemplate'
// import WorkoutTemplateExercise from './WorkoutTemplateExercise'

// --- Define Associations ---

// Fix Gym-User association
Gym.hasMany(User, {
  foreignKey: "gym_id",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
User.belongsTo(Gym, { foreignKey: "gym_id", as: "gym" });

User.hasMany(ProgramPlan, { foreignKey: "user_id" });
ProgramPlan.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ProgramPlan-ProgramPlanWorkout association
ProgramPlan.hasMany(ProgramPlanWorkout, {
  foreignKey: "program_plan_id",
  as: "program_plan_workouts",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProgramPlanWorkout.belongsTo(ProgramPlan, {
  foreignKey: "program_plan_id",
  as: "program_plan",
});

// ProgramPlanWorkout-ProgramPlanWorkoutExercise association
ProgramPlanWorkout.hasMany(ProgramPlanWorkoutExercise, {
  foreignKey: "program_plan_workout_id",
  as: "program_plan_workout_exercises",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProgramPlanWorkoutExercise.belongsTo(ProgramPlanWorkout, {
  foreignKey: "program_plan_workout_id",
  as: "program_plan_workout",
});

// Exercise associations
Exercise.hasMany(ProgramPlanWorkoutExercise, {
  foreignKey: "exercise_id",
  as: "program_plan_workout_exercises",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProgramPlanWorkoutExercise.belongsTo(Exercise, {
  foreignKey: "exercise_id",
  as: "exercise",
});

// Gym-Exercise association
Gym.hasMany(Exercise, {
  foreignKey: "gym_id",
  as: "exercises",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Exercise.belongsTo(Gym, { foreignKey: "gym_id", as: "gym" });

// Exercise-Video association
Exercise.hasMany(Video, {
  foreignKey: "exercise_id",
  as: "videos",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Video.belongsTo(Exercise, { foreignKey: "exercise_id", as: "exercise" });

// Exercise-Muscle many-to-many association
Exercise.belongsToMany(Muscle, {
  through: "exercise_muscles_type",
  foreignKey: "exercise_id",
  as: "muscles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Muscle.belongsToMany(Exercise, {
  through: "exercise_muscles_type",
  foreignKey: "muscle_id",
  as: "exercises",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Exercise comments associations
Exercise.hasMany(ExerciseComment, {
  foreignKey: "exercise_id",
  as: "exercise_comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ExerciseComment.belongsTo(Exercise, {
  foreignKey: "exercise_id",
  as: "exercise",
});

ProgramPlanWorkout.hasMany(ExerciseComment, {
  foreignKey: "program_plan_workout_id",
  as: "exercise_comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ExerciseComment.belongsTo(ProgramPlanWorkout, {
  foreignKey: "program_plan_workout_id",
  as: "program_plan_workout",
});

// Workout comments associations
ProgramPlanWorkout.hasMany(WorkoutComment, {
  foreignKey: "program_plan_workout_id",
  as: "workout_comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
WorkoutComment.belongsTo(ProgramPlanWorkout, {
  foreignKey: "program_plan_workout_id",
  as: "program_plan_workout",
});

// Workout activity associations
WorkoutInstance.hasMany(WorkoutActivity, {
  foreignKey: "workout_instance_id",
  as: "workout_activities",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
WorkoutActivity.belongsTo(WorkoutInstance, {
  foreignKey: "workout_instance_id",
  as: "workout_instance",
});

// User-WorkoutInstance association
WorkoutInstance.belongsTo(User, {
  foreignKey: "created_by",
  as: "created_by_user",
});
User.hasMany(WorkoutInstance, {
  foreignKey: "created_by",
  as: "workout_instances",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

WorkoutInstance.belongsTo(ProgramPlanWorkout, {
  foreignKey: "program_plan_workout_id",
  as: "program_plan_instance_workout",
});

ProgramPlanWorkout.hasMany(WorkoutInstance, {
  foreignKey: "program_plan_workout_id",
  as: "program_plan_workouts_instances",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Exercise-WorkoutActivity association
Exercise.hasMany(WorkoutActivity, {
  foreignKey: "exercise_id",
  as: "workout_activities",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
WorkoutActivity.belongsTo(Exercise, {
  foreignKey: "exercise_id",
  as: "exercise",
});

// --- End Associations ---

export {
  Exercise,
  ExerciseComment,
  ExerciseMuscleType,
  Gym,
  Muscle,
  ProgramPlan,
  ProgramPlanWorkout,
  ProgramPlanWorkoutExercise,
  User,
  Video,
  WorkoutActivity,
  WorkoutComment,
  WorkoutInstance,
};

// export type { WorkoutInstanceType };
