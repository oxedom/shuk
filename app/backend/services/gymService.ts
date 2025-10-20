//get all gyms
import { Gym, User } from "app/backend/sequelize/models";
import type {
  AddGymSchemaType,
  UpdateGymSchemaType,
} from "@guy-vaserman/shared-my-training-app";
import { UserRole } from "@guy-vaserman/shared-my-training-app";
import { authorizeRoles, getAuthenticatedUser } from "./authorizationService";
import { GymRowData } from "@guy-vaserman/shared-my-training-app";
import { Sequelize } from "sequelize";
import { GymInstance } from "@guy-vaserman/shared-my-training-app";

export async function updateGym(gymData: UpdateGymSchemaType): Promise<void> {
  await authorizeRoles([UserRole.SUPERADMIN]);

  const { gym_id, ...updatedGymData } = gymData;

  await Gym.update(updatedGymData, { where: { gym_id } });
}

export async function findAllGymsTableData(): Promise<GymRowData[]> {
  await authorizeRoles([UserRole.SUPERADMIN]);

  const gyms = await Gym.findAll({
    include: [
      {
        model: User,
        attributes: [],
        where: {
          is_active: true,
        },
        required: false,
      },
    ],
    attributes: {
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("Users.user_id")), "userCount"],
      ],
    },
    group: ["Gym.gym_id"],
  });

  return gyms.map((gym) => ({
    ...gym.toJSON(),
    //@ts-ignore
    userCount: parseInt(gym.dataValues.userCount) || 0,
  }));
}

export async function findActiveGyms() {
  await getAuthenticatedUser();

  const activeGyms = (await Gym.findAll({
    where: {
      is_active: true,
    },
    order: [["english_name", "ASC"]],
  }).then((models) => models.map((model) => model.toJSON()))) as GymInstance[];

  return activeGyms;
}

export async function findGymById(gymId: number) {
  const gym = (await Gym.findByPk(gymId).then((model) =>
    model?.toJSON(),
  )) as GymInstance | null;
  return gym;
}

export async function addGym(gymData: AddGymSchemaType) {
  await authorizeRoles([UserRole.SUPERADMIN]);
  return (await Gym.create(gymData).then((model) =>
    model.toJSON(),
  )) as GymInstance;
}
