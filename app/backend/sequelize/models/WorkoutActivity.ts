import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "app/backend/sequelize";
import {
  WEIGHT_SCORE,
  TIME_SCORE,
  RPE_SCORE,
  RIR_SCORE,
  REPETITIONS,
  SET_NUMBER,
} from "app/shared";

import { WorkoutActivitySchema } from "@guy-vaserman/shared-my-training-app";

export interface WorkoutActivity
  extends WorkoutActivitySchema,
    Model<
      InferAttributes<WorkoutActivity>,
      InferCreationAttributes<WorkoutActivity>
    > {
  activity_id: CreationOptional<number>;
  skipped: CreationOptional<boolean>;
}

const WorkoutActivity = sequelize.define<WorkoutActivity>(
  "WorkoutActivity",
  {
    activity_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_instance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    skipped: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    weight_score: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      validate: {
        min: WEIGHT_SCORE.min,
        max: WEIGHT_SCORE.max,
      },
    },
    time_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: {
        min: TIME_SCORE.min,
      },
    },
    rpe_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: {
        min: RPE_SCORE.min,
        max: RPE_SCORE.max,
      },
    },
    rir_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: {
        min: RIR_SCORE.min,
        max: RIR_SCORE.max,
      },
    },
    set_number: {
      type: DataTypes.INTEGER,
      validate: {
        min: SET_NUMBER.min,
        max: SET_NUMBER.max,
      },
      allowNull: false,
    },
    exercise_position: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
    },
    repetitions: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      validate: {
        min: REPETITIONS.min,
        max: REPETITIONS.max,
      },
    },
  },
  {
    tableName: "workout_activities",
    timestamps: true,
    // Suggested by AI to improve performance
    // indexes: [
    //   {
    //     fields: ['exercise_id', 'workout_instance_id'],
    //     name: 'workout_activity_exercise_instance_idx'
    //   },
    //   {
    //     fields: ['workout_instance_id'],
    //     name: 'workout_activity_instance_idx'
    //   }
    // ]
  },
);

export default WorkoutActivity;
