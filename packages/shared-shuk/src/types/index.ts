export type * from "../schemas";

export type * from "./models";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  GYM_ADMIN = "GYM_ADMIN",
  COACH = "COACH",
  TRAINEE = "TRAINEE",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}
export interface User {
  first_name: string;
  last_name: string;
}
