"use client";
import LogoutButton from "app/components/LogoutButton";
import { Button } from "app/components/ui/button";
import { ScrollArea } from "app/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "app/components/ui/avatar";
import useGlobalStore from "app/store/globalStore";
import useUserStore from "app/store/userStore";
import { UserRole } from "@guy-vaserman/shared-my-training-app";
import { isNameRtl } from "app/libs/utils";

import { cn } from "app/libs/utils";
import { useIsMobile } from "app/hooks/use-mobile";
import {
  ClipboardPen,
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  Menu,
  Play,
  Settings,
  ShieldPlus,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function SidebarToggle() {
  const { toggleSidebar, sidebarExpanded } = useGlobalStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="hidden md:flex"
      title="Toggle sidebar"
    >
      <Menu
        className={cn(
          " transition-transform duration-300",
          sidebarExpanded ? "rotate-0" : "rotate-90",
        )}
      />
    </Button>
  );
}

function UserDisplayName() {
  const { user } = useUserStore();
  const { sidebarExpanded, isMobileSidebarOpen } = useGlobalStore();
  const isMobile = useIsMobile();

  const shouldWeDisplayAvatar =
    (isMobile && isMobileSidebarOpen) || (!isMobile && sidebarExpanded);

  const userDisplayName = user?.first_name + " " + user?.last_name;

  const isRtl = isNameRtl(userDisplayName);

  return (
    <div
      className={`${!shouldWeDisplayAvatar ? "opacity-0" : "flex"} gap-2 duration-300 transition-all items-center text-base pb-2 font-title  ${cn(isRtl ? "justify-start pr-6  " : "justify-end pl-6")}`}
    >
      {/* TODO add little circle with icon of the gym */}
      <Avatar>
        <AvatarFallback>{""}</AvatarFallback>
      </Avatar>
      {shouldWeDisplayAvatar && userDisplayName && (
        <span className={cn(shouldWeDisplayAvatar ? "block" : "hidden")}>
          {userDisplayName}
        </span>
      )}
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const t = useTranslations("Components.Sidebar");
  const { dir } = useLocaleInfo();

  const pathname = usePathname();

  const { hasAnyRole } = useUserStore();
  const {
    sidebarExpanded,
    toggleGlobalLoading,
    isMobileSidebarOpen,
    closeMobileSidebar,
    toggleMobileSidebar,
    handleLinkClick,
  } = useGlobalStore();

  useEffect(() => {
    closeMobileSidebar();
    toggleGlobalLoading(false);
  }, [pathname, closeMobileSidebar, toggleGlobalLoading]);

  useEffect(() => {
    router.refresh();
  }, [pathname]);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: t("dashboard"),
      isMobile: true,
      newTab: false,
      allowedRoles: [
        UserRole.SUPERADMIN,
        UserRole.GYM_ADMIN,
        UserRole.COACH,
        UserRole.TRAINEE,
      ],
    },
    {
      href: "/multiplay",
      icon: Play,
      isMobile: false,
      label: t("multiplay"),
      newTab: false,
      allowedRoles: [UserRole.SUPERADMIN, UserRole.GYM_ADMIN, UserRole.COACH],
    },
    {
      href: "/builder",
      icon: Dumbbell,
      isMobile: false,
      newTab: false,
      label: t("workoutBuilder"),
      allowedRoles: [UserRole.SUPERADMIN, UserRole.GYM_ADMIN, UserRole.COACH],
    },
    {
      href: "/trainees",
      icon: Users,
      isMobile: true,
      newTab: false,
      label: t("trainees"),
      allowedRoles: [UserRole.SUPERADMIN, UserRole.GYM_ADMIN, UserRole.COACH],
    },
    {
      href: "/gym-manger",
      icon: Users,
      isMobile: false,
      newTab: false,
      label: t("gym-manger"),
      allowedRoles: [UserRole.SUPERADMIN, UserRole.GYM_ADMIN],
    },
    {
      href: "/statistics",
      icon: BarChart3,
      isMobile: false,
      newTab: false,
      label: t("statistics"),
      allowedRoles: [UserRole.SUPERADMIN, UserRole.GYM_ADMIN, UserRole.COACH],
    },

    {
      href: "/settings",
      icon: Settings,
      isMobile: true,
      newTab: false,
      label: t("settings"),
      allowedRoles: [
        UserRole.SUPERADMIN,
        UserRole.GYM_ADMIN,
        UserRole.COACH,
        UserRole.TRAINEE,
      ],
    },
    {
      href: "https://forms.gle/EMwtzXC6QEE47C8x5",
      icon: ClipboardPen,
      isMobile: true,
      newTab: true,
      label: t("feedback"),
      allowedRoles: [UserRole.TRAINEE],
    },
    {
      href: "/superadmin",
      icon: ShieldPlus,
      isMobile: false,
      newTab: false,
      label: t("superadmin"),
      allowedRoles: [UserRole.SUPERADMIN],
    },
  ];

  const accessibleNavItems = navItems.filter((item) => {
    return hasAnyRole(item.allowedRoles);
  });

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "hidden border-r bg-background md:block transition-all duration-300 h-screen",
        sidebarExpanded ? "w-64" : "w-12",
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2 border-e">
        <div className={cn("flex items-center justify-between m-1 ms-auto")}>
          <SidebarToggle />
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-1 mt-2">
            {accessibleNavItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  " justify-start mx-1",
                  !sidebarExpanded && "px-2",
                )}
              >
                {sidebarExpanded && (
                  <Link
                    dir={dir}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      if (!item.newTab) {
                        handleLinkClick(item.href);
                      }
                    }}
                    className={cn("flex items-center gap-3 ")}
                    target={item.newTab ? "_blank" : "_self"}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate font-title ">{item.label}</span>
                  </Link>
                )}
              </Button>
            ))}
          </div>
          {sidebarExpanded && (
            <div
              className={cn(
                "flex-1 flex flex-col gap-2 mt-4 mx-2",
                !sidebarExpanded && "items-center",
              )}
            >
              {/* {sidebarExpanded && <SearchBar />} */}
              <div className={cn("flex gap-2", !sidebarExpanded && "flex-col")}>
                <LogoutButton />
                {/* <ThemeButton /> */}
              </div>
              <div></div>
            </div>
          )}
        </ScrollArea>
        <div className="self-end w-full">
          <UserDisplayName />
        </div>
      </div>
    </div>
  );

  // Mobile sidebar (full screen)
  const MobileSidebar = (
    <div
      className={cn(
        "fixed inset-0 z-[999] bg-background md:hidden transition-all duration-300  ease-in-out ",
        isMobileSidebarOpen
          ? "translate-x-0 overflow-y-hidden opacity-100 visible"
          : `${dir === "rtl" ? "translate-x-full" : "-translate-x-full"} opacity-0 invisible`,
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="text-muted-foreground"
            title="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-1 ">
          {accessibleNavItems
            .filter((item) => item.isMobile)
            .map((item) => (
              <Button
                key={item.href}
                asChild
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={toggleMobileSidebar}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    if (!item.newTab) {
                      handleLinkClick(item.href);
                    }
                  }}
                  prefetch={true}
                  className="flex items-center gap-3 text-lg font-title"
                  target={item.newTab ? "_blank" : "_self"}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
        </div>

        <div className="p-2 border-t ">
          {/* <SearchBar /> */}
          <div className="flex flex-col gap-2">
            <LogoutButton />
            <UserDisplayName />
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile toggle button (shown in header)
  const MobileToggle = (
    <div className="fixed top-0 left-0  z-[1000] w-full  bg-background md:hidden">
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden p-1 opacity-70"
        title="Open menu"
      >
        <Menu
          className={cn(
            "transition-transform w-6 h-6 duration-100 ",
            isMobileSidebarOpen ? " rotate-90" : " rotate-0 ",
          )}
        />
      </button>
    </div>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
      {MobileToggle}
    </>
  );
}
