"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CircleCheck } from "lucide-react";
import { Moon } from "lucide-react";
import { IconCircleCheckFilled, IconMoonFilled} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge";
import { Bot } from "@/types/bot";

export const columns: ColumnDef<Bot>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "asset",
        header: "Assets",
    },
    {
        accessorKey: "start_size",
        header: "Start size",
        cell: ({ row }) => {
            const size = String(row.getValue("start_size"));

            return `${size} USDT`;
        },
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
                        <IconCircleCheckFilled className="text-green-500"/>
                    ) : (
                        <IconMoonFilled />
                    )}
                    {status}
                </Badge>
            );
        },
    },
];
