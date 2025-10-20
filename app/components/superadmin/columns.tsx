"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { GymRowData } from "@guy-vaserman/shared-my-training-app";
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
import type { GymHandlers } from "./GymManager";

const ColorSwatch = ({ color }: { color: string }) => {
  return (
    <div dir="ltr" className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded border border-gray-300"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-mono">{color}</span>
    </div>
  );
};

export const getColumns = (handlers: GymHandlers) => {
  const tCommon = useTranslations("Common");
  const t = useTranslations("Components.GymManager");

  const columns: ColumnDef<GymRowData>[] = [
    {
      accessorKey: "gym_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("gymId")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-mono text-sm">{row.getValue("gym_id")}</div>
        );
      },
    },
    {
      accessorKey: "english_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("englishName")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">{row.getValue("english_name")}</div>
        );
      },
    },
    {
      accessorKey: "hebrew_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("hebrewName")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium" dir="rtl">
            {row.getValue("hebrew_name")}
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
      accessorKey: "primary_color",
      header: t("primaryColor"),
      cell: ({ row }) => {
        const color = row.getValue("primary_color") as string;
        return <ColorSwatch color={color} />;
      },
    },
    {
      accessorKey: "primary_color_foreground",
      header: t("foregroundColor"),
      cell: ({ row }) => {
        const color = row.getValue("primary_color_foreground") as string;
        return <ColorSwatch color={color} />;
      },
    },
    {
      accessorKey: "userCount",
      header: t("userCount"),
      cell: ({ row }) => {
        return <div className="text-sm">{row.getValue("userCount")}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("created")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return (
          <div className="text-sm">{new Date(date).toLocaleDateString()}</div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("updated")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as Date;
        return (
          <div className="text-sm">{new Date(date).toLocaleDateString()}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const gym = row.original;

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

              <DropdownMenuItem onClick={() => handlers.onEditGym(gym)}>
                {t("editGym")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handlers.onAssignGymAdmin(gym)}>
                {t("assignGymAdmin")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handlers.onDeleteGym(gym)}
              >
                {t("deleteGym")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return columns;
};
