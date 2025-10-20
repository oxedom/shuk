import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "..";

import { MuscleSchema } from "@guy-vaserman/shared-my-training-app";

export interface Muscle
  extends MuscleSchema,
    Model<InferAttributes<Muscle>, InferCreationAttributes<Muscle>> {
  muscle_id: CreationOptional<number>;
}

const Muscle = sequelize.define<Muscle>(
  "Muscle",
  {
    muscle_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    english_name: {
      type: DataTypes.STRING,
      unique: true,
    },
    hebrew_name: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    tableName: "muscles",
    timestamps: true,
  },
);

export default Muscle;
