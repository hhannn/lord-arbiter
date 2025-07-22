"use client";

import { useEffect, useState } from "react";

import { useBotStore } from "@/store/useBotStore";
import { Bot } from "@/types/bot";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";

import { CirclePlus } from "lucide-react";

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
import { cn } from "@/lib/utils";

import { DataTableViewOptions } from "@/components/column-visibility";
import { BotActionButtons } from "@/components/bot-action-button";


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
        },
    });

    // State for Create Bot Dialog
    const [createAsset, setCreateAsset] = useState("");
    const [createStartSize, setCreateStartSize] = useState("");
    const [createLeverage, setCreateLeverage] = useState("");
    const [createMultiplier, setCreateMultiplier] = useState("");
    const [createTakeProfit, setCreateTakeProfit] = useState("");
    const [createRebuy, setCreateRebuy] = useState("");
    const [createStartType, setCreateStartType] = useState<"USDT" | "percent_equity">("percent_equity");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // State for Delete Confirmation Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingBotId, setDeletingBotId] = useState<number | null>(null);

    const { data: bots, fetchBots, loading } = useBotStore();
    const isMounted = useIsMounted();

    const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

    // Error states for both create and edit forms
    const [createErrors, setCreateErrors] = useState({
        asset: false,
        start_size: false,
        leverage: false,
        multiplier: false,
        take_profit: false,
        rebuy: false,
        start_type: false,
    });

    const [editErrors, setEditErrors] = useState({
        asset: false,
        start_size: false,
        leverage: false,
        multiplier: false,
        take_profit: false,
        rebuy: false,
        start_type: false,
    });


    // Function to reset create form fields
    const resetCreateForm = () => {
        setCreateAsset("");
        setCreateStartSize("");
        setCreateLeverage("");
        setCreateMultiplier("");
        setCreateTakeProfit("");
        setCreateRebuy("");
        setCreateStartType("percent_equity");
        setCreateErrors({
            asset: false, start_size: false, leverage: false,
            multiplier: false, take_profit: false, rebuy: false, start_type: false
        });
    };


    async function handleCreateBot() {
        const newErrors = {
            asset: !createAsset.trim(),
            start_size: !createStartSize.trim() || isNaN(parseFloat(createStartSize)) || parseFloat(createStartSize) <= 0,
            leverage: !createLeverage.trim() || isNaN(parseFloat(createLeverage)) || parseFloat(createLeverage) <= 0,
            multiplier: !createMultiplier.trim() || isNaN(parseFloat(createMultiplier)) || parseFloat(createMultiplier) <= 0,
            take_profit: !createTakeProfit.trim() || isNaN(parseFloat(createTakeProfit)) || parseFloat(createTakeProfit) <= 0,
            rebuy: !createRebuy.trim() || isNaN(parseFloat(createRebuy)) || parseFloat(createRebuy) < 0,
            start_type: !createStartType.trim(),
        };

        setCreateErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        if (hasError) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        try {
            const res = await fetch(`${API_BACKEND_URL}/api/bots/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    asset: createAsset,
                    start_size: parseFloat(createStartSize),
                    leverage: parseFloat(createLeverage),
                    multiplier: parseFloat(createMultiplier),
                    take_profit: parseFloat(createTakeProfit),
                    rebuy: parseFloat(createRebuy),
                    start_type: createStartType
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
                toast.success(`Bot has been created for ${createAsset}`, {
                    description: currentTime.toLocaleDateString(),
                });
                setCreateDialogOpen(false);
                resetCreateForm(); // Reset form after success
                fetchBots(); // Refresh table data
            }
        } catch (error) {
            console.error("❌ Error creating bot:", error);
            toast.error("An error occurred while creating the bot.");
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
            const errorData = await res.json();
            toast.error("❌ Failed to start bot", {
                description: errorData?.detail || "Unexpected error occurred",
            });
        }
    }

    // Refactored: Actual delete logic, called after confirmation
    async function confirmDeleteBot(botId: number) {
        toast(`Deleting bot ${botId}...`);
        try {
            const res = await fetch(`${API_BACKEND_URL}/api/bots/delete/${botId}`, {
                method: "DELETE", // Use DELETE method for deletion
                credentials: "include"
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("❌ Failed to delete bot", errorData);
                toast.error("❌ Failed to delete bot", {
                    description: errorData?.detail || "Unexpected error occurred",
                });
            } else {
                toast.success(`Bot ${botId} has been deleted.`);
                fetchBots(); // Refresh table status
            }
        } catch (e) {
            console.error("❌ Delete error:", e);
            toast.error("An error occurred while deleting the bot.");
        } finally {
            setDeleteDialogOpen(false); // Close dialog regardless of success/failure
            setDeletingBotId(null); // Clear deleting bot ID
        }
    }

    const [pollingBotId, setPollingBotId] = useState<number | null>(null);

    useEffect(() => {
        if (!pollingBotId) return;

        const interval = setInterval(async () => {
            await fetchBots();

            const bot = bots.find((b) => Number(b.id) === pollingBotId);
            if (bot?.status && bot.status.toLowerCase() === "idle") { // Check for "idle" status
                clearInterval(interval);
                setPollingBotId(null);
                console.log(`✅ Bot ${pollingBotId} has fully stopped`);
                toast.success(`Bot ${pollingBotId} has fully stopped.`);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [pollingBotId, bots, fetchBots]);

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
                const errorData = await res.json();
                toast.error("❌ Failed to stop bot", {
                    description: errorData?.detail || "Unexpected error occurred",
                });
            }
        } catch (e) {
            console.error("❌ Stop error:", e);
            toast.error("An error occurred while stopping the bot.");
        }
    }

    async function handleUpdateBot(botId: number, updatedData: Partial<Bot>) {
        toast(`Updating bot ${botId}...`);
        try {
            const res = await fetch(`${API_BACKEND_URL}/api/bots/edit/${botId}`, {
                method: "PUT", // Or PATCH, depending on your API
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            const responseData = await res.json();

            if (!res.ok) {
                console.error("❌ Failed to update bot", responseData);
                toast.error("Failed to update bot", {
                    description:
                        typeof responseData === "object" && responseData?.detail
                            ? responseData.detail
                            : "Unexpected error occurred",
                });
                throw new Error(responseData?.detail || "Failed to update bot"); // Propagate error for catch block in BotActionButtons
            } else {
                console.log("✅ Bot updated:", responseData);
                toast.success(`Bot ${botId} has been updated.`);
                fetchBots(); // Refresh the table data after successful update
            }
        } catch (error) {
            console.error("❌ Error updating bot:", error);
            toast.error("An error occurred while updating the bot.");
            // Re-throw the error so BotActionButtons can catch it if needed (e.g., to prevent dialog close)
            throw error;
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
                            const userId = localStorage.getItem("user_id");
                            if (!userId) {
                                console.warn("User ID not found for position update.");
                                return null;
                            }

                            const res = await fetch(
                                `${API_BACKEND_URL}/api/bot/position`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        user_id: userId,
                                        asset: bot.asset,
                                    }),
                                }
                            );

                            if (!res.ok) return null;
                            const data = await res.json();
                            return {
                                id: bot.id,
                                current_position: Number(data.size || 0),
                                unrealized_pnl: Number(data.unrealizedPnL || 0),
                                liq_price: Number(data.liqPrice || 0),
                                current_price: Number(data.markPrice || 0),
                                take_profit_price: Number(data.takeProfit || 0),
                                side: String(data.side || 0),
                                position_value: Number(data.positionValue || 0),
                            };
                        } catch (e) {
                            console.error(
                                "❌ Failed to update position for bot",
                                bot.id, e
                            );
                            return null;
                        }
                    })
            );

            useBotStore.setState((prev) => ({
                ...prev,
                data: prev.data.map((bot) => {
                    const update = updates.find((u) => u && u.id === bot.id);
                    return update ? { ...bot, ...update } : bot;
                }),
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, [bots, API_BACKEND_URL]);

    return (
        <div className="rounded-md border flex flex-col gap-4 bg-card overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-6 py-4">
                <span className="text-2xl font-medium">Running Bot</span>
                <DataTableViewOptions table={table} />
                <div className="flex items-center gap-2">
                    <Button
                        className="bg-red-800 text-white hover:bg-red-700"
                        size="sm"
                    >
                        Stop all bots
                    </Button>
                    {/* Create Bot Dialog */}
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} >
                        {isMounted && (
                            <DialogTrigger asChild>
                                <Button
                                    className="ml-auto"
                                    size="sm"
                                    onClick={() => {
                                        resetCreateForm(); // Reset form when opening
                                        setCreateDialogOpen(true);
                                    }}
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
                                    Enter the parameters for your new trading bot.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Assets
                                </span>
                                <AssetsCombobox onSelect={setCreateAsset} />
                            </div>
                            <Separator className="my-4" />
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Start size
                                </span>
                                <div className="flex gap-2 w-full">
                                    <Input
                                        className={cn(
                                            createErrors.start_size
                                                ? "border-red-500"
                                                : ""
                                        )}
                                        type="number"
                                        step="any"
                                        value={createStartSize}
                                        onChange={(e) =>
                                            setCreateStartSize(e.target.value)
                                        }
                                    />
                                    <Select
                                        onValueChange={(value) => setCreateStartType(value as "USDT" | "percent_equity")}
                                        value={createStartType}>
                                        <SelectTrigger className={cn("w-[200px]", createErrors.start_type && "border-red-500")}>
                                            <SelectValue
                                                placeholder={"% of equity"}
                                            ></SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="percent_equity">% of equity</SelectItem>
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
                                        className={cn(createErrors.leverage && "border-red-500")}
                                        type="number"
                                        step="any"
                                        value={createLeverage}
                                        onChange={(e) =>
                                            setCreateLeverage(e.target.value)
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
                                        className={cn(createErrors.multiplier && "border-red-500")}
                                        type="number"
                                        step="any"
                                        value={createMultiplier}
                                        onChange={(e) =>
                                            setCreateMultiplier(e.target.value)
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
                                        className={cn(createErrors.take_profit && "border-red-500")}
                                        type="number"
                                        step="any"
                                        value={createTakeProfit}
                                        onChange={(e) =>
                                            setCreateTakeProfit(e.target.value)
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
                                        className={cn(createErrors.rebuy && "border-red-500")}
                                        type="number"
                                        step="any"
                                        value={createRebuy}
                                        onChange={(e) =>
                                            setCreateRebuy(e.target.value)
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
                            <TableRow
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
                                                isFirstDataCell && "pl-6"
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
                                    <BotActionButtons
                                        bot={row.original as Bot}
                                        startBot={startBot}
                                        stopBot={stopBot}
                                        onDeleteBot={confirmDeleteBot}
                                        onUpdateBot={handleUpdateBot}
                                        pollingBotId={pollingBotId}
                                        API_BACKEND_URL={API_BACKEND_URL}
                                    />
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

            {/* Edit Bot Dialog */}
            {/* <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader className="flex flex-col">
                        <DialogTitle className="text-2xl">
                            Edit Bot {editingBotId}
                        </DialogTitle>
                        <DialogDescription className="flex flex-col gap-4">
                            Modify the parameters for your bot.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4 items-center">
                        <span className="w-[200px] font-medium text-white">
                            Assets
                        </span>
                        <AssetsCombobox onSelect={setEditAsset} initialValue={editAsset} />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-4 items-center">
                        <span className="w-[200px] font-medium text-white">
                            Start size
                        </span>
                        <div className="flex gap-2 w-full">
                            <Input
                                className={cn(editErrors.start_size ? "border-red-500" : "")}
                                type="number"
                                step="any"
                                value={editStartSize}
                                onChange={(e) => setEditStartSize(e.target.value)}
                            />
                            <Select onValueChange={(value) => setEditStartType(value as "USDT" | "percent_equity")} value={editStartType}>
                                <SelectTrigger className={cn("w-[200px]", editErrors.start_type && "border-red-500")}>
                                    <SelectValue placeholder={"% of equity"}></SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="percent_equity">% of equity</SelectItem>
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
                                className={cn(editErrors.leverage && "border-red-500")}
                                type="number"
                                step="any"
                                value={editLeverage}
                                onChange={(e) => setEditLeverage(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="w-[200px] font-medium text-white">
                            Multiplier
                        </span>
                        <div className="w-full">
                            <Input
                                className={cn(editErrors.multiplier && "border-red-500")}
                                type="number"
                                step="any"
                                value={editMultiplier}
                                onChange={(e) => setEditMultiplier(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="w-[200px] font-medium text-white">
                            Take Profit
                        </span>
                        <div className="w-full">
                            <Input
                                className={cn(editErrors.take_profit && "border-red-500")}
                                type="number"
                                step="any"
                                value={editTakeProfit}
                                onChange={(e) => setEditTakeProfit(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="w-[200px] font-medium text-white">
                            Rebuy
                        </span>
                        <div className="w-full">
                            <Input
                                className={cn(editErrors.rebuy && "border-red-500")}
                                type="number"
                                step="any"
                                value={editRebuy}
                                onChange={(e) => setEditRebuy(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdateBot(id)}>
                            Update Bot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </div>
    );
}
