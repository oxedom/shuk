
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTranslations } from "next-intl";

type useTranslationInstanceType = ReturnType<typeof useTranslations>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isNameRtl(string: string) {
  // Remove non-letter characters (spaces, hyphens, punctuation, etc.)
  const lettersOnly = string.replace(
    /[^a-zA-Z\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F]/g,
    "",
  );

  // If no letters remain, return false
  if (lettersOnly.length === 0) {
    return false;
  }

  // Check if all remaining characters are RTL (Hebrew or Arabic)
  const rtlPattern =
    /^[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F]+$/;

  return rtlPattern.test(lettersOnly);
}

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "An error occurred";

export function isEnglish(value: string) {
  return /^[a-z0-9\s]+$/i.test(value);
}




export function getColorRGB(className: string): string | null {
  if (typeof window === "undefined") return null;
  // Create a temporary element
  const tempElement = document.createElement("div");
  // Add the Tailwind class
  tempElement.className = className;
  // Append to body (needed for computed styles)
  document.body.appendChild(tempElement);
  // Get the computed background color
  const color = window.getComputedStyle(tempElement).backgroundColor;
  // Remove the temporary element
  document.body.removeChild(tempElement);
  return color;
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength);
}

export function translateError(
  errorMessage: string | undefined,
  tZod: useTranslationInstanceType,
) {
  if (!errorMessage) return undefined;

  if (errorMessage.startsWith("Zod.errors.")) {
    const translationKey = errorMessage.replace("Zod.errors.", "");
    return tZod(translationKey);
  }

  return errorMessage;
}
