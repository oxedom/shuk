import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "app/backend/sequelize";

import { ProgramPlanSchema } from "@guy-vaserman/shared-my-training-app";

export interface ProgramPlan
  extends ProgramPlanSchema,
    Model<InferAttributes<ProgramPlan>, InferCreationAttributes<ProgramPlan>> {
  program_plan_id: CreationOptional<number>;
}

const ProgramPlan = sequelize.define<ProgramPlan>(
  "ProgramPlan",
  {
    program_plan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    english_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estimated_workouts: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hebrew_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        fields: ["user_id", "is_active"],
      },
    ],
    tableName: "program_plans",
    timestamps: true,
  },
);

export default ProgramPlan;
