"use client";

import { useState, useEffect, useMemo } from "react";
import { Bot } from "@/types/bot"; // Assuming your Bot interface is in types/bot.ts

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger, // Keep DialogTrigger for the edit dialog
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AssetsCombobox } from "@/components/assets-combobox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "../ui/badge";

import { MoreHorizontal, Pencil, X, LoaderCircle, Rocket, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react"; // Added FileText back
import { IconPlayerStopFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserData } from "@/store/useUserData"; // Assuming this is your user data store
import { BotDailyChart } from "./bot-daily-pnl-chart"; // Correct import and alias
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { Card, CardDescription, CardTitle } from "../ui/card"; // Assuming these are used for the chart card
import { useDashboardData } from "@/context/dashboardContext";
import { Item } from "@radix-ui/react-select";

interface BotActionButtonsProps {
    bot: Bot;
    startBot: (id: number) => Promise<void>;
    stopBot: (id: number) => Promise<void>;
    onDeleteBot: (id: number) => Promise<void>;
    onUpdateBot: (id: number, updatedData: Partial<Bot>) => Promise<void>;
}

// Helper function to get the start of the day in UTC+7 (Western Indonesia Time)
const getStartOfDayUTCPlus7 = (timestampMs: number): number => {
    const date = new Date(timestampMs);
    const offsetMs = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

    const dateAdjustedForUTCPlus7 = new Date(timestampMs + offsetMs);

    const year = dateAdjustedForUTCPlus7.getUTCFullYear();
    const month = dateAdjustedForUTCPlus7.getUTCMonth();
    const day = dateAdjustedForUTCPlus7.getUTCDate();

    const utcMidnightOfUTCPlus7Day = Date.UTC(year, month, day, 0, 0, 0, 0);

    return utcMidnightOfUTCPlus7Day - offsetMs;
};

// Define the expected type for each item in the dailyPnl array for consistency
interface DailyPnlItem {
    date: string; // YYYY-MM-DD format
    pnl: number;  // The calculated PnL for that day
    roi?: number;
    roe: number;
}

export function BotActionButtons({
    bot,
    startBot,
    stopBot,
    onDeleteBot,
    onUpdateBot,
}: BotActionButtonsProps) {
    const {
        id, status, asset, start_size, leverage, multiplier, take_profit,
        rebuy, start_type, current_position, liq_price, unrealized_pnl, created_at,
        take_profit_price, side, current_price, position_value, transaction_log, max_rebuy
    } = bot;

    const dashboardData = useDashboardData();

    // --- State for Edit Bot Dialog (LOCAL TO THIS COMPONENT) ---
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editAsset, setEditAsset] = useState(asset);
    const [editStartSize, setEditStartSize] = useState(String(start_size));
    const [editLeverage, setEditLeverage] = useState(String(leverage));
    const [editMultiplier, setEditMultiplier] = useState(String(multiplier));
    const [editTakeProfit, setEditTakeProfit] = useState(String(take_profit));
    const [editRebuy, setEditRebuy] = useState(String(rebuy));
    const [editStartType, setEditStartType] = useState<"USDT" | "percent_equity">(start_type); // Explicitly typed
    const [editMaxRebuy, setEditMaxRebuy] = useState(String(max_rebuy));

    // Error states for edit form (LOCAL TO THIS COMPONENT)
    // State for Delete Confirmation Dialog (LOCAL TO THIS COMPONENT)
    const [editErrors, setEditErrors] = useState({
        asset: false, start_size: false, leverage: false,
        multiplier: false, take_profit: false, rebuy: false, start_type: false,
        max_rebuy: false
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // State for Detail Dialog (LOCAL TO THIS COMPONENT)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Get user data from useUserData store for PnL calculations
    const { data: userData, fetchData, loading: userDataLoading } = useUserData();

    // Fetch user data on mount (if not already fetched by parent or other means)
    useEffect(() => {
        const store = useUserData.getState();
        if (store.apiKey && store.apiSecret) {
            store.fetchData();
            console.log(userData.closedPnL.result)
        } else {
            console.warn("API Key or Secret not available. Cannot fetch initial user data.");
            // toast.error("Please configure your API keys to fetch user data."); // Optional: show toast
        }
    }, []);

    // Reset edit form fields when dialog opens/closes or 'bot' prop changes
    // This ensures the form is populated with the correct bot's data
    useEffect(() => {
        if (editDialogOpen) {
            setEditAsset(asset);
            setEditStartSize(String(start_size));
            setEditLeverage(String(leverage));
            setEditMultiplier(String(multiplier));
            setEditTakeProfit(String(take_profit));
            setEditRebuy(String(rebuy));
            setEditStartType(start_type);
            setEditMaxRebuy(String(max_rebuy));
            setEditErrors({
                asset: false, start_size: false, leverage: false,
                multiplier: false, take_profit: false, rebuy: false, start_type: false,
                max_rebuy: false
            });
        }
    }, [editDialogOpen, asset, start_size, leverage, multiplier, take_profit, rebuy, start_type, max_rebuy]);


    const handleEditClick = () => {
        if (status && status.toLowerCase() === "running") {
            toast.error("Cannot edit a running bot.", {
                description: "Please stop the bot first before attempting to edit its parameters."
            });
            return;
        }
        setEditDialogOpen(true);
    };

    async function handleUpdateBot() {
        const newErrors = {
            asset: !editAsset.trim(),
            start_size: !editStartSize.trim() || isNaN(parseFloat(editStartSize)) || parseFloat(editStartSize) <= 0,
            leverage: !editLeverage.trim() || isNaN(parseFloat(editLeverage)) || parseFloat(editLeverage) <= 0,
            multiplier: !editMultiplier.trim() || isNaN(parseFloat(editMultiplier)) || parseFloat(editMultiplier) <= 0,
            take_profit: !editTakeProfit.trim() || isNaN(parseFloat(editTakeProfit)) || parseFloat(editTakeProfit) <= 0,
            rebuy: !editRebuy.trim() || isNaN(parseFloat(editRebuy)) || parseFloat(editRebuy) < 0,
            start_type: !editStartType.trim(),
            max_rebuy: !editMaxRebuy.trim() || isNaN(parseFloat(editMaxRebuy)) || parseFloat(editMaxRebuy) < 0,
        };


        setEditErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        console.log("Calculated newErrors object (JSON.stringify):", JSON.stringify(newErrors));
        console.log("Value of hasError:", hasError);
        if (hasError) {
            toast.error("Please fill in all required fields correctly for editing.");
            return;
        }

        try {
            // Call the onUpdateBot prop, which is defined in the parent (DataTable.tsx)
            // and is responsible for making the API call and refreshing the data.
            await onUpdateBot(id, {
                asset: editAsset,
                start_size: parseFloat(editStartSize),
                leverage: parseFloat(editLeverage),
                multiplier: parseFloat(editMultiplier),
                take_profit: parseFloat(editTakeProfit),
                rebuy: parseFloat(editRebuy),
                start_type: editStartType,
                max_rebuy: Number(editMaxRebuy),
            });
            setEditDialogOpen(false); // Close the dialog on successful update
        } catch (error) {
            // The error handling for the actual API call is in the parent's onUpdateBot function.
            console.error("Error during bot update (in BotActionButtons):", error);
            toast.error("Failed to update bot. Please try again.");
        }
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    async function confirmDeleteBot() {
        try {
            await onDeleteBot(id);
        } catch (error) {
            console.error("Error during bot deletion:", error);
        } finally {
            setDeleteDialogOpen(false);
        }
    }

    // Calculate bot PnL values using useMemo to optimize
    const botPnLValues = useMemo(() => {
        const closedPnL = userData?.closedPnL?.result?.list ?? [];
        if (!closedPnL || closedPnL.length === 0) {
            return [];
        }

        const filteredPnL = closedPnL.filter((item: { symbol: string; createdTime: any; }) => {
            const assetFilter = item.symbol === asset;
            const botCreatedAtTimestamp = created_at ? new Date(created_at).getTime() : 0;
            const timeFilter = Number(item.createdTime) > botCreatedAtTimestamp;
            return timeFilter && assetFilter;
        });

        return filteredPnL.map((item: { closedPnl: string; }) => {
            return parseFloat(item.closedPnl);
        });
    }, [userData, asset, created_at]); // Re-calculate if userData, asset, or created_at changes

    const botClosedPnL = useMemo(() => {
        if (botPnLValues.length === 0) {
            return "0.00";
        }
        const totalBotPnl = botPnLValues.reduce((a: any, b: any) => a + b, 0);
        return totalBotPnl.toFixed(2);
    }, [botPnLValues]);

    const botAveragePnL = useMemo(() => {
        if (botPnLValues.length === 0) {
            return "0.00";
        }
        const totalBotPnl = botPnLValues.reduce((a: any, b: any) => a + b, 0);
        const averagePnL = totalBotPnl / botPnLValues.length;
        return averagePnL.toFixed(2);
    }, [botPnLValues]);

    // Calculate daily PnL for the chart using useMemo
    const dailyPnlChartData = useMemo<DailyPnlItem[]>(() => {
        const dailyMap: Record<string, number> = {};
        const dailyROIMap: Record<string, { totalValue: number; count: number }> = {};
        const dailyROEMap: Record<string, { totalChange: number; totalCashBalanceBeforeChange: number; count: number }> = {};

        // Convert bot's created_at to a timestamp for filtering
        const botCreatedAtTimestamp = created_at ? new Date(created_at).getTime() : 0;

        userData?.closedPnL.result.list.forEach((item: any) => {

            const itemTimestamp = Number(item.updatedTime);
            const timeFilter = itemTimestamp >= botCreatedAtTimestamp
            const assetFilter = item.symbol === asset;

            if (timeFilter && assetFilter) {
                const startOfDayTimestamp = getStartOfDayUTCPlus7(itemTimestamp);
                const dateKey = new Date(startOfDayTimestamp).toISOString().split('T')[0];

                if (!dailyROIMap[dateKey]) {
                    dailyROIMap[dateKey] = {
                        totalValue: 0,
                        count: 0
                    }
                }

                dailyROIMap[dateKey].totalValue += parseFloat(item.cumEntryValue);
                dailyROIMap[dateKey].count += 1;

            }
        })

        // Process transaction logs for ROE calculation
        dashboardData.transactionLog?.forEach((item: any) => {
            const itemTimestamp = Number(item.transactionTime);
            const timeFilter = itemTimestamp >= botCreatedAtTimestamp;
            const assetFilter = item.symbol === asset;

            if (timeFilter && assetFilter) {
                const startOfDayTimestamp = getStartOfDayUTCPlus7(itemTimestamp);
                const dateKey = new Date(startOfDayTimestamp).toISOString().split('T')[0];

                const change = parseFloat(item.change);
                const cashBalance = parseFloat(item.cashBalance);

                // Calculate cash balance before this change
                const cashBalanceBeforeChange = cashBalance - change;

                if (!dailyMap[dateKey]) {
                    dailyMap[dateKey] = 0;
                }

                if (!isNaN(change)) {
                    dailyMap[dateKey] += change;
                }

                if (!dailyROEMap[dateKey]) {
                    dailyROEMap[dateKey] = {
                        totalChange: 0,
                        totalCashBalanceBeforeChange: 0,
                        count: 0
                    };
                }

                dailyROEMap[dateKey].totalChange += change;
                dailyROEMap[dateKey].totalCashBalanceBeforeChange += cashBalanceBeforeChange;
                dailyROEMap[dateKey].count += 1;
            }
        });

        // Get all unique dates from PnL, ROI, and ROE maps
        const allDates = new Set([
            ...Object.keys(dailyMap),
            ...Object.keys(dailyROIMap),
            ...Object.keys(dailyROEMap)
        ]);

        const dailyPnlArray = Array.from(allDates)
            .sort()
            .map(date => {
                const pnl = dailyMap[date] || 0;

                // Calculate ROI for this date (PnL / Investment Value * 100)
                let roi = 0;
                if (dailyROIMap[date]) {
                    const { totalValue, count } = dailyROIMap[date];

                    if (count > 0 && totalValue > 0) {
                        roi = (pnl / totalValue) * 100;
                    }
                }

                // Calculate ROE for this date (Change / Cash Balance Before Change * 100)
                let roe = 0;
                if (dailyROEMap[date]) {
                    const { totalChange, totalCashBalanceBeforeChange, count } = dailyROEMap[date];

                    if (count > 0 && totalCashBalanceBeforeChange > 0) {
                        // Calculate average cash balance before change for the day
                        const avgCashBalanceBeforeChange = totalCashBalanceBeforeChange / count;

                        // ROE formula: change / (cashBalance - change) * 100
                        roe = (totalChange / avgCashBalanceBeforeChange) * 100;
                    }
                }

                // Convert date from YYYY-MM-DD to DD-MM format
                const [year, month, day] = date.split('-');
                const formattedDate = `${day}-${month}`;

                return {
                    date: formattedDate,
                    pnl: pnl,
                    roi: parseFloat(roi.toFixed(4)), // This is actual ROI from PnL data
                    roe: parseFloat(roe.toFixed(2))  // This is ROE from transaction logs
                };
            });

        return dailyPnlArray;
    }, [userData, asset, created_at, dashboardData.transactionLog]); // Added transaction_log to dependencies

    const handleDetailDialog = () => {
        setDetailDialogOpen(true);
        // console.log(dailyPnlChartData); // Now logs the memoized array
    }

    switch (status.toLowerCase()) {
        case "idle":
        case "error":
        case "stopped":
            return (
                <>
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
                                <DropdownMenuItem onClick={handleEditClick}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleDetailDialog}>
                                    Bot details
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            className="text-red-400"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                handleDeleteClick();
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
                                                <span className="font-bold text-red-500">{id}</span>{" "}
                                                and remove its data from our servers. If the bot is running, it will be stopped first.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={confirmDeleteBot} className="bg-red-600 hover:bg-red-700 text-white">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader className="flex flex-col">
                                <DialogTitle className="text-2xl">
                                    Edit Bot {id}
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
                                    <Select
                                        onValueChange={(value) => setEditStartType(value as "USDT" | "percent_equity")}
                                        value={editStartType}
                                    >
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
                            <div className="flex gap-4 items-center">
                                <span className="w-[200px] font-medium text-white">
                                    Max Rebuy
                                </span>
                                <div className="w-full">
                                    <Input
                                        className={cn(editErrors.max_rebuy && "border-red-500")}
                                        type="number"
                                        step="any"
                                        value={editMaxRebuy}
                                        onChange={(e) => setEditMaxRebuy(e.target.value)}
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
                </>
            );
        case "running":
            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger> {/* Added asChild here */}
                            <Button
                                className="my-2 size-8"
                                size="icon"
                                variant="ghost"
                                title="More actions"
                            >
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleDetailDialog}>
                                Bot details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => stopBot(id)}
                            >
                                <IconPlayerStopFilled className="text-destructive mr-2" />
                                Stop bot
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="text-red-400"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            handleDeleteClick();
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
                                            <span className="font-bold text-red-500">{id}</span>{" "}
                                            and remove its data from our servers. If the bot is running, it will be stopped first.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={confirmDeleteBot} className="bg-red-600 hover:bg-red-700 text-white">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                        <SheetContent className="flex flex-col gap-2 px-4 py-4 max-h-screen overflow-y-scroll">
                            <SheetTitle className="mb-0">Bot #{id} detail</SheetTitle>
                            <SheetDescription className="mb-4">
                                {asset}
                                <Badge variant="outline" className="ml-2 pl-1.5">
                                    {
                                        side === "Buy" ? <><ArrowUpRight className="text-green-500" /> Long</> :
                                            <><ArrowDownRight className="text-destructive" /> Short</>
                                    }
                                </Badge>
                            </SheetDescription>
                            <div className="grid grid-cols-2 space-y-6">
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Start size</span>
                                    <span>{start_size}{
                                        start_type === "percent_equity" ? "% of equity" :
                                            " USDT"
                                    }</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Leverage</span>
                                    <span>{leverage}x</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Position multiplier</span>
                                    <span>{multiplier}x</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Take profit</span>
                                    <span>{take_profit}%</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Rebuy percentage</span>
                                    <span>{rebuy}%</span>
                                </div>
                                <Separator className="col-span-full"></Separator>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Current position</span>
                                    <span>{current_position}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Position value</span>
                                    <span>{`${position_value?.toFixed(2)} USDT`}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Unrealized PnL</span>
                                    <span>{`${unrealized_pnl?.toFixed(2)} USDT`}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Current market price</span>
                                    <span>{current_price}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Take profit price</span>
                                    <span>{take_profit_price}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Liq. price</span>
                                    <span>{liq_price}</span>
                                </div>
                                <Separator className="col-span-full" />
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Total bot PnL</span>
                                    <span>{`${botClosedPnL} USDT`}</span> {/* Use botClosedPnL directly */}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Average PnL</span>
                                    <span>{`${botAveragePnL} USDT`}</span> {/* Use botAveragePnL directly */}
                                </div>
                                <Card className="col-span-full px-4 gap-2">
                                    <CardTitle>Daily bot PnL</CardTitle>
                                    <CardDescription>Last 7 days</CardDescription>
                                    <BotDailyChart className="max-h-[100px]" dailyPnl={dailyPnlChartData} />
                                </Card>
                            </div>
                        </SheetContent>
                    </Sheet>
                </>
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
}