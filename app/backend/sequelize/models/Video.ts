import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "..";

import { VideoSchema } from "@guy-vaserman/shared-my-training-app";

export interface Video
  extends VideoSchema,
    Model<InferAttributes<Video>, InferCreationAttributes<Video>> {
  video_id: CreationOptional<number>;
}

const Video = sequelize.define<Video>(
  "Video",
  {
    video_id: {
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
    video_url: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "videos",
    timestamps: true,
  },
);

export default Video;
