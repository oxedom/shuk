import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "..";

import { GymSchema } from "@guy-vaserman/shared-my-training-app";

export interface Gym
  extends GymSchema,
    Model<InferAttributes<Gym>, InferCreationAttributes<Gym>> {
  gym_id: CreationOptional<number>;
}

const Gym = sequelize.define<Gym>(
  "Gym",
  {
    gym_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    english_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hebrew_name: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    primary_color: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
    primary_color_foreground: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
  },
  {
    tableName: "gyms",
    timestamps: true,
  },
);

export default Gym;
