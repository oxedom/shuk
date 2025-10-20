import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "..";

import { ExerciseSchema } from "@guy-vaserman/shared-my-training-app";

export interface Exercise
  extends ExerciseSchema,
    Model<InferAttributes<Exercise>, InferCreationAttributes<Exercise>> {
  exercise_id: CreationOptional<number>;
}

const Exercise = sequelize.define<Exercise>(
  "Exercise",
  {
    exercise_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    english_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gym_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    hebrew_name: {
      type: DataTypes.STRING,
    },

    type: {
      type: DataTypes.ENUM("TIME_WEIGHT", "WEIGHT", "TIME"),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "exercises",
    timestamps: true,
  },
);

export default Exercise;
