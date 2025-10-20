import User from "../sequelize/models/User";
import { UserInstance } from "@oxedom/shared-shuk";

export async function getUserById(userId: number) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user.toJSON() as UserInstance;
}
