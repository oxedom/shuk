"use server";

import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  let locale = "he";
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("NEXT_LOCALE");
    if (localeCookie?.value) {
      locale = localeCookie.value;
    }
  } catch (error) {
    console.error("Failed to get locale from cookies:", error);
  }

  return {
    locale,
    messages: (await import(`./dictionarys/${locale}.json`)).default,
  };
});
