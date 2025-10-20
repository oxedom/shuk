import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "app/backend/sequelize";

import { ProgramPlanWorkoutSchema } from "@guy-vaserman/shared-my-training-app";

export interface ProgramPlanWorkout
  extends ProgramPlanWorkoutSchema,
    Model<
      InferAttributes<ProgramPlanWorkout>,
      InferCreationAttributes<ProgramPlanWorkout>
    > {
  program_plan_workout_id: CreationOptional<number>;
}

const ProgramPlanWorkout = sequelize.define<ProgramPlanWorkout>(
  "ProgramPlanWorkout",
  {
    program_plan_workout_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    english_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hebrew_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    program_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "program_plan_workouts",
    timestamps: true,
  },
);

export default ProgramPlanWorkout;
