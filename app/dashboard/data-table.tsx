"use client";

import { useEffect, useState } from "react";
import { Bot } from "@/types/bot";

import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";

import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PlusCircle, XIcon } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/column-visibility";
import { BotActionButtons } from "@/components/table/bot-action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CreateBotDialog } from "@/components/dialogs/create-bot";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({
            start_type: false,
            side: false,
            resonance: false,
            average_based: false,
            current_price: false,
            liq_price: false,
            leverage: false,
            start_size: false,
            avg_price: false
        });

    const [isAlertVisible, setIsAlertVisible] = useState(() => {
        const stored = localStorage.getItem("isAlertVisible");
        return stored !== null ? stored === "true" : true;
    });

    useEffect(() => {
        // save whenever it changes
        localStorage.setItem("isAlertVisible", String(isAlertVisible));
    }, [isAlertVisible]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            columnVisibility,
            sorting
        },
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    });

    return (
        <Card className="border flex flex-col items-stretch gap-4 bg-card overflow-hidden">
            <CardHeader>
                <CardTitle>Bots list</CardTitle>
                <CardDescription>A gem cannot be polished without friction, nor a man perfected without trials.</CardDescription>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-4">
                    <div className="flex items-center gap-2">
                        <Input className="max-w-md h-8"
                            placeholder="Search bot"
                            size={32}
                        />
                        <Button variant="outline" className="border-dashed h-8" size="sm">
                            <PlusCircle />
                            Side
                        </Button>
                        <Button variant="outline" className="border-dashed h-8" size="sm">
                            <PlusCircle />
                            Status
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <DataTableViewOptions table={table} />
                        <CreateBotDialog />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col px-0">
                {isAlertVisible &&
                    <Alert className="border-x-0 border-b-0 text-amber-600 dark:text-amber-500 flex items-center py-1 pe-1 rounded-none">
                        <AlertCircle />
                        <div className="w-full">
                            <AlertTitle className="-mb-0.5">Make sure that your setup will be safe in a black swan event</AlertTitle>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="!pl-0 hover:text-amber-400 hover:bg-amber-500/20 dark:hover:text-amber-400"
                            onClick={() => setIsAlertVisible(false)}
                        >
                            <XIcon className="h-5 w-5" />
                        </Button>
                    </Alert>
                }
                <div className={cn(
                    "border-y 2xl:max-w-none scroll",
                )}>
                    <Table>
                        <TableHeader className="relative">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isAssetHeader = header.id === "asset";
                                        const isIdHeader = header.id === "id";

                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "py-2",
                                                    isIdHeader && "w-[1%]",
                                                    isAssetHeader && "sticky left-0 bg-background",
                                                )}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                    <TableHead />
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="bg-none">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow className="space-x-0 bg-background"
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const isAssetCell = cell.column.id === "asset";

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "py-2",
                                                        isAssetCell && "sticky left-0 bg-background",
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        {/* Action column */}
                                        <TableCell className="w-[1%] py-2 pr-4 sticky right-0 bg-background">
                                            <BotActionButtons bot={row.original as Bot} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center py-2 pl-6 pr-6"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end items-center gap-8 mx-6 mt-4">
                    <DropdownMenu>
                        <span className="text-sm font-medium">Rows per page</span>
                        <DropdownMenuTrigger className="flex items-center gap-4">
                            <Button variant="outline" size="sm">
                                25
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>10</DropdownMenuItem>
                            <DropdownMenuItem>25</DropdownMenuItem>
                            <DropdownMenuItem>50</DropdownMenuItem>
                            <DropdownMenuItem>100</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <span className="text-sm font-medium">Page 1 of 1</span>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="size-8">
                            <ChevronsLeft />
                        </Button>
                        <Button variant="outline" size="sm" className="size-8">
                            <ChevronLeft />
                        </Button>
                        <Button variant="outline" size="sm" className="size-8">
                            <ChevronRight />
                        </Button>
                        <Button variant="outline" size="sm" className="size-8">
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
