import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { useEffect, useMemo } from "react";
import { Bot } from "@/types/bot";
import { useUserData } from "@/store/useUserData";
import { useDashboardData } from "@/context/dashboardContext";
import { BotDailyChart } from "../charts/bot-daily-pnl-chart";

interface BotDetailDialogProps {
    bot: Bot;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

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

export function BotDetailDialog({ bot, open, onOpenChange }: BotDetailDialogProps) {

    const dashboardData = useDashboardData();
    const { data: userData, fetchData, loading: userDataLoading } = useUserData();

    // Fetch user data on mount (if not already fetched by parent or other means)
    useEffect(() => {
        const store = useUserData.getState();

        store.fetchData();
        // console.log(userData.closedPnL.result)
    }, []);

    // Calculate bot PnL values using useMemo to optimize
    const botPnLValues = useMemo(() => {
        const closedPnL = userData?.closedPnL?.result?.list ?? [];
        if (!closedPnL || closedPnL.length === 0) {
            return [];
        }

        const filteredPnL = closedPnL.filter((item: { symbol: string; createdTime: any; }) => {
            const assetFilter = item.symbol === bot.asset;
            const botCreatedAtTimestamp = bot.created_at ? new Date(bot.created_at).getTime() : 0;
            const timeFilter = Number(item.createdTime) > botCreatedAtTimestamp;
            return timeFilter && assetFilter;
        });

        return filteredPnL.map((item: { closedPnl: string; }) => {
            return parseFloat(item.closedPnl);
        });
    }, [userData, bot.asset, bot.created_at]); // Re-calculate if userData, asset, or created_at changes

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
        const botCreatedAtTimestamp = bot.created_at ? new Date(bot.created_at).getTime() : 0;

        userData?.closedPnL.result.list.forEach((item: any) => {

            const itemTimestamp = Number(item.updatedTime);
            const timeFilter = itemTimestamp >= botCreatedAtTimestamp
            const assetFilter = item.symbol === bot.asset;

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
            const assetFilter = item.symbol === bot.asset;

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
    }, [userData, bot.asset, bot.created_at, dashboardData.transactionLog]); // Added transaction_log to dependencies

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col gap-2 px-4 py-4 max-h-screen overflow-y-scroll">
                <SheetTitle className="mb-0">Bot #{bot.id} detail</SheetTitle>
                <SheetDescription className="mb-4">
                    {bot.asset}
                    <Badge variant="outline" className="ml-2 pl-1.5">
                        {
                            bot.side === "Buy" ? <><ArrowUpRight className="text-green-500" /> Long</> :
                                <><ArrowDownRight className="text-destructive" /> Short</>
                        }
                    </Badge>
                </SheetDescription>
                <div className="grid grid-cols-2 space-y-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Start size</span>
                        <span>{bot.start_size}{
                            bot.start_type === "percent_equity" ? "% of equity" :
                                " USDT"
                        }</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Leverage</span>
                        <span>{bot.leverage}x</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Position multiplier</span>
                        <span>{bot.multiplier}x</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Take profit</span>
                        <span>{bot.take_profit}%</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Rebuy percentage</span>
                        <span>{bot.rebuy}%</span>
                    </div>
                    <Separator className="col-span-full"></Separator>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Current position</span>
                        <span>{bot.current_position}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Position value</span>
                        <span>{`${bot.position_value?.toFixed(2)} USDT`}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Unrealized PnL</span>
                        <span>{`${bot.unrealized_pnl?.toFixed(2)} USDT`}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Current market price</span>
                        <span>{bot.current_price}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Take profit price</span>
                        <span>{bot.take_profit_price}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Liq. price</span>
                        <span>{bot.liq_price}</span>
                    </div>
                    <Separator className="col-span-full" />
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Total bot P&L</span>
                        <span>{`${botClosedPnL} USDT`}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Average P&L</span>
                        <span>{`${botAveragePnL} USDT`}</span>
                    </div>
                    <Card className="col-span-full px-4 gap-2">
                        <CardTitle>Daily bot P&L</CardTitle>
                        <CardDescription>Last 7 days</CardDescription>
                        <BotDailyChart className="max-h-[100px]" dailyPnl={dailyPnlChartData} />
                    </Card>
                </div>
            </SheetContent>
        </Sheet>
    )
}