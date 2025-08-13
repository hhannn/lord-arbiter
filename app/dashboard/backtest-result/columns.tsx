"use client"

import { AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

export type Backtest = {
    asset: string
    averageBased: boolean
    startSize: string
    takeProfit: number
    rebuy: number
    maxRebuy: number
    drawdown: number
    drawdownRatio: number
    pnl: number
    roi: number
    pdRatio: number
    side: string
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
        header: "Asset",
        cell: ({ row }) => {
            const asset = String(row.getValue("asset"));
            const baseAsset = asset === "HYPEUSDT" ? "HYPEH" : asset.replace("USDT", "");
            const iconUrl = `https://s3-symbol-logo.tradingview.com/crypto/XTVC${baseAsset}.svg`
            const side = String(row.getValue("side"));
            const averageBased = Boolean(row.getValue("averageBased"));

            return (
                <div className="flex items-center font-medium gap-2">
                    <Avatar className="items-center rounded-full overflow-hidden">
                        <AvatarImage
                            src={iconUrl}
                            alt={`${asset} icon`}
                            className="w-6 h-6 rounded-none"
                        />
                        <AvatarFallback className="w-4 h-4">{asset.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {asset}
                    <Badge variant="outline" className="pl-1.5">
                        {
                            side === "long" ? <><ArrowUpRight className="text-green-500" /> Long</> :
                                side === "short" ? <><ArrowDownRight className="text-destructive" /> Short</> :
                                    "-"
                        }
                    </Badge>
                    {averageBased && <Badge variant="outline" className="mr-2">Avg</Badge>}
                </div>
            )
        }
    },
    {
        accessorKey: "startSize",
        header: "Start size",
        cell: ({ row }) => <div className="text-start">{row.getValue("startSize")}</div>
    },
    {
        accessorKey: "takeProfit",
        header: () => <div className="text-end">Take profit</div>,
        cell: ({ row }) => {
            const takeProfit = Number(row.getValue("takeProfit"));
            return `${takeProfit}%`;
        }
    },
    {
        accessorKey: "rebuy",
        header: () => <div className="text-end">Rebuy</div>,
        cell: ({ row }) => {
            const rebuy = Number(row.getValue("rebuy"));
            const averageBased = Boolean(row.getValue("averageBased"));

            return `${rebuy}%`;
        }
    },
    {
        accessorKey: "maxRebuy",
        header: () => <div className="text-end">Max rebuy</div>,
    },
    {
        accessorKey: "drawdown",
        header: () => <div className="text-end">Drawdown</div>,
        cell: ({ row }) => {
            const drawdown = Number(row.getValue("drawdown"));

            return `${drawdown} USDT`;
        }
    },
    {
        accessorKey: "drawdownRatio",
        header: () => <div className="text-end">Drawdown ratio</div>,
        cell: ({ row }) => {
            const ratio = Number(row.getValue("drawdownRatio"));

            return `${ratio}%`;
        }
    },
    {
        accessorKey: "pnl",
        header: () => <div className="text-end">PnL</div>,
        cell: ({ row }) => {
            const pnl = Number(row.getValue("pnl"));
            const roi = Number(row.getValue("roi"));

            return (
                <div className="text-end">
                    {pnl.toFixed(2)} USDT ( {roi}% )
                </div>
            );
        }
    },
    {
        accessorKey: "roi",
        header: () => <div className="text-end">ROI</div>,
        cell: ({ row }) => {
            const pnl = Number(row.getValue("pnl"));
            const roi = Number(row.getValue("roi"));

            return (
                <div className="text-end">
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
        header: () => <div className="text-end">P/D ratio</div>,
    },
]