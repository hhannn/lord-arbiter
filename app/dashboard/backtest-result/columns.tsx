"use client"

import { AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { ColumnDef, TableMeta } from "@tanstack/react-table"
import { ArrowDownRight, ArrowUpDown, ArrowUpRight } from "lucide-react"

export type Backtest = {
    asset: string
    averageBased: boolean
    startSize: string
    takeProfit: number
    multiplier: number
    rebuy: number
    maxRebuy: number
    drawdown: number
    drawdownRatio: number
    pnl: number
    roi: number
    pdRatio: number
    side: string
}

declare module "@tanstack/react-table" {
    interface TableMeta<TData> {
        onSelect?: (values: [number, number]) => void;
        onDeselect?: (values: [number, number]) => void;
    }
}

export const columns: ColumnDef<Backtest>[] = [
    {
        accessorKey: "side",
        header: "Side",
        enableHiding: false
    },
    {
        accessorKey: "averageBased",
        header: "Average based",
        enableHiding: false
    },
    {
        accessorKey: "asset",
        header: ({ column }) => {
            return (
                <Button className="-ml-2"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Asset
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row, table }) => {
            const asset = String(row.getValue("asset"));
            const baseAsset =
                asset === "HYPE" ? "HYPEH" :
                    asset === "RFC" ? "RFCR"
                        : asset.replace("USDT", "");
            const iconUrl = `https://s3-symbol-logo.tradingview.com/crypto/XTVC${baseAsset}.svg`
            const side = String(row.getValue("side"));
            const averageBased = Boolean(row.getValue("averageBased"));

            const pnl = Number(row.getValue("pnl"));
            const drawdown = Number(row.getValue("drawdown"));

            return (
                <div className="flex items-center font-medium gap-2">
                    <Checkbox className="cursor-pointer"
                        checked={row.getIsSelected()}
                        onCheckedChange={(checked) => {
                            row.toggleSelected(!!checked); // let DataTable know
                            // push values to parent via table meta
                            if (checked) {
                                table.options.meta?.onSelect?.([pnl, drawdown]);
                            } else {
                                table.options.meta?.onDeselect?.([pnl, drawdown]);
                            }
                        }}
                    />
                    <Avatar className="items-center rounded-full overflow-hidden">
                        <AvatarImage
                            src={iconUrl}
                            alt={`${asset} icon`}
                            className="w-6 h-6 rounded-none"
                        />
                        <AvatarFallback className="w-4 h-4">{asset.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {asset}
                    {/* <Badge variant="outline" className="pl-1.5">
                        {
                            side === "long" ? <><ArrowUpRight className="text-green-500" /> Long</> :
                                side === "short" ? <><ArrowDownRight className="text-destructive" /> Short</> :
                                    "-"
                        }
                    </Badge> */}
                    {averageBased && <Badge variant="outline" className="mr-2">Avg</Badge>}
                </div>
            )
        }
    },
    {
        accessorKey: "startSize",
        header: ({ column }) => {
            return (
                <Button className="-ml-4"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Start size
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-start">{row.getValue("startSize")}</div>
    },
    {
        accessorKey: "takeProfit",
        header: () => <div className="">Take profit</div>,
        cell: ({ row }) => {
            const takeProfit = Number(row.getValue("takeProfit"));
            return `${takeProfit}%`;
        }
    },
    {
        accessorKey: "multiplier",
        header: () => <div className="">Multiplier</div>,
        cell: ({ row }) => {
            const takeProfit = Number(row.getValue("multiplier"));
            return `${takeProfit}x`;
        }
    },
    {
        accessorKey: "rebuy",
        header: () => <div className="">Rebuy</div>,
        cell: ({ row }) => {
            const rebuy = Number(row.getValue("rebuy"));
            const averageBased = Boolean(row.getValue("averageBased"));

            return `${rebuy}%`;
        }
    },
    {
        accessorKey: "maxRebuy",
        header: () => <div className="">Max rebuy</div>,
        cell: ({ row }) => {
            const maxRebuy = Number(row.getValue("maxRebuy"));

            return maxRebuy === 0 ? "TBA" : maxRebuy;
        }
    },
    {
        accessorKey: "drawdown",
        header: ({ column }) => {
            return (
                <div>
                    <Button className="-ml-3"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Drawdown
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const drawdown = Number(row.getValue("drawdown"));
            const drawdownRatio = Number(row.getValue("drawdownRatio"));

            return (
                <>
                    <div>{drawdownRatio}%</div>
                    <div className="text-xs text-muted-foreground">{drawdown} USDT</div>
                </>
            );
        }
    },
    {
        accessorKey: "drawdownRatio",
        header: () => <div className="text-end">Drawdown ratio</div>,
        cell: ({ row }) => {
            const ratio = Number(row.getValue("drawdownRatio"));

            return `${ratio}%`;
        },
        enableHiding: false
    },
    {
        accessorKey: "pnl",
        header: () => <div>PnL</div>,
        cell: ({ row }) => {
            const pnl = Number(row.getValue("pnl"));
            const roi = Number(row.getValue("roi"));

            return (
                <div>
                    {pnl.toFixed(2)} USDT ( {roi}% )
                </div>
            );
        }
    },
    {
        accessorKey: "roi",
        header: ({ column }) => {
            return (
                <div className="">
                    <Button className="-ml-3"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        ROI
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const pnl = Number(row.getValue("pnl"));
            const roi = Number(row.getValue("roi"));

            return (
                <div>
                    {roi}%
                    <div className="text-muted-foreground text-xs">
                        {pnl.toFixed(2)} USDT
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "pdRatio",
        header: ({ column }) => {
            return (
                <div className="flex">
                    <Button className="-ml-3"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        P/D ratio
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const pdRatio = Number(row.getValue("pdRatio"));

            return (
                <div className="">
                    {pdRatio.toFixed(2)}
                </div>
            );
        }
    },
]