import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "app/backend/sequelize";
import {
  WorkoutStatus,
  WorkoutTypeEnum,
  WorkoutInstanceSchema,
} from "@guy-vaserman/shared-my-training-app";

export interface WorkoutInstance
  extends WorkoutInstanceSchema,
    Model<
      InferAttributes<WorkoutInstance>,
      InferCreationAttributes<WorkoutInstance>
    > {
  workout_instance_id: CreationOptional<number>;
  start_time: CreationOptional<Date>;
  workout_status: CreationOptional<WorkoutStatus>;
}

const WorkoutInstance = sequelize.define<WorkoutInstance>(
  "WorkoutInstance",
  {
    workout_instance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    program_plan_workout_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_type: {
      type: DataTypes.ENUM(WorkoutTypeEnum.MULTI, WorkoutTypeEnum.SINGLE),
      allowNull: false,
    },
    workout_status: {
      type: DataTypes.ENUM(
        WorkoutStatus.IN_PROGRESS,
        WorkoutStatus.COMPLETED,
        WorkoutStatus.TERMINATED,
      ),
      defaultValue: WorkoutStatus.IN_PROGRESS,
      allowNull: false,
    },
  },
  {
    tableName: "workout_instances",
    timestamps: true,
  },
);

export default WorkoutInstance;
