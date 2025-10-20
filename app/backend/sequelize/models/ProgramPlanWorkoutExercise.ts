import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "app/backend/sequelize";

import { ProgramPlanWorkoutExerciseSchema } from "@guy-vaserman/shared-my-training-app";

export interface ProgramPlanWorkoutExercise
  extends ProgramPlanWorkoutExerciseSchema,
    Model<
      InferAttributes<ProgramPlanWorkoutExercise>,
      InferCreationAttributes<ProgramPlanWorkoutExercise>
    > {
  program_plan_workout_exercise_id: CreationOptional<number>;
}

const ProgramPlanWorkoutExercise = sequelize.define<ProgramPlanWorkoutExercise>(
  "ProgramPlanWorkoutExercise",
  {
    program_plan_workout_exercise_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    program_plan_workout_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    expected_min_reps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    expected_max_reps: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
    },
    expected_min_kg: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    expected_max_kg: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    track_rpe_score: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    track_rir_score: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "program_plan_workout_exercises",
    timestamps: true,
  },
);

export default ProgramPlanWorkoutExercise;
