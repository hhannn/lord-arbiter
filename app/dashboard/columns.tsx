"use client";

import { ColumnDef } from "@tanstack/react-table";

import { IconCircleCheckFilled, IconMoonFilled } from "@tabler/icons-react"
import { ArrowDownRight, ArrowUpDown, ArrowUpRight, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge";
import { Bot } from "@/types/bot";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { string } from "zod";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const columns: ColumnDef<Bot>[] = [
    {
        accessorKey: "id",
        enableHiding: false,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ID
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "asset",
        enableHiding: false,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Asset
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const asset = String(row.getValue("asset"));
            const baseAsset = asset === "HYPEUSDT" ? "HYPEH" : asset.replace("USDT", "");
            const iconUrl = `https://s3-symbol-logo.tradingview.com/crypto/XTVC${baseAsset}.svg`
            const side = String(row.getValue("side"));

            return (
                <div className="flex items-center font-medium gap-2">
                    <Avatar className="size-6 items-center">
                        <AvatarImage
                            src={iconUrl}
                            alt={`${asset} icon`}
                        />
                        <AvatarFallback>{asset.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {asset}
                    <Badge variant="outline" className="pl-1.5">
                        {
                            side === "Buy" ? <><ArrowUpRight className="text-green-500" /> Long</> :
                                side === "Sell" ? <><ArrowDownRight className="text-destructive" /> Short</> :
                                    "-"
                        }
                    </Badge>
                </div>
            );
        }
    },
    {
        accessorKey: "side", // This is the key that was missing
        header: "Side (Hidden)", // You can give it a header, but it won't be visible
        enableHiding: false, // Allows it to be hidden
    },
    {
        accessorKey: "start_size",
        header: "Start size",
        cell: ({ row }) => {
            const size = String(row.getValue("start_size"));
            const start_type = String(row.getValue("start_type"));
            if (start_type === "percent_equity") {
                return `${size}% of equity`;
            } else if (start_type === "USDT") {
                return `${size} USDT`;
            }

            return `${size} ${start_type}`;
        },
    },
    {
        accessorKey: "start_type", // This is the key that was missing
        header: "Start Type (Hidden)", // You can give it a header, but it won't be visible
        enableHiding: false, // Allows it to be hidden
    },
    {
        accessorKey: "leverage",
        header: "Leverage",
        cell: ({ row }) => {
            const leverage = String(row.getValue("leverage"));

            return `${leverage}x`;
        },
    },
    {
        accessorKey: "resonance",
        header: "Resonance",
        enableHiding: false,
    },
    {
        accessorKey: "multiplier",
        header: "Multiplier",
        cell: ({ row }) => {
            const multiplier = String(row.getValue("multiplier"));
            const resonance = row.getValue("resonance");

            return (
                resonance !== "A018123" ?
                    `${multiplier}x` :
                    <img className="size-4"
                        src="https://cdn.wanderer.moe/wuthering-waves/elements/T_IconElementLight_UI.png"
                        alt="Resonance"
                    />
            );
        },
    },
    {
        accessorKey: "average_based",
        header: "Average based",
        enableHiding: false,
    },
    {
        accessorKey: "take_profit",
        header: "Take profit",
        cell: ({ row }) => {
            const tp = String(row.getValue("take_profit"));

            return `${tp}%`;
        },
    },
    {
        accessorKey: "rebuy",
        header: "Rebuy",
        cell: ({ row }) => {
            const rebuy = String(row.getValue("rebuy"));
            const averageBased = String(row.getValue("average_based"));

            return (
                <>
                    {rebuy}%
                    {
                        averageBased === "true" &&
                        <Tooltip>
                            <TooltipTrigger className="ml-2">
                                <Badge variant="outline" className="pl-1.5">Avg</Badge>
                            </TooltipTrigger>
                            <TooltipContent className="">
                                Average based rebuy
                            </TooltipContent>
                        </Tooltip>
                    }
                </>
            );
        },
    },
    {
        accessorKey: "max_rebuy",
        header: "Max rebuy",
        cell: ({ row }) => {
            const max_rebuy = String(row.getValue("max_rebuy"));

            return `${max_rebuy}`;
        },
    },
    {
        accessorKey: "current_position",
        header: "Current position",
        cell: ({ row }) => {
            const symbol = String(row.getValue("asset"));
            const baseAsset = symbol.replace("USDT", "");
            let position =
                row.getValue("current_position") !== undefined
                    ? `${String(row.getValue("current_position"))} ${baseAsset}`
                    : "-";

            return `${position}`;
        },
    },
    {
        accessorKey: "current_price",
        header: "Current price",
        cell: ({ row }) => {
            let price =
                row.getValue("current_price") !== undefined
                    ? String(row.getValue("current_price"))
                    : "-";

            return `${price}`;
        },
    },
    {
        accessorKey: "liq_price",
        header: "Liq. price",
        cell: ({ row }) => {
            let price = isNaN(parseFloat(row.getValue("liq_price"))) || row.getValue("liq_price") === 0 ? "-" :
                String(row.getValue("liq_price"));

            return `${price}`;
        },
    },
    {
        accessorKey: "unrealized_pnl",
        header: "Unrealized P&L",
        cell: ({ row }) => {
            const value = row.getValue("unrealized_pnl");
            const isRunning = row.getValue("status") === "running" || row.getValue("status") === "graceful_stopping";

            return (
                <>
                    {
                        isRunning ?
                            <span className={Number(value) < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}>
                                {parseFloat(String(value || 0)).toFixed(2)} USDT
                            </span>
                            :
                            "-"
                    }
                </>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = String(row.getValue("status"));

            return (
                <Badge
                    variant={"outline"}
                    className="flex items-center"
                >
                    {status === "running" ? <IconCircleCheckFilled className="text-green-500" /> :
                        status === "graceful_stopping" ? <Clock className="text-yellow-500" /> :
                            <IconMoonFilled />
                    }
                    <span className="first-letter:uppercase">
                        {status.replace("_", " ")}
                    </span>
                </Badge>
            );
        },
        enableHiding: false,
    },
];
