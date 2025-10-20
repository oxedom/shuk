"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { UserInstance } from "@guy-vaserman/shared-my-training-app";
import { useTranslations } from "next-intl";
import { Button } from "app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";
import { Badge } from "app/components/ui/badge";
import { ColumnHandlers } from "./types";

const getRoleBadges = (user: UserInstance) => {
  const roles = [];
  const tCommon = useTranslations("Common.roleTypes");

  //bg-red-600
  //bg-violet-600
  //bg-blue-600
  //bg-green-600

  //bg-green-800
  //bg-red-800
  //bg-blue-800
  //bg-violet-800

  // if (user.is_super_admin)
  //   roles.push({ label: tCommon("roles.superadmin"), color: "red" as const });
  // if (user.is_trainee)
  //   roles.push({ label: tCommon("trainee"), color: "violet" as const });
  if (user.is_coach)
    roles.push({ label: tCommon("coach"), color: "blue" as const });
  if (user.is_gym_admin)
    roles.push({ label: tCommon("gymAdmin"), color: "green" as const });

  return roles;
};

export const getColumns = (handlers: ColumnHandlers) => {
  const tCommon = useTranslations("Common");
  const t = useTranslations("Components.GymAdminManager");
  const columns: ColumnDef<UserInstance>[] = [
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("name")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="font-medium">
            {user.first_name} {user.last_name}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("email")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "phone",
      header: tCommon("phone"),
      cell: ({ row }) => {
        return <div dir="ltr">{row.getValue("phone") || "—"}</div>;
      },
    },
    {
      id: "roles",
      header: tCommon("roles"),
      cell: ({ row }) => {
        const user = row.original;
        const roles = getRoleBadges(user);

        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role, index) => (
              <Badge
                key={index}
                className={`bg-${role.color}-600 hover:bg-${role.color}-800`}
              >
                {role.label}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("status")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? tCommon("active") : tCommon("inactive")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("gender")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const gender = row.getValue("gender");
        return (
          <div className="capitalize">{tCommon(`genderType.${gender}`)}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{tCommon("openMenu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.email || "")}
              >
                {tCommon("copyEmail")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers.onEditUser(user)}>
                {t("editUser")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handlers.onDeleteUser(user)}
              >
                {t("deleteUser")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  return columns;
};
