"use client";
import { doLogout } from "app/backend/actions";
import { Button } from "app/components/ui/button";
import { useTranslations } from "next-intl";
import useUserStore from "app/store/userStore";

export default function LogoutButton() {
  const t = useTranslations("Components.LogoutButton");
  const tCommon = useTranslations("Common");
  const { resetRoles } = useUserStore();

  const handleLogout = async () => {
    await doLogout();
    setTimeout(() => {
      resetRoles();
      // Todo something better then adding potential bug?
    }, 1500);
  };

  return (
    <form className="w-full" action={handleLogout}>
      <Button
        className="w-full hover:bg-destructive hover:text-destructive-foreground font-title"
        variant="outline"
      >
        <span className="font-semibold">{t("logout")}</span>
      </Button>
    </form>
  );
}
