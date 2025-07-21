"use client";

import { useEffect, useState } from "react";

import { useBotStore } from "@/store/useBotStore";
import { Bot } from "@/types/bot"; // Ensure Bot type is imported and correct

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
import { cn } from "@/lib/utils"; // Assuming you have this utility for conditional classNames

// Import AlertDialog components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


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

    // State for Create Bot Dialog
    const [createAsset, setCreateAsset] = useState("");
    const [createStartSize, setCreateStartSize] = useState("");
    const [createLeverage, setCreateLeverage] = useState("");
    const [createMultiplier, setCreateMultiplier] = useState("");
    const [createTakeProfit, setCreateTakeProfit] = useState("");
    const [createRebuy, setCreateRebuy] = useState("");
    const [createStartType, setCreateStartType] = useState("percent_equity");
    const [createDialogOpen, setCreateDialogOpen] = useState(false); // Renamed for clarity

    // State for Edit Bot Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingBotId, setEditingBotId] = useState<number | null>(null);
    const [editAsset, setEditAsset] = useState("");
    const [editStartSize, setEditStartSize] = useState("");
    const [editLeverage, setEditLeverage] = useState("");
    const [editMultiplier, setEditMultiplier] = useState("");
    const [editTakeProfit, setEditTakeProfit] = useState("");
    const [editRebuy, setEditRebuy] = useState("");
    const [editStartType, setEditStartType] = useState("percent_equity");

    // State for Delete Confirmation Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingBotId, setDeletingBotId] = useState<number | null>(null);

    const { data: bots, fetchBots, loading } = useBotStore();
    const isMounted = useIsMounted();

    const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

    // Function to reset edit form fields
    const resetEditForm = () => {
        setEditingBotId(null);
        setEditAsset("");
        setEditStartSize("");
        setEditLeverage("");
        setEditMultiplier("");
        setEditTakeProfit("");
        setEditRebuy("");
        setEditStartType("percent_equity");
        setEditErrors({
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

    // New: Function to handle opening the delete confirmation dialog
    const handleDeleteClick = (botId: number) => {
        setDeletingBotId(botId);
        setDeleteDialogOpen(true);
    };

    // Refactored: Actual delete logic, called after confirmation
    async function confirmDeleteBot() {
        if (deletingBotId === null) return;

        toast(`Deleting bot ${deletingBotId}...`);
        try {
            const res = await fetch(`${API_BACKEND_URL}/api/bots/delete/${deletingBotId}`, {
                method: "DELETE", // Use DELETE method for deletion
                credentials:"include"
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("❌ Failed to delete bot", errorData);
                toast.error("❌ Failed to delete bot", {
                    description: errorData?.detail || "Unexpected error occurred",
                });
            } else {
                toast.success(`Bot ${deletingBotId} has been deleted.`);
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

    // Function to handle opening the edit dialog and populating fields
    const handleEditClick = (bot: Bot) => {
        if (bot.status && bot.status.toLowerCase() === "running") {
            toast.error("Cannot edit a running bot.", {
                description: "Please stop the bot first before attempting to edit its parameters."
            });
            return;
        }
        setEditingBotId(bot.id);
        setEditAsset(bot.asset);
        setEditStartSize(String(bot.start_size));
        setEditLeverage(String(bot.leverage));
        setEditMultiplier(String(bot.multiplier));
        setEditTakeProfit(String(bot.take_profit));
        setEditRebuy(String(bot.rebuy));
        setEditStartType(bot.start_type);
        setEditDialogOpen(true);
    };

    // Function to handle updating a bot
    async function handleUpdateBot() {
        if (editingBotId === null) return; // Should not happen if dialog is opened correctly

        const newErrors = {
            asset: !editAsset.trim(),
            start_size: !editStartSize.trim() || isNaN(parseFloat(editStartSize)) || parseFloat(editStartSize) <= 0,
            leverage: !editLeverage.trim() || isNaN(parseFloat(editLeverage)) || parseFloat(editLeverage) <= 0,
            multiplier: !editMultiplier.trim() || isNaN(parseFloat(editMultiplier)) || parseFloat(editMultiplier) <= 0,
            take_profit: !editTakeProfit.trim() || isNaN(parseFloat(editTakeProfit)) || parseFloat(editTakeProfit) <= 0,
            rebuy: !editRebuy.trim() || isNaN(parseFloat(editRebuy)) || parseFloat(editRebuy) < 0,
            start_type: !editStartType.trim(),
        };

        setEditErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        if (hasError) {
            toast.error("Please fill in all required fields correctly for editing.");
            return;
        }

        try {
            const res = await fetch(`${API_BACKEND_URL}/api/bots/edit/${editingBotId}`, {
                method: "PUT", // Use PUT for full replacement or PATCH for partial update
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    asset: editAsset,
                    start_size: parseFloat(editStartSize),
                    leverage: parseFloat(editLeverage),
                    multiplier: parseFloat(editMultiplier),
                    take_profit: parseFloat(editTakeProfit),
                    rebuy: parseFloat(editRebuy),
                    start_type: editStartType,
                }),
            });

            const updatedBot = await res.json();

            if (!res.ok) {
                console.error("❌ Failed to update bot", updatedBot);
                toast.error("Failed to update bot", {
                    description:
                        typeof updatedBot === "object" && updatedBot?.detail
                            ? updatedBot.detail
                            : "Unexpected error occurred",
                });
            } else {
                console.log("✅ Bot updated:", updatedBot);
                toast.success(`Bot ${editingBotId} has been updated.`);
                setEditDialogOpen(false);
                resetEditForm(); // Reset form after success
                fetchBots(); // Refresh table data
            }
        } catch (error) {
            console.error("❌ Error updating bot:", error);
            toast.error("An error occurred while updating the bot.");
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
                                    <Select onValueChange={setCreateStartType} value={createStartType}>
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
                                            isFirstHeader && "pl-6",
                                            isLastHeader && "pr-6"
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
                                    {(() => {
                                        const { id, status } = row.original as Bot; // Use Bot type directly

                                        switch (status.toLowerCase()) { // Convert status to lowercase for consistent comparison
                                            case "idle":
                                            case "stopped": // Allow edit/delete for stopped bots too
                                                return (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
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
                                                                    <Rocket className="mr-2 h-4 w-4" />
                                                                    Run
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleEditClick(row.original as Bot)}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuGroup>
                                                                {/* Corrected: AlertDialog wraps the DropdownMenuItem */}
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <DropdownMenuItem
                                                                            className="text-red-400"
                                                                            onSelect={(e) => {
                                                                                // Prevent dropdown from closing immediately
                                                                                e.preventDefault();
                                                                                handleDeleteClick(id);
                                                                            }}
                                                                        >
                                                                            <X className="mr-2 h-4 w-4 text-red-400" />
                                                                            Delete bot
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently delete bot ID{" "}
                                                                                <span className="font-bold text-red-500">{deletingBotId}</span>{" "}
                                                                                and remove its data from our servers. If the bot is running, it will be stopped first.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={confirmDeleteBot} className="bg-red-500 hover:bg-red-600 text-white">
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
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
                                            case "stopping":
                                                return (
                                                    <Button
                                                        className="my-2 size-8"
                                                        size="icon"
                                                        disabled
                                                        variant="outline"
                                                        title="Stopping bot"
                                                    >
                                                        <LoaderCircle className="animate-spin" />
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
                                className="h-24 text-center py-2 pl-6 pr-6"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Edit Bot Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                            <Select onValueChange={setEditStartType} value={editStartType}>
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
                        <Button onClick={handleUpdateBot}>
                            Update Bot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
