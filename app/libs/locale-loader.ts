import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

// Type for date-fns locale objects
type DateFnsLocale = any;

// Mapping of locale codes to their dynamic import functions
const LOCALE_MAP = {
  he: () => import("date-fns/locale/he").then((m) => m.he),
  en: () => import("date-fns/locale/en-US").then((m) => m.enUS),
} as const;

/**
 * Custom hook to dynamically load date-fns locales based on current locale
 * @returns {DateFnsLocale | null} The loaded date-fns locale object or null if loading/failed
 */
export function useDateFnsLocale(): DateFnsLocale | null {
  const locale = useLocale();
  const [dateFnsLocale, setDateFnsLocale] = useState<DateFnsLocale | null>(
    null,
  );

  useEffect(() => {
    const loadLocale = async () => {
      try {
        const loader =
          LOCALE_MAP[locale as keyof typeof LOCALE_MAP] || LOCALE_MAP.en;
        const localeData = await loader();
        setDateFnsLocale(localeData);
      } catch (error) {
        console.error("Failed to load date-fns locale:", error);
        setDateFnsLocale(null);
      }
    };

    loadLocale();
  }, [locale]);

  return dateFnsLocale;
}

/**
 * Utility function to get format options with locale support
 * @param locale - The date-fns locale object
 * @returns Format options object or undefined for default behavior
 */
export function getLocaleFormatOptions(locale: DateFnsLocale | null) {
  return locale ? { locale } : undefined;
}
