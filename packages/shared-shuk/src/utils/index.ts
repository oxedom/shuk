import {

  ApiResponse,
  SignupFormSchemaType,
  UpdateUserSchemaType,
} from "../types";

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

//Log random number
export const logRandomNumber = (): void => {
  console.log(Math.random());
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const unwrapApiResponse = <T>(
  response: ApiResponse<T>,
  fallback?: any,
): T | null => {
  const data = response.data;

  if (data === null && fallback !== undefined) {
    return fallback;
  }

  return response.data;
};

export function formatUserDataWithCountryCode(
  userData:
    | UpdateUserSchemaType

    | SignupFormSchemaType,
) {
  let phone = userData.phone;
  let countryCode = userData.countryCode;

  if (!phone || !countryCode)
    throw new Error("Phone and country code are required");

  return countryCode + phone;
}

