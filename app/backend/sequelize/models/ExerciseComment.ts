import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "app/backend/sequelize";

import { ExerciseCommentSchema } from "@guy-vaserman/shared-my-training-app";

export interface ExerciseComment
  extends ExerciseCommentSchema,
    Model<
      InferAttributes<ExerciseComment>,
      InferCreationAttributes<ExerciseComment>
    > {
  exercise_comment_id: CreationOptional<number>;
}

const ExerciseComment = sequelize.define<ExerciseComment>(
  "ExerciseComment",
  {
    exercise_comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    program_plan_workout_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    exercise_id: {
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
    tableName: "exercise_comments",
    timestamps: true,
  },
);

export default ExerciseComment;
