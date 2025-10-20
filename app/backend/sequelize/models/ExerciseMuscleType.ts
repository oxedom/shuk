import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "..";
import {
  MuscleInvolvementEnum,
  ExerciseMuscleTypeSchema,
} from "@guy-vaserman/shared-my-training-app";

export interface ExerciseMuscleType
  extends ExerciseMuscleTypeSchema,
    Model<
      InferAttributes<ExerciseMuscleType>,
      InferCreationAttributes<ExerciseMuscleType>
    > {
  exercise_muscle_type_id: CreationOptional<number>;
}

const ExerciseMuscleType = sequelize.define<ExerciseMuscleType>(
  "ExerciseMuscleType",
  {
    exercise_muscle_type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    muscle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        MuscleInvolvementEnum.PRIMARY,
        MuscleInvolvementEnum.SECONDARY,
      ),
      allowNull: false,
    },
  },
  {
    tableName: "exercise_muscles_type",
    timestamps: true,
  },
);

export default ExerciseMuscleType;
