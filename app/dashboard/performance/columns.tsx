"use client"

import { AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

export type ClosedPnl = {
    id: string
    asset: string
    qty: number
    entryPrice: number
    exitPrice: number
    closedPnl: number
    openingFee: number
    closingFee: number
    tradeTime: string
    duration: string
}

function formatNumber(num: number) {
    return Number.isInteger(num) ? num.toString() : num.toFixed(4).replace(/\.?0+$/, "");
}

export const columns: ColumnDef<ClosedPnl>[] = [
    {
        accessorKey: "side",
        header: "Side",
        enableHiding: false
    },
    {
        accessorKey: "asset",
        header: "Asset",
        cell: ({ row }) => {
            const val = String(row.getValue("asset"));
            const iconUrl = `https://app.hyperliquid.xyz/coins/${val.replace("USDT", "")}.svg`
            const side = String(row.getValue("side"));

            return (
                <div className="flex items-center font-medium gap-2">
                    <Avatar className="items-center">
                        <AvatarImage
                            src={iconUrl}
                            alt={`${val} icon`}
                            className="w-4 h-4 rounded-none"
                        />
                        <AvatarFallback className="w-4 h-4">{val.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {val}
                    <Badge variant="outline" className="ml-2 pl-1.5">
                        {
                            side === "Sell" ? <><ArrowUpRight className="text-green-500" /> Long</> :
                                side === "Buy" ? <><ArrowDownRight className="text-destructive" /> Short</> :
                                    "-"
                        }
                    </Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "qty",
        header: () => <div>Qty</div>,
        cell: ({ row }) => <div>{row.getValue("qty")}</div>
    },
    {
        accessorKey: "avgEntryPrice",
        header: () => <div>Entry price</div>,
        cell: ({ row }) => {
            const val = row.getValue("avgEntryPrice")

            return (
                <div>
                    {formatNumber(Number(val))}
                </div>
            )
        }
    },
    {
        accessorKey: "avgExitPrice",
        header: () => <div>Exit price</div>,
        cell: ({ row }) => {
            const val = row.getValue("avgExitPrice")

            return (
                <div>
                    {formatNumber(Number(val))}
                </div>
            )
        }
    },
    {
        accessorKey: "closedPnl",
        header: () => <div>P&L</div>,
        cell: ({ row }) => {
            const val = row.getValue("closedPnl")

            return (
                <div className={cn(Number(val) < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400', "")}>
                    {formatNumber(Number(val))}
                </div>
            )
        }
    },
    {
        accessorKey: "openFee",
        header: () => <div>Opening fee</div>,
        cell: ({ row }) => {
            const val = row.getValue("openFee")

            return (
                <div>
                    {formatNumber(Number(val))}
                </div>
            )
        }
    },
    {
        accessorKey: "closeFee",
        header: () => <div>Closing fee</div>,
        cell: ({ row }) => {
            const val = row.getValue("closeFee")

            return (
                <div>
                    {formatNumber(Number(val))}
                </div>
            )
        }
    },
    {
        accessorKey: "createdTime",
        header: () => <div>Open time</div>,
        cell: ({ row }) => {
            const val = row.getValue("createdTime");
            const date = new Date(Number(val))
            // .toLocaleTimeString("en-CA", { timeZone: "Asia/Bangkok" });

            return (
                <div>
                    {
                        date.toLocaleTimeString(["en-GB"], {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }).replace(",", " ").replaceAll(".", ":").replaceAll("/", "-")
                    }
                </div>
            )
        }
    },
    {
        accessorKey: "updatedTime",
        header: () => <div>Close time</div>,
        cell: ({ row }) => {
            const val = row.getValue("updatedTime");
            const date = new Date(Number(val))

            return (
                <div>
                    {
                        date.toLocaleTimeString([], {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }).replace(",", " ").replaceAll(".", ":").replaceAll("/", "-")
                    }
                </div>
            )
        }
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => {
            const createdDate = new Date(Number(row.getValue("createdTime")));
            const updatedDate = new Date(Number(row.getValue("updatedTime")));
            const timeDiff = Number(updatedDate) - Number(createdDate);
            const totalMinutes = Math.floor(timeDiff / 1000 / 60);

            const duration = {
                hour: Math.floor(totalMinutes / 60),
                minute: totalMinutes % 60
            }

            return (
                `${duration.hour} hour ${duration.minute} minute`
            )
        }
    },
]