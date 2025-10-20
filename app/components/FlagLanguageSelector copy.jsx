"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function FlagLanguageSelector() {
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLocaleChange = (newLocale) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    const dir = newLocale === "he" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = newLocale;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleLocaleChange("en")}
        className={`text-2xl hover:scale-110 transition-transform duration-200 ${
          currentLocale === "en" ? "opacity-100" : "opacity-60"
        }`}
        aria-label="Switch to English"
      >
        🇺🇸
      </button>
      <button
        onClick={() => handleLocaleChange("he")}
        className={`text-2xl hover:scale-110 transition-transform duration-200 ${
          currentLocale === "he" ? "opacity-100" : "opacity-60"
        }`}
        aria-label="Switch to Hebrew"
      >
        🇮🇱
      </button>
    </div>
  );
}
