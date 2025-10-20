import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "app/backend/sequelize";

import { WorkoutCommentSchema } from "@guy-vaserman/shared-my-training-app";

export interface WorkoutComment
  extends WorkoutCommentSchema,
    Model<
      InferAttributes<WorkoutComment>,
      InferCreationAttributes<WorkoutComment>
    > {
  workout_comment_id: CreationOptional<number>;
}

const WorkoutComment = sequelize.define<WorkoutComment>(
  "WorkoutComment",
  {
    workout_comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    program_plan_workout_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [0, 1000],
      },
    },
  },
  {
    tableName: "workout_comments",
    timestamps: true,
  },
);

export default WorkoutComment;
