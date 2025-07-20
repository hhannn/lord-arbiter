"use client";

import { useEffect, useState } from "react";

import { useBotStore } from "@/store/useBotStore";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { CirclePlus, MoreHorizontal, Pencil, X, LoaderCircle, Rocket } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        initialState: {
            columnVisibility: {
                start_type: false, // Set 'start_type' column to be hidden by default
            },
        },
    });

    const [asset, setAsset] = useState("");
    const [start_size, setStartSize] = useState("");
    const [leverage, setLeverage] = useState("");
    const [multiplier, setMultiplier] = useState("");
    const [take_profit, setTakeProfit] = useState("");
    const [rebuy, setRebuy] = useState("");
    const [start_type, setStartType] = useState("percent_equity");
    const { data: bots, fetchBots, loading } = useBotStore();
    const [dialogOpen, setDialogOpen] = useState(false);

    const [errors, setErrors] = useState({
        asset: false,
        start_size: false,
        leverage: false,
        multiplier: false,
        take_profit: false,
        rebuy: false,
    });

    const isMounted = useIsMounted();

    const API_FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
    const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    async function handleCreateBot() {
        const newErrors = {
            asset: !asset.trim(),
            start_size: !start_size.trim(),
            leverage: !leverage.trim(),
            multiplier: !multiplier.trim(),
            take_profit: !take_profit.trim(),
            rebuy: !rebuy.trim(),
            start_type: !start_type.trim(),
        };

        setErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        if (hasError) return;

        try {
            const res = await fetch(`${API_BACKEND_URL}/api/bots/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    asset,
                    start_size: parseFloat(start_size),
                    leverage: parseFloat(leverage),
                    multiplier: parseFloat(multiplier),
                    take_profit: parseFloat(take_profit),
                    rebuy: parseFloat(rebuy),
                    start_type
                }),
            });

            const newBot = await res.json();

            if (!res.ok) {
                console.error("❌ Failed to create bot", newBot);
                toast.error("Failed to create bot", {
                    description:
                        typeof newBot === "object" && newBot?.detail
                            ? newBot.detail
                            : "Unexpected error occurred",
                });
            } else {
                console.log("✅ Bot created:", newBot);
                const currentTime = new Date();
                toast.success(`Bot has been created for ${asset}`, {
                    description: String(currentTime.toLocaleDateString),
                });
                setDialogOpen(false);
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

    async function editBot(botId: number) {
        const res = await fetch(`${API_BACKEND_URL}/api/bots/edit/${botId}`, {
            method: "POST",
        });

        if (res.ok) {
            toast.success(`Edited bot ${botId}`);
            fetchBots(); // Refresh table status
        } else {
            toast.error("❌ Failed to start bot");
        }
    }

    async function deleteBot(botId: number) {
        toast(`Starting bot ${botId}.`);
        const res = await fetch(`${API_BACKEND_URL}/api/bots/delete/${botId}`, {
            method: "POST",
        });

        if (res.ok) {
            toast.success(`Bot ${botId} has been deleted.`);
            fetchBots(); // Refresh table status
        } else {
            toast.error("❌ Failed to delete bot");
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
            const res = await fetch(
                `${API_BACKEND_URL}/api/bots/stop/${botId}`,
                {
                    method: "POST",
                }
            );

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
                                        user_id:
                                            localStorage.getItem("user_id"), // Make sure your bot object includes this
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
        <div className="rounded-md border flex flex-col gap-4 bg-card overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-6 py-4">
                <span className="text-2xl font-medium">Running Bot</span>
                <div className="flex items-center gap-2">
                    <Button
                        className="bg-red-800 text-white hover:bg-red-700"
                        size="sm"
                    >
                        Stop all bots
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
                        {isMounted && (
                            <DialogTrigger asChild>
                                <Button
                                    className="ml-auto"
                                    size="sm"
                                    onClick={() => setDialogOpen(true)}
                                >
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
                                    Test
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Assets
                                </span>
                                <AssetsCombobox onSelect={setAsset} />
                            </div>
                            <Separator className="my-4" />
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Start size
                                </span>
                                <div className="flex gap-2 w-full">
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
                                    <Select onValueChange={(value) => setStartType(value)} value={start_type}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue
                                                placeholder={"% of equity"}
                                            ></SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="percent_equity" defaultChecked={true}>% of equity</SelectItem>
                                                <SelectItem value="USDT">USDT</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Leverage
                                </span>
                                <div className="w-full">
                                    <Input
                                        type="number"
                                        step="any"
                                        value={leverage}
                                        onChange={(e) =>
                                            setLeverage(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Multiplier
                                </span>
                                <div className="w-full">
                                    <Input
                                        type="number"
                                        step="any"
                                        value={multiplier}
                                        onChange={(e) =>
                                            setMultiplier(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Take Profit
                                </span>
                                <div className="w-full">
                                    <Input
                                        type="number"
                                        step="any"
                                        value={take_profit}
                                        onChange={(e) =>
                                            setTakeProfit(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Rebuy
                                </span>
                                <div className="w-full">
                                    <Input
                                        type="number"
                                        step="any"
                                        value={rebuy}
                                        onChange={(e) =>
                                            setRebuy(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
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
                <TableHeader className="">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header, index) => { // <-- Add index here
                                const isFirstHeader = index === 0;
                                const isLastHeader = index === headerGroup.headers.length - 1;

                                return (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            isFirstHeader ? "pl-6": // Add left padding to the first header
                                            isLastHeader ? "pr-6" : ""   // Add right padding to the last header
                                        }
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
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell, index) => { // <-- Add index here
                                    const isFirstDataCell = index === 0;

                                    return (
                                        <TableCell
                                            key={cell.id}
                                            className={isFirstDataCell ? "pl-6" : ""}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    );
                                })}
                                {/* This is your dedicated action column, which is the rightmost */}
                                <TableCell className="py-2 pr-6"> {/* <-- Apply right padding here */}
                                    {(() => {
                                        const { id, status } = row.original as {
                                            id: number;
                                            status: string;
                                            asset: string;
                                            start_size: number;
                                            leverage: number;
                                            multiplier: number;
                                            take_profit: number;
                                            rebuy: number;
                                            start_type: string;
                                        };

                                        switch (status) {
                                            case "idle":
                                                return (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger>
                                                            <Button
                                                                className="my-2 size-8"
                                                                size="icon"
                                                                variant="secondary"
                                                                title="More action"
                                                            >
                                                                <MoreHorizontal />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem onClick={() => startBot(id)}>
                                                                    <Rocket />
                                                                    Run
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="ps-8">
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem className="text-red-400" onClick={() => deleteBot(id)}>
                                                                    <X className="text-red-400" />
                                                                    Delete bot
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                                className="h-24 text-center py-2 pl-6 pr-6" // <-- Apply padding here too
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
