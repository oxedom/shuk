"use client";
import { Button } from "app/components/ui/button";
import { Label } from "app/components/ui/label";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Pages.Settings");
  const tCommon = useTranslations("Common");
  const themes = {
    light: "light",
    dark: "dark",
  };
  const handleSetTheme = () => {
    const newTheme = theme === themes.light ? themes.dark : themes.light;
    setTimeout(() => {
      setTheme(newTheme);
    }, 50);
  };
  return (
    <div className="flex flex-col">
      <Label className="text-sm font-medium">{t("theme")}</Label>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSetTheme}
        className="mt-2"
      >
        {theme === themes.light ? <Sun /> : <Moon />}
      </Button>
    </div>
  );
}
