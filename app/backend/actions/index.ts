"use server";

import {
  SignupFormSchema,
  SignupFormSchemaType,
  UpdateUserSchemaType,
  updateUserSchema,
  UserInstance,
} from "@oxedom/shared-shuk";
import type {

  ApiResponse,
} from "@oxedom/shared-shuk";
import { signIn, signOut } from "app/backend/auth";

import { userService } from "../services";
import { createResponse, createError } from "../utils";
import { formatUserDataWithCountryCode } from "@oxedom/shared-shuk";
import {
  getAuthenticatedUser,
  getFullAuthenticatedUser,
} from "../services/authorizationService";
import type { Session } from "next-auth";

// --- Start of  Helper Functions ---

export async function getAuthenticatedUserAction(): Promise<
  ApiResponse<Session["user"] | null>
> {
  try {
    const user = await getAuthenticatedUser();
    return createResponse(user);
  } catch (error) {
    return createError(error, "Failed to fetch authenticated user");
  }
}

export async function getFullAuthenticatedUserAction(): Promise<
  ApiResponse<UserInstance | null>
> {
  try {
    const user = await getFullAuthenticatedUser();
    return createResponse(user);
  } catch (error) {
    return createError(error, "Failed to fetch authenticated user");
  }
}



// --- End Helper Functions ---

export async function getAllUsers(): Promise<
  ApiResponse<UserInstance[] | null>
> {
  try {
    const users = await userService.findAllUsers();

    return createResponse(users);
  } catch (error) {
    return createError(error, "Failed to fetch all users");
  }
}

export async function getUserById(userId: number) {
  try {
    const user = await userService.findUserById(userId);
    return createResponse(user);
  } catch (error) {
    return createError(error, "Failed to fetch user by ID");
  }
}



// --- End of Migrated to Services Architecture ---

export async function updateUser(userData: UpdateUserSchemaType) {
  try {
    updateUserSchema.parse(userData);

    userData.phone = formatUserDataWithCountryCode(userData);

    const updatedUser = await userService.updateUser(userData);

    return createResponse(updatedUser, "User updated successfully");
  } catch (error) {
    return createError(error, "Failed to update user");
  }
}

export async function doLogin(provider: string) {
  await signIn(provider as string, { redirectTo: "/dashboard" });
}

export async function doLogout() {
  // delete all cookies
  await signOut({ redirectTo: "/" });
}

//Used for New user Signup Form
export async function userSignup(formData: SignupFormSchemaType) {
  try {
    const userSession = await getAuthenticatedUser();
    SignupFormSchema.parse(formData);
    for (let i = 0; i < 100; i++) {
      console.log("formData", formData);
    }
    const email = userSession.email;
    if (!email) {
      throw new Error("Email is required");
    }
    await userService.userSignup(email, formData);
    return createResponse("User created successfully");
  } catch (error) {
    return createError(error, "Unknown Error");
  }
}
