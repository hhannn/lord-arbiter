"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "./ui/badge";

import { MoreHorizontal, Pencil, X, LoaderCircle, Rocket, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { IconPlayerStopFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for Tailwind class merging
import { useUserData } from "@/store/useUserData";
import { BotDailyChar, BotDailyChart } from "./bot-daily-pnl-chart";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "./ui/drawer";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./ui/sheet";
import { Card, CardDescription, CardTitle } from "./ui/card";

interface BotActionButtonsProps {
    bot: Bot;
    startBot: (id: number) => Promise<void>;
    stopBot: (id: number) => Promise<void>;
    onDeleteBot: (id: number) => Promise<void>; // Renamed to avoid conflict with internal state
    onUpdateBot: (id: number, updatedData: Partial<Bot>) => Promise<void>; // Renamed for clarity
    pollingBotId: number | null; // Passed from parent to show loading state
    API_BACKEND_URL: string;
}

export function BotActionButtons({
    bot,
    startBot,
    stopBot,
    onDeleteBot,
    onUpdateBot,
    pollingBotId,
    API_BACKEND_URL,
}: BotActionButtonsProps) {
    const { id, status, asset, start_size, leverage, multiplier, take_profit,
        rebuy, start_type, current_position, liq_price, unrealized_pnl, created_at,
        take_profit_price, side, current_price, position_value } = bot;

    // State for Edit Bot Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editAsset, setEditAsset] = useState(asset);
    const [editStartSize, setEditStartSize] = useState(String(start_size));
    const [editLeverage, setEditLeverage] = useState(String(leverage));
    const [editMultiplier, setEditMultiplier] = useState(String(multiplier));
    const [editTakeProfit, setEditTakeProfit] = useState(String(take_profit));
    const [editRebuy, setEditRebuy] = useState(String(rebuy));
    const [editStartType, setEditStartType] = useState(start_type);

    // State for Delete Confirmation Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const { data, fetchData, loading } = useUserData();

    // Error states for edit form
    const [editErrors, setEditErrors] = useState({
        asset: false, start_size: false, leverage: false,
        multiplier: false, take_profit: false, rebuy: false, start_type: false,
    });

    useEffect(() => {
        const store = useUserData.getState();

        if (store.apiKey && store.apiSecret) {
            store.fetchData();
        } else {
            console.warn("API Key or Secret not available. Cannot fetch initial data.");
            toast.error("Please configure your API keys to fetch data.");
        }
    }, []);

    // Reset edit form fields when dialog opens/closes for a new bot
    useEffect(() => {
        if (editDialogOpen) {
            setEditAsset(asset);
            setEditStartSize(String(start_size));
            setEditLeverage(String(leverage));
            setEditMultiplier(String(multiplier));
            setEditTakeProfit(String(take_profit));
            setEditRebuy(String(rebuy));
            setEditStartType(start_type);
            setEditErrors({
                asset: false, start_size: false, leverage: false,
                multiplier: false, take_profit: false, rebuy: false, start_type: false
            });
        }
    }, [editDialogOpen, asset, start_size, leverage, multiplier, take_profit, rebuy, start_type]);


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
        };

        setEditErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        if (hasError) {
            toast.error("Please fill in all required fields correctly for editing.");
            return;
        }

        try {
            await onUpdateBot(id, {
                asset: editAsset,
                start_size: parseFloat(editStartSize),
                leverage: parseFloat(editLeverage),
                multiplier: parseFloat(editMultiplier),
                take_profit: parseFloat(editTakeProfit),
                rebuy: parseFloat(editRebuy),
                start_type: editStartType,
            });
            setEditDialogOpen(false);
            // Parent fetchBots will be called by onUpdateBot
        } catch (error) {
            // Error handling is already in onUpdateBot, just close dialog
            console.error("Error during bot update:", error);
        }
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    async function confirmDeleteBot() {
        try {
            await onDeleteBot(id);
        } catch (error) {
            // Error handling is already in onDeleteBot
            console.error("Error during bot deletion:", error);
        } finally {
            setDeleteDialogOpen(false);
        }
    }

    // Helper function to get the start of the day in UTC+7 (Western Indonesia Time)
    const getStartOfDayUTCPlus7 = (timestampMs: number): number => {
        // 1. Create a Date object from the original UTC timestamp
        const date = new Date(timestampMs);

        // 2. Add the UTC+7 offset to the timestamp to effectively shift it to UTC+7 time
        // 7 hours = 7 * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second
        const offsetMs = 7 * 60 * 60 * 1000;
        const dateAdjustedForUTCPlus7 = new Date(timestampMs + offsetMs);

        // 3. Get the year, month, and day components from this adjusted date,
        // using UTC methods to ensure they are consistent regardless of local browser timezone.
        const year = dateAdjustedForUTCPlus7.getUTCFullYear();
        const month = dateAdjustedForUTCPlus7.getUTCMonth();
        const day = dateAdjustedForUTCPlus7.getUTCDate();

        // 4. Construct a new Date object representing midnight of that day in UTC.
        // This timestamp, when converted back to a Date object, will represent
        // 00:00:00 UTC of the day *as determined by UTC+7*.
        const utcMidnightOfUTCPlus7Day = Date.UTC(year, month, day, 0, 0, 0, 0);

        // 5. Subtract the UTC+7 offset from this UTC midnight to get the actual
        // UTC timestamp that corresponds to 00:00:00 UTC+7.
        return utcMidnightOfUTCPlus7Day - offsetMs;
    };


    // The botPnL function (remains mostly the same, as it returns raw PnL values)
    const botPnL = () => {
        const closedPnL = data?.closedPnL?.result?.list ?? [];
        if (!closedPnL || closedPnL.length === 0) {
            console.warn("⚠️ No closed PnL data found in 'data'.", data);
            return [];
        }

        const filteredPnL = closedPnL.filter((item: { symbol: string; createdTime: any; }) => {
            const assetFilter = item.symbol === asset;
            const botCreatedAtTimestamp = created_at ? new Date(created_at).getTime() : 0;
            const timeFilter = Number(item.createdTime) > botCreatedAtTimestamp;
            return timeFilter && assetFilter;
        });

        const botPnLValues = filteredPnL.map((item: { closedPnl: string; }) => {
            return parseFloat(item.closedPnl);
        });

        return botPnLValues;
    };

    // The botClosedPnL and botAveragePnL functions (remain as previously refined)
    const botClosedPnL = () => {
        const pnlValues = botPnL();
        if (pnlValues.length === 0) {
            return "0.00";
        }
        const totalBotPnl = pnlValues.reduce((a, b) => a + b, 0);
        return totalBotPnl.toFixed(2);
    };

    const botAveragePnL = () => {
        const pnlValues = botPnL();
        if (pnlValues.length === 0) {
            return "0.00";
        }
        const totalBotPnl = pnlValues.reduce((a, b) => a + b, 0);
        const averagePnL = totalBotPnl / pnlValues.length;
        return averagePnL.toFixed(2);
    };


    // New function for daily PnL, now using UTC+7 for grouping
    const dailyBotPnL = () => {
        const closedPnL = data?.closedPnL?.result?.list ?? [];
        if (!closedPnL || closedPnL.length === 0) {
            return []; // Return an empty array if no data
        }

        const dailyPnlMap: { [date: string]: number } = {};

        closedPnL.forEach((item: { symbol: string; createdTime: any; closedPnl: string; }) => {
            const assetFilter = item.symbol === asset;
            const botCreatedAtTimestamp = created_at ? new Date(created_at).getTime() : 0;
            const timeFilter = Number(item.createdTime) > botCreatedAtTimestamp;

            if (assetFilter && timeFilter) {
                const itemTimestamp = Number(item.createdTime);
                // Use the new UTC+7 adjusted start of day
                const startOfDayTimestamp = getStartOfDayUTCPlus7(itemTimestamp);
                // Format as YYYY-MM-DD for the key
                const dateKey = new Date(startOfDayTimestamp).toISOString().split('T')[0];

                const pnlValue = parseFloat(item.closedPnl);

                if (!isNaN(pnlValue)) {
                    dailyPnlMap[dateKey] = (dailyPnlMap[dateKey] || 0) + pnlValue;
                }
            }
        });

        // Convert map to an array of objects, sorted by date
        const dailyPnlArray = Object.keys(dailyPnlMap)
            .sort() // Sorts dates chronologically
            .map(date => ({
                date: date,
                pnl: dailyPnlMap[date].toFixed(2)
            }));


        return (dailyPnlArray)
    };

    const handleDetailDialog = () => {
        setDetailDialogOpen(true);
        console.log(dailyBotPnL());
    }

    switch (status.toLowerCase()) {
        case "idle":
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
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            className="text-red-400"
                                            onSelect={(e) => {
                                                e.preventDefault(); // Prevent dropdown from closing
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

                    {/* Edit Bot Dialog (moved here) */}
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
                        <DropdownMenuTrigger>
                            {/* <Button
                            className="my-2 size-8"
                            size="icon"
                            variant="secondary"
                            onClick={() => stopBot(id)}
                            title="Stop bot"
                        >
                            <IconPlayerStopFilled />
                        </Button> */}
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
                            <Separator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => stopBot(id)}
                            >
                                <IconPlayerStopFilled className="text-destructive mr-2" />
                                Stop bot
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                        <SheetContent className="px-4 py-8 max-h-screen overflow-y-scroll">
                            <SheetTitle>Bot #{id} detail</SheetTitle>
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
                                    <span>{`${position_value.toFixed(2)} USDT`}</span>
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
                                    <span>{`${botClosedPnL()} USDT`}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">Average PnL</span>
                                    <span>{`${botAveragePnL()} USDT`}</span>
                                </div>
                                <Card className="col-span-full px-4 gap-2">
                                    <CardTitle>Daily bot PnL</CardTitle>
                                    <CardDescription>Last 7 days</CardDescription>
                                    <BotDailyChart className="max-h-[100px]" dailyPnl={dailyBotPnL()}></BotDailyChart>
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
