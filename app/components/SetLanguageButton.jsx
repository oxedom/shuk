"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useLocaleInfo } from "app/hooks/use-locale-info";

import { Languages } from "lucide-react";
export default function SetLanguageButton({
  displayLabel = true,
  localeDebugMode = false,
}) {
  const router = useRouter();
  const currentLocale = useLocale();
  const t = useTranslations("Components.SetLanguageButton");
  const { dir } = useLocaleInfo();
  const locales = [
    { code: "en", name: t("english") },
    { code: "he", name: t("hebrew") },
    ...(localeDebugMode ? [{ code: "debug", name: "Debug Mode" }] : []),
  ];

  const handleLocaleChange = (newLocale) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    const dir = newLocale === "he" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = newLocale;
    router.refresh();
  };

  const currentLanguageName =
    locales.find((l) => l.code === currentLocale)?.name || currentLocale;

  return (
    <div className="flex flex-col  gap-2">
      {displayLabel && (
        <Label className="text-xl  font-medium">{t("changeLanguage")}</Label>
      )}
      <div className="flex items-center gap-x-2">
        {" "}
        <Languages className="opacity-70" />
        <Select
          dir={dir}
          onValueChange={handleLocaleChange}
          defaultValue={currentLocale}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={currentLanguageName} />
          </SelectTrigger>
          <SelectContent>
            {locales.map((locale) => (
              <SelectItem key={locale.code} value={locale.code}>
                {locale.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
