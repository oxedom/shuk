import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "..";
import { UserSchema } from "@oxedom/shared-shuk";

export interface User
  extends UserSchema,
    Model<InferAttributes<User>, InferCreationAttributes<User>> {
  user_id: CreationOptional<number>;
  is_active: CreationOptional<boolean>;
  is_coach: CreationOptional<boolean>;
  is_gym_admin: CreationOptional<boolean>;
  is_super_admin: CreationOptional<boolean>;
}

const User = sequelize.define<User>(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gender: {
      type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
      defaultValue: "OTHER",
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isE164(value: string) {
          if (value && !/^\+[1-9]\d{1,14}$/.test(value)) {
            throw new Error("Phone number must be in E.164 format");
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        notInFuture(value: Date) {
          if (value && value > new Date()) {
            throw new Error("Birthday cannot be in the future");
          }
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    is_coach: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_trainee: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
    is_gym_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_super_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    gym_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

export default User;
