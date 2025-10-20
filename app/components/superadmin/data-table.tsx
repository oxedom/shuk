"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";
import { Input } from "app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "app/components/ui/table";
import { useTranslations } from "next-intl";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { debounce } from "perfect-debounce";
import { GymHandlers } from "./GymManager";
import { useRouter } from "next/navigation";
import { RefreshCcwIcon } from "lucide-react";

interface DataTableProps<TData, TValue> {
  getColumns: (handlers: GymHandlers) => ColumnDef<TData, TValue>[];
  data: TData[];
  handlers: GymHandlers;
}

export function DataTable<TData, TValue>({
  getColumns,
  data,
  handlers,
}: DataTableProps<TData, TValue>) {
  const tCommon = useTranslations("Common");
  const t = useTranslations("Components.GymManager");
  const { dir } = useLocaleInfo();
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const columns = getColumns(handlers);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const handleRefresh = () => {
    const debouncedRefresh = debounce(async () => {
      router.refresh();
      table.resetColumnFilters();
      table.resetSorting();
      table.resetColumnVisibility();
      table.resetRowSelection();
    }, 200);

    debouncedRefresh();
  };

  return (
    <div dir={dir} className="w-full">
      <div className="flex items-center gap-x-2 py-3">
        <Input
          placeholder={t("filterByEnglishName")}
          value={
            (table.getColumn("english_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("english_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCcwIcon />
        </Button>
        <div className="flex items-center gap-x-2 space-x-2">
          <Input
            placeholder={t("filterByHebrewName")}
            value={
              (table.getColumn("hebrew_name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("hebrew_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button onClick={() => handlers.onAddGym()} variant="outline">
            {t("addGym")}
          </Button>

          <Button onClick={() => handlers.onAddUser()} variant="outline">
            {t("addUser")}
            {/* TRANSALTE */}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {t("columns")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {tCommon(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className={
                        header.column.id === "english_name" ||
                        header.column.id === "hebrew_name"
                          ? "lg:w-[200px]"
                          : ""
                      }
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("noGymsFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          {t("showingGyms", {
            shown: table.getRowModel().rows.length,
            total: data.length,
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {tCommon("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {tCommon("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
