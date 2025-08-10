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

import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PlusCircle } from "lucide-react";

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
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CreateBotDialog } from "@/components/dialogs/create-bot";


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
            side: false
        });

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
                <CardTitle className="text-2xl">Running Bot</CardTitle>
                <CardDescription>A gem cannot be polished without friction, nor a man perfected without trials.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
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
                        {/* <Button className="bg-red-800 text-white hover:bg-red-700 h-8" size="sm">
                            Stop all bots
                        </Button> */}
                        <CreateBotDialog />
                    </div>
                </div>
                <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader className="">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header, index) => {
                                        const isFirstHeader = index === 0;
                                        const isLastHeader = index === headerGroup.headers.length - 1;

                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "py-2",
                                                    isFirstHeader && "px-2",
                                                    isLastHeader && "px-2"
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
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="bg-background">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow className="space-x-0"
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell, index) => {
                                            const isFirstDataCell = index === 0;

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "py-2",
                                                        isFirstDataCell && "pl-6", 
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
                                        <TableCell className="py-2 pr-6">
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
                <div className="flex justify-end items-center gap-8">
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
        </Card>
    );
}
