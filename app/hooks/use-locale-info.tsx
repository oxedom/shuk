import { useLocale } from "next-intl";

interface LocaleInfo {
  isRtl: boolean;
  locale: string;
  dir: "rtl" | "ltr";
  isHebrew: boolean;
}

export function useLocaleInfo(): LocaleInfo {
  const locale = useLocale();
  return {
    isRtl: locale === "he",
    locale,
    dir: locale === "he" ? "rtl" : "ltr",
    isHebrew: locale === "he",
  };
}
