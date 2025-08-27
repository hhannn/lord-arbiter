"use client"

import * as React from "react"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    VisibilityState,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { InputBase, InputBaseAdornment, InputBaseInput } from "@/components/ui/input-base"
import { ArrowDownRight, ArrowUpRight, Loader2, PlusCircle, RefreshCcw, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTableViewOptions } from "@/components/column-visibility"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconCopy } from "@tabler/icons-react"
import { CreateBotDialog } from "@/components/dialogs/create-bot"
import { Skeleton } from "@/components/ui/skeleton"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DataTableProps<TData extends Record<string, unknown>, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    refetch: () => void
    loading?: boolean
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
    columns,
    data,
    refetch,
    loading
}: DataTableProps<TData, TValue>) {
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({
            side: false,
            averageBased: false,
            pnl: false,
            drawdownRatio: false,
        });

    const [sorting, setSorting] = useState<SortingState>([])
    const [search, setSearch] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [avgRebuy, setAvgRebuy] = useState(true);
    const [normalRebuy, setNormalRebuy] = useState(true);
    const [cumRoi, setCumRoi] = useState(0);
    const [cumDrawdown, setCumDrawdown] = useState(0);
    const [searchFilled, setSearchFilled] = useState("");

    const toggleAsset = (asset: string) => {
        setSelectedAssets((prev) =>
            prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset]
        );
    };

    const filteredData = React.useMemo(() => {
        return data.filter((row) => {
            const matchesSearch = String(row.asset)
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesAsset = selectedAssets.length === 0 || selectedAssets.includes(String(row.asset));

            const matchesAvgRebuy = avgRebuy && !normalRebuy ? row.averageBased : true;
            const matchesNormalRebuy = !avgRebuy && normalRebuy ? !row.averageBased : true;

            if (!avgRebuy && !normalRebuy) {
                return false;
            }

            return matchesSearch && matchesAsset && matchesAvgRebuy && matchesNormalRebuy;
        });
    }, [data, search, selectedAssets, avgRebuy, normalRebuy]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnVisibility,
            sorting
        },
        meta: {
            onSelect: ([pnl, drawdown]: [number, number]) => {
                setCumRoi(prev => prev + pnl);
                setCumDrawdown(prev => prev + drawdown);
            },
            onDeselect: ([pnl, drawdown]: [number, number]) => {
                setCumRoi(prev => prev - pnl);
                setCumDrawdown(prev => prev - drawdown);
            },
        },
    })

    return (
        <div className="overflow-hidden rounded-xl border bg-background pt-6 pb-4">
            <div className="grid grid-cols-8 gap-4 px-6">
                <div className="border rounded-md px-4 py-2">
                    <div className="text-sm text-muted-foreground">Total ROI</div>
                    <div className="font-bold">
                        {cumRoi > 0 ? `${(cumRoi / 3).toFixed(2)}%` : "-"}
                    </div>
                </div>
                <div className="border rounded-md px-4 py-2">
                    <div className="text-sm text-muted-foreground">Total drawdown</div>
                    <div className="font-bold">
                        {cumDrawdown > 0 ? `${(cumDrawdown / 3).toFixed(2)}%` : "-"}
                    </div>
                </div>
                <div className="border rounded-md px-4 py-2">
                    <div className="text-sm text-muted-foreground">P/D ratio</div>
                    <div className="font-bold">
                        {cumDrawdown > 0 ? `${(cumRoi / cumDrawdown).toFixed(2)}` : "-"}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2 py-4 px-6">
                <div className="flex items-center gap-2">
                    <InputBase className="w-56 h-8">
                        <InputBaseAdornment>
                            <Search className="text-muted-foreground" />
                        </InputBaseAdornment>
                        <InputBaseInput placeholder="Search token"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputBase>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="border-dashed h-8" size="sm">
                                <PlusCircle />
                                Side
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem>
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                Long
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <ArrowDownRight className="h-4 w-4 text-destructive" />
                                Short
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="border-dashed h-8" size="sm">
                                <PlusCircle />
                                Assets
                                {(() => {
                                    if (selectedAssets.length > 0 && selectedAssets.length < 3) {
                                        return (
                                            <>
                                                <Separator orientation="vertical" className="mx-1" />
                                                {selectedAssets.map((asset) => {
                                                    return (
                                                        <Badge key={asset} variant="secondary" className="rounded-sm">
                                                            {asset}
                                                        </Badge>
                                                    )
                                                })}
                                            </>
                                        );
                                    } else if (selectedAssets.length > 2) {
                                        return (
                                            <>
                                                <Separator orientation="vertical" className="mx-1" />
                                                <Badge variant="secondary" className="rounded-sm">
                                                    {selectedAssets.length} assets
                                                </Badge>
                                            </>
                                        );
                                    }
                                })()}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                            <Command className="bg-none backdrop-blur-none">
                                <div className="relative">
                                    <CommandInput placeholder="Search asset"
                                        value={searchFilled}
                                        onValueChange={setSearchFilled}
                                    />
                                    {searchFilled &&
                                        <Button className="absolute top-1/2 right-0 -translate-y-1/2"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSearchFilled("")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    }
                                </div>
                                <CommandList>
                                    <CommandEmpty>No asset found.</CommandEmpty>
                                    <CommandGroup>
                                        {(() => {
                                            const counts = data.reduce((acc, item) => {
                                                acc[String(item.asset)] = (acc[String(item.asset)] || 0) + 1;
                                                return acc;
                                            }, {} as Record<string, number>);

                                            return Object.keys(counts).map((asset) => {
                                                const checked = selectedAssets.includes(asset);
                                                return (
                                                    <CommandItem
                                                        key={asset}
                                                        value={asset}
                                                        onSelect={() => {
                                                            toggleAsset(asset);
                                                            console.log(selectedAssets);
                                                        }}
                                                    >
                                                        <Checkbox checked={checked} />
                                                        {asset} ({counts[asset]})
                                                    </CommandItem>
                                                );
                                            });
                                        })()}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="border-dashed h-8" size="sm">
                                <PlusCircle />
                                Rebuy type
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {(() => {
                                const avgChecked = avgRebuy;
                                const normalChecked = normalRebuy;
                                return (
                                    <>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setAvgRebuy(!avgChecked);
                                            }}
                                        >
                                            <Checkbox checked={avgChecked} />
                                            Average based
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setNormalRebuy(!normalChecked);
                                            }}
                                        >
                                            <Checkbox checked={normalChecked} />
                                            Normal rebuy
                                        </DropdownMenuItem>
                                    </>
                                )
                            })()}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {(selectedAssets.length > 0 || !avgRebuy || !normalRebuy) &&
                        <Button className="h-8 border-dashed"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedAssets([]);
                                setAvgRebuy(true);
                                setNormalRebuy(true);
                            }}
                        >
                            <X className="size-4" /> Reset
                        </Button>
                    }
                </div>
                <div className="flex items-center gap-2">
                    <DataTableViewOptions table={table} />
                    <Button size="sm" variant="outline" disabled={loading} onClick={refetch}>
                        {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw />
                        }
                    </Button>
                </div>
            </div>
            <div className="border-t">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => {
                                    return (
                                        <TableHead key={header.id} className={
                                            cn("py-1",
                                                index === 0 ? "ps-4" :
                                                    index === headerGroup.headers.length - 1 ? "pe-4" : ""
                                            )
                                        }>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="">
                        {loading ?
                            <>
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center">
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center">
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center">
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center">
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                            </>
                            :
                            <>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow className="hover:bg-accent/50"
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell, index) => (
                                                <TableCell key={cell.id} className={
                                                    `${index === 0 ? "ps-4" :
                                                        index === row.getVisibleCells().length - 1 ? "pe-4" : ""} 
                                        `
                                                }>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                            <TableCell className="w-[1%] size-8">
                                                <CreateBotDialog
                                                    asset={`${row.getValue("asset")}USDT`}
                                                    startSize={Number(String(row.getValue("startSize")).replace(" USDT", ""))}
                                                    startType="USDT"
                                                    multiplier={row.getValue("multiplier")}
                                                    takeProfit={row.getValue("takeProfit")}
                                                    rebuy={row.getValue("rebuy")}
                                                    maxRebuy={row.getValue("maxRebuy")}
                                                    averageBased={row.getValue("averageBased")}
                                                >
                                                    <Button variant="ghost" size="icon">
                                                        <IconCopy />
                                                    </Button>
                                                </CreateBotDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}