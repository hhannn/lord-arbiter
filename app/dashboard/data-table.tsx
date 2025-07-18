"use client";

import { useEffect, useState } from "react";

import { useBotStore } from "@/store/useBotStore";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { CirclePlus, StopCircle } from "lucide-react";
import { Rocket } from "lucide-react";
import { CircleOff } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import { IconPlayerStopFilled } from "@tabler/icons-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { AssetsCombobox } from "@/components/assets-combobox";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

function useIsMounted() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);
    return isMounted;
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const [asset, setAsset] = useState("");
    const [start_size, setStartSize] = useState("");
    const [leverage, setLeverage] = useState("");
    const [multiplier, setMultiplier] = useState("");
    const [take_profit, setTakeProfit] = useState("");
    const [rebuy, setRebuy] = useState("");
    const { data: bots, fetchBots, loading } = useBotStore();

    const [errors, setErrors] = useState({
        asset: false,
        start_size: false,
        leverage: false,
        multiplier: false,
        take_profit: false,
        rebuy: false,
    });

    const isMounted = useIsMounted();

    const API_FRONTEND_URL =
        process.env.NEXT_PUBLIC_FRONTEND_URL;
    const API_BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL;

    async function handleCreateBot() {
        const newErrors = {
            asset: !asset.trim(),
            start_size: !start_size.trim(),
            leverage: !leverage.trim(),
            multiplier: !multiplier.trim(),
            take_profit: !take_profit.trim(),
            rebuy: !rebuy.trim(),
        };

        setErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        if (hasError) return;

        const user_id = localStorage.getItem("user_id"); // 👈 Get it from storage
        if (!user_id) {
            toast.error("Missing user ID. Please log in again.");
            return;
        }

        try {
            const res = await fetch(`${API_FRONTEND_URL}/api/bots`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: Number(user_id), // 👈 Include this
                    asset,
                    start_size: parseFloat(start_size),
                    leverage: parseFloat(leverage),
                    multiplier: parseFloat(multiplier),
                    take_profit: parseFloat(take_profit),
                    rebuy: parseFloat(rebuy),
                    status: "Idle",
                }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("✅ Bot created:", data);
                fetchBots();
                toast("Bot has been created.");
            } else {
                const error = await res.json();
                console.error("❌ Failed to create bot:", error);
            }
        } catch (error) {
            console.error("❌ Error creating bot:", error);
        }
    }

    async function startBot(botId: number) {
        toast(`Starting bot ${botId}.`);
        const res = await fetch(`${API_BACKEND_URL}/api/bots/start/${botId}`, {
            method: "POST",
        });

        if (res.ok) {
            toast.success(`🚀 Started bot ${botId}`);
            fetchBots(); // Refresh table status
        } else {
            toast.error("❌ Failed to start bot");
        }
    }

    const [pollingBotId, setPollingBotId] = useState<number | null>(null);

    useEffect(() => {
        if (!pollingBotId) return;

        const interval = setInterval(async () => {
            await fetchBots();

            const bot = bots.find((b) => Number(b.id) === pollingBotId);
            if (bot?.status === "Idle") {
                clearInterval(interval);
                setPollingBotId(null);
                console.log(`✅ Bot ${pollingBotId} has fully stopped`);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [pollingBotId, bots]);

    async function stopBot(botId: number) {
        try {
            const res = await fetch(`${API_BACKEND_URL}/api/bots/stop/${botId}`, {
                method: "POST",
            });

            if (res.ok) {
                toast.info(`🛑 Stopping ${botId}...`);
                setPollingBotId(botId); // trigger polling
            } else {
                toast.error("❌ Failed to stop bot");
            }
        } catch (e) {
            console.error("❌ Stop error:", e);
        }
    }

    // Get position
    useEffect(() => {
        const interval = setInterval(async () => {
            const updates = await Promise.all(
                bots
                    .filter(
                        (bot) =>
                            bot.status && bot.status.toLowerCase() === "running"
                    )
                    .map(async (bot) => {
                        try {
                            const res = await fetch(
                                `${API_BACKEND_URL}/api/bot/position`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        user_id: localStorage.getItem("user_id"), // Make sure your bot object includes this
                                        asset: bot.asset,
                                    }),
                                }
                            );

                            if (!res.ok) return null;
                            const data = await res.json();
                            return {
                                id: bot.id,
                                current_position: Number(data.size),
                                unrealized_pnl: Number(data.unrealizedPnL),
                            };
                        } catch (e) {
                            console.error(
                                "❌ Failed to update position for bot",
                                bot.id
                            );
                            return null;
                        }
                    })
            );

            // Apply updates to Zustand store
            useBotStore.setState((prev) => ({
                ...prev,
                data: prev.data.map((bot) => {
                    const update = updates.find((u) => u && u.id === bot.id);
                    return update ? { ...bot, ...update } : bot;
                }),
            }));
        }, 5000); // poll every 5 seconds

        return () => clearInterval(interval);
    }, [bots]);

    return (
        <div className="rounded-md border p-4 flex flex-col gap-4 bg-neutral-900">
            <div className="flex items-start justify-between gap-2">
                <span className="text-2xl font-medium">Running Bot</span>
                <div className="flex items-center gap-2">
                    <Button
                        className="bg-red-800 text-white hover:bg-red-700"
                        size="sm"
                    >
                        Stop all bots
                    </Button>
                    <Dialog>
                        {isMounted && (
                            <DialogTrigger asChild>
                                <Button className="ml-auto" size="sm">
                                    <CirclePlus />
                                    Create new bot
                                </Button>
                            </DialogTrigger>
                        )}
                        <DialogContent>
                            <DialogHeader className="flex flex-col gap-8">
                                <DialogTitle className="text-2xl">
                                    Create new bot
                                </DialogTitle>
                                <DialogDescription className="flex flex-col gap-4">
                                    <div className="flex gap-4 items-center">
                                        <span className="flex-1/2 font-medium text-white">
                                            Assets
                                        </span>
                                        <AssetsCombobox onSelect={setAsset} />
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex gap-4 items-center">
                                        <span className="flex-1/2 font-medium text-white">
                                            Start size
                                        </span>
                                        <Input
                                            className={
                                                errors.start_size
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                            type="number"
                                            step="any"
                                            value={start_size}
                                            onChange={(e) =>
                                                setStartSize(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="flex-1/2 font-medium text-white">
                                            Leverage
                                        </span>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={leverage}
                                            onChange={(e) =>
                                                setLeverage(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="flex-1/2 font-medium text-white">
                                            Multiplier
                                        </span>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={multiplier}
                                            onChange={(e) =>
                                                setMultiplier(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="flex-1/2 font-medium text-white">
                                            Take Profit
                                        </span>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={take_profit}
                                            onChange={(e) =>
                                                setTakeProfit(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="flex-1/2 font-medium text-white">
                                            Rebuy
                                        </span>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={rebuy}
                                            onChange={(e) =>
                                                setRebuy(e.target.value)
                                            }
                                        />
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button onClick={handleCreateBot}>
                                    Create bot
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
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
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    {(() => {
                                        const { id, status } = row.original as {
                                            id: number;
                                            status: string;
                                        };

                                        switch (status) {
                                            case "idle":
                                                return (
                                                    <Button
                                                        className="my-2 size-8"
                                                        size="icon"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            startBot(id)
                                                        }
                                                        title="Start bot"
                                                    >
                                                        <Rocket />
                                                    </Button>
                                                );
                                            case "running":
                                                return (
                                                    <Button
                                                        className="my-2 size-8"
                                                        size="icon"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            stopBot(id)
                                                        }
                                                        title="Stop bot"
                                                    >
                                                        <IconPlayerStopFilled />
                                                    </Button>
                                                );
                                            case "stopped":
                                                return (
                                                    <Button
                                                        className="my-2 size-8"
                                                        size="icon"
                                                        variant="outline"
                                                        title="Bot is stopped"
                                                        onClick={() =>
                                                            startBot(id)
                                                        }
                                                    >
                                                        <Rocket />
                                                    </Button>
                                                );
                                            case "stopping":
                                                return (
                                                    <Button
                                                        className="my-2 size-8"
                                                        size="icon"
                                                        disabled
                                                        variant="outline"
                                                        title="Stopping bot"
                                                    >
                                                        <LoaderCircle />
                                                    </Button>
                                                );
                                            default:
                                                return null;
                                        }
                                    })()}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
