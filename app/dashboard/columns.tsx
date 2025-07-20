"use client";

import { ColumnDef } from "@tanstack/react-table";

import { IconCircleCheckFilled, IconMoonFilled } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge";
import { Bot } from "@/types/bot";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const columns: ColumnDef<Bot>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "asset",
        header: "Assets",
        cell: ({ row }) => {
            const asset = String(row.getValue("asset"));
            const iconUrl = `https://app.hyperliquid.xyz/coins/${asset.replace("USDT", "")}.svg`

            return (
                <div className="flex items-center font-medium">
                    <Avatar className="items-center">
                        <AvatarImage
                            src={iconUrl}
                            alt={`${asset} icon`}
                            className="w-5 h-5 rounded-none"
                        />
                        <AvatarFallback className="w-5 h-5">{asset.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {asset}
                </div>
            );
        }
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
        enableHiding: true, // Allows it to be hidden
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
        accessorKey: "multiplier",
        header: "Multiplier",
        cell: ({ row }) => {
            const multiplier = String(row.getValue("multiplier"));

            return `${multiplier}x`;
        },
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

            return `${rebuy}%`;
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
                    ? String(row.getValue("current_position"))
                    : "0.00";

            return `${parseFloat(String(position))} ${baseAsset}`;
        },
    },
    {
        accessorKey: "unrealized_pnl",
        header: "Unrealized PnL",
        cell: ({ row }) => {
            const value = row.getValue("unrealized_pnl");
            return `${parseFloat(String(value || 0)).toFixed(4)} USDT`;
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
                    className="flex items-center capitalize"
                >
                    {status === "running" ? (
                        <IconCircleCheckFilled className="text-green-500" />
                    ) : (
                        <IconMoonFilled />
                    )}
                    {status}
                </Badge>
            );
        },
    },
];
