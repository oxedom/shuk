import { User } from "../sequelize/models";
import { Op, ForeignKeyConstraintError } from "sequelize";
import {
  UserInstance,
  formatUserDataWithCountryCode,
  SignupFormSchemaType,
} from "@oxedom/shared-shuk";

import type {

  Gender,
  UpdateUserSchemaType,

} from "@oxedom/shared-shuk";
import {
  authorizeRoles,
  authorizeGymAccess,
  getAuthenticatedUser,
  authorizeDataAccess,
} from "./authorizationService";
import { UserRole } from "@oxedom/shared-shuk";


export async function findUserById(userId: number) {
  await authorizeDataAccess(userId);
  const user = await User.findByPk(userId);
  if (!user) {
    return null;
  }
  return user.toJSON() as UserInstance;
}

export async function findByEmail(email: string) {
  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    return null;
  }
  return user.toJSON() as UserInstance;
}

export async function findAllUsers(): Promise<UserInstance[]> {
  await authorizeRoles([UserRole.SUPERADMIN]);

  const users = await User.findAll();
  return users.map((user) => user.toJSON() as UserInstance);
}



export async function updateUser(
  userData: UpdateUserSchemaType,
): Promise<UserInstance> {
  const currentUser = await getAuthenticatedUser();
  const currentUserId = currentUser.user_id;

  await authorizeRoles([UserRole.COACH, UserRole.GYM_ADMIN]);

  const targetUser = await User.findByPk(userData.user_id);
  if (!targetUser) {
    throw new Error("User not found");
  }

  const targetUserGymId = targetUser.gym_id;
  if (!targetUserGymId) {
    throw new Error("User has no gym assigned");
  }

  await authorizeGymAccess(targetUserGymId);

  const isModifyingSelf = targetUser.user_id === currentUserId;
  const modifiableUserData = { ...userData };
  const deActivedSelf = isModifyingSelf && !modifiableUserData.is_active;

  // Prevent users from changing their own active status
  if (deActivedSelf) {
    throw new Error("Cannot deactivate your own user");
  }

  // Prevent non-super-admins from modifying super admin status

  await targetUser.update(modifiableUserData);
  return targetUser.toJSON() as UserInstance;
}

export async function userSignup(
  email: string,
  formData: SignupFormSchemaType,
): Promise<void> {
  const { gender, firstName, lastName, gym_id } = formData;
  const genderValue: Gender = gender as Gender;
  const formattedPhone = formatUserDataWithCountryCode(formData);

  await User.create({
    email,
    first_name: firstName,
    last_name: lastName,
    birthday: null,
    gender: genderValue,
    phone: formattedPhone,
    is_trainee: true,
    gym_id,
  });
}





export async function softDeleteUser(targetUserId: number): Promise<void> {
  const currentUser = await getAuthenticatedUser();
  await authorizeRoles([UserRole.GYM_ADMIN]);

  if (currentUser.user_id === targetUserId) {
    throw new Error("Cannot delete your own user account");
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new Error("User not found");
  }

  const targetUserGymId = targetUser.gym_id;
  if (!targetUserGymId) {
    throw new Error("User has no gym assigned");
  }

  await authorizeGymAccess(targetUserGymId);

  try {
    await targetUser.update({
      is_active: false,
      email: null, // Clear PII for privacy
      phone: null,
      gym_id: null,
      birthday: null,
      first_name: "Deleted",
      last_name: "User",
    });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new Error(
        "Cannot delete user: User has associated records that prevent deletion. Please remove or reassign related data first.",
      );
    }
    throw error;
  }
}

export async function assignGymAdmin(
  gymId: number,
  userId: number,
): Promise<void> {
  await authorizeRoles([UserRole.SUPERADMIN]);
  const targetUser = await User.findByPk(userId);

  if (!targetUser) {
    throw new Error("User not found");
  }

  const isSameGym = targetUser.gym_id === gymId;

  if (!isSameGym) {
    throw new Error("User is not from the same gym");
  }

  await targetUser.update({
    is_gym_admin: true,
    is_active: true,
    is_super_admin: false,
    is_trainee: true,
    is_coach: true,
    gym_id: gymId,
  });
}
