import type { ApiResponse } from "@oxedom/shared-shuk";
import { ZodError } from "zod";
import { UniqueConstraintError } from "sequelize";
import * as Sentry from "@sentry/nextjs";

export function createResponse<T>(
  data: T,
  message = "Operation successful",
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createError(
  error: unknown,
  fallbackMessage = "An error occurred",
): ApiResponse<null> {
  const message = handleErrorObject(error, fallbackMessage);
  console.log("--------------------------------");
  console.log("-----PRINTING ERROR-----");
  console.error("error", error);
  console.log("--------------------------------");
  console.log("--------------------------------");
  return {
    success: false,
    data: null,
    message,
  };
}

function sentryHandler(error: unknown, fallbackMessage: string) {
  Sentry.captureException(error, {
    extra: {
      customMessage: fallbackMessage,
    },
    tags: {
      source: "backend",
    },
  });
}

function handleErrorObject(error: unknown, fallbackMessage: string): string {
  try {
    sentryHandler(error, fallbackMessage);
  } catch (error) {
    console.log("-----------sentryHandler Failed------------");
    console.log("Sentry Error:", error);
    console.log("------------------------------------------");
  }

  // Handle specific error types in priority order
  if (error instanceof UniqueConstraintError) {
    return "A record with this information already exists.";
  }

  if (error instanceof ZodError) {
    return "Validation error: Invalid input data.";
  }

  return fallbackMessage;
}
