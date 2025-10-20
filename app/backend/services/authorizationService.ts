import { User } from "../sequelize/models";
import { auth } from "../auth";
import { UserInstance, UserRole } from "@guy-vaserman/shared-my-training-app";
import type { Session } from "next-auth";

// === DATA ACCESS AUTHORIZATION ===

/**
 * Verifies that the current user can access data for the specified user_id
 * Uses session data instead of database queries for current user info
 * @param targetUserId The user ID being accessed
 * @throws Error if authorization fails
 */
export async function authorizeDataAccess(targetUserId: number): Promise<void> {
  const currentUser = await getAuthenticatedUser();

  const currentUserId = currentUser.user_id;
  const currentUserGymId = currentUser.gym_id;
  const userRoles = currentUser.roles || [];

  // Allow if accessing own data
  if (currentUserId.toString() === targetUserId.toString()) {
    return;
  }

  // Allow if current user is a coach from same gym as target user
  if (
    userRoles.includes(UserRole.COACH) ||
    userRoles.includes(UserRole.GYM_ADMIN)
  ) {
    const targetUser = await User.findByPk(targetUserId, {
      attributes: ["gym_id"],
    });

    if (!targetUser) {
      throw new Error("Target user not found");
    }

    if (currentUserGymId === targetUser.gym_id) {
      return;
    }
  }

  throw new Error("Unauthorized: Cannot access this users data");
}

// === GYM-BASED AUTHORIZATION ===

/**
 * Validates gym ownership for gym admin operations
 * Uses session data instead of database queries for current user info
 * @param targetGymId The gym ID being accessed
 * @throws Error if authorization fails
 */
export async function authorizeGymAccess(targetGymId: number): Promise<void> {
  const currentUser = await getAuthenticatedUser();
  const currentUserGymId = currentUser.gym_id;
  const userRoles = currentUser.roles || [];

  if (
    !userRoles.includes(UserRole.COACH) &&
    !userRoles.includes(UserRole.GYM_ADMIN)
  ) {
    throw new Error(
      "Insufficient permissions: User must be a coach or gym admin",
    );
  }

  if (currentUserGymId !== targetGymId) {
    throw new Error(
      "Permission denied: Can only manage users from your own gym",
    );
  }
}

// === ROLE-BASED AUTHORIZATION ===

/**
 * Validates user has specific roles
 * Uses session data instead of database queries for current user info
 * @param requiredRoles Array of UserRole enums that are required
 * @throws Error if authorization fails
 */
export async function authorizeRoles(requiredRoles: UserRole[]): Promise<void> {
  const currentUser = await getAuthenticatedUser();

  const userRoles = currentUser.roles || [];

  const hasRequiredRole = requiredRoles.some((role) =>
    userRoles.includes(role),
  );

  if (!hasRequiredRole) {
    const roleNames = requiredRoles
      .map((role) => role.toLowerCase().replace("_", " "))
      .join(" or ");
    console.log("Insufficient permissions: Must be", roleNames);
    throw new Error(`401: Insufficient permissions`);
  }
}

export async function getAuthenticatedUser(): Promise<Session["user"]> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }
  return session.user;
}

export async function getFullAuthenticatedUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const user = await User.findByPk(session.user.user_id);
  if (!user) {
    throw new Error("User not found");
  }
  return user.toJSON() as UserInstance;
}
