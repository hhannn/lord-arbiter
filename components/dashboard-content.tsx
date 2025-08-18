// dashboard-content.tsx

"use client";

import React, {
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useUserData } from "@/store/useUserData";

import { ChartBarNegative } from "@/components/charts/chart-bar-negative";
import { ChartLineDefault } from "@/components/charts/chart-line-default";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";

import { DashboardContext } from "@/context/dashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { PnlCardContent } from "./pnl-card-content";
import { DateRangePicker } from "./date-range-picker";
import { DateRange } from "react-day-picker";
import { add, addDays, startOfWeek } from "date-fns";

// ----- Types -----
interface DashboardData {
    equity: number;
    unrealizedPnl: number;
    time: string;
    dailyPnl: {
        date: string;
        pnl: number;
    }[];
    totalPnl: number;
    transactionLog: {
        symbol: string;
        change: string;
        transactionTime: string;
        cashBalance: string
    }[];
    averageTradeDuration: {
        hour: number;
        minute: number;
    };
    totalClosedOrders: string;
}

interface DashboardContentProps {
    children: ReactNode;
}

const today = new Date()
const last7Days: DateRange = { from: addDays(today, -6), to: today }

// ----- Component -----
export default function DashboardContent({ children }: DashboardContentProps) {
    useAuthRedirect();

    const { data } = useUserData();

    const [initialLoading, setInitialLoading] = useState(true);
    const [monthly, setMonthly] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(last7Days);

    useEffect(() => {
        const store = useUserData.getState();
        store.startPolling();
        setInitialLoading(false)

        return () => store.stopPolling();
    }, []);

    type Transaction = {
        symbol: string;
        side: string;
        change: string;
        transactionTime: string;
        cashBalance: string;
    };

    const dashboardData: DashboardData | null = useMemo(() => {
        const walletBalance = data?.balance?.result?.list?.[0];
        if (!walletBalance) return null;

        const calculateDailyPnl = (transactions: Transaction[]) => {
            if (!dateRange?.from) return [];

            const map: Record<string, number> = {};

            transactions.forEach((trx) => {
                const date = new Date(Number(trx.transactionTime))
                    .toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
                map[date] = (map[date] || 0) + parseFloat(trx.change);
            });

            return Object.entries(map)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, pnl]) => ({ date, pnl }))
                .filter((item) => {
                    const rowDate = new Date(item.date + "T00:00:00"); // safe local parse
                    return rowDate >= (dateRange.from ?? new Date(0)) && rowDate <= (dateRange.to ?? new Date());
                })
        };

        const calculateTotalPnl = (dailyPnl: { date: string; pnl: number }[]) => {
            return dailyPnl.reduce((sum, item) => sum + item.pnl, 0);
        };

        const calculateTotalTrades = (transactions: Transaction[]) => {
            if (!dateRange?.from) return 0;
            return transactions.filter((item) => {
                const rowDate = new Date(Number(item.transactionTime))
                    .toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
                return new Date(rowDate) >= (dateRange.from ?? new Date()) && new Date(rowDate) <= (dateRange.to ?? new Date());
            }).length
        }

        const dailyPnl = calculateDailyPnl(data?.transactionLogs || []);
        const totalPnl = calculateTotalPnl(dailyPnl || []);
        const totalClosedOrders = calculateTotalTrades(data?.transactionLogs || [])

        // Average trade time

        const diffs: any[] = []
        data?.closedPnL?.forEach((item: any) => {
            const diff = new Date(Number(item.updatedTime)).getTime() - new Date(Number(item.createdTime)).getTime();

            diffs.push(diff)
        })

        let averageTradeDuration = {
            hour: 0,
            minute: 0
        }

        if (diffs.length > 0) {
            const totalDiff = diffs.reduce((acc, val) => acc + val)
            const diffMs = Number(totalDiff) / Number(diffs.length)
            const diffMinutes = Math.floor(diffMs / 1000 / 60);
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            averageTradeDuration = {
                hour: Number(hours),
                minute: Number(minutes)
            }
        }
        // `${hours}h ${minutes}m` //

        return {
            equity: parseFloat(walletBalance.totalEquity) || 0,
            unrealizedPnl: parseFloat(walletBalance.totalPerpUPL) || 0,
            time: data?.balance?.time
                ? new Date(data.balance.time).toLocaleString()
                : "",
            dailyPnl,
            totalPnl,
            averageTradeDuration,
            totalClosedOrders: totalClosedOrders.toString(),
            transactionLog: data.transactionLogs || [],
        };
    }, [data, monthly, dateRange]);

    if (!dashboardData || initialLoading) {
        console.log("loading")
        return (
            <div className="relative flex flex-col gap-4 w-full px-4 py-6">
                <Skeleton className="h-12" />
                <Skeleton className="h-4" />
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4 h-full w-full">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4 w-full">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                        <Skeleton className="h-72" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4 w-full">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                        <Skeleton className="h-72" />
                    </div>
                    <Skeleton className="h-full w-full" />
                </div>
                <Skeleton className="h-64" />
            </div>
        )// prevent context from being null
    }

    return (
        <DashboardContext.Provider value={dashboardData}>
            <div className="relative flex flex-col gap-4 items-stretch min-h-screen w-full py-6 px-4 md:px-0">
                <div className="flex items-end">
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-3xl font-bold mb-2">Welcome to Lord Arbiter</h1>
                        <p className="">
                            Weeping may endure for a night, but joy comes in the morning.
                        </p>
                    </div>
                    <div className="text-sm text-neutral-500 ms-auto">
                        {/* {data ? dashboardData?.time : "Loading..."} */}
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                        // rangeName="This week"
                        />
                    </div>
                </div>
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                    <div className="flex flex-col col-span-2 md:grid md:grid-cols-6 gap-4">
                        <Card className="col-span-2 justify-between gap-2">
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">Equity</CardTitle>
                                <CardTitle className="flex items-end gap-2">
                                    <span className="text-2xl 2xl:text-3xl">
                                        {dashboardData.equity.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">USDT</span>
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="flex flex-col items-start">
                                <div className={`text-sm ${dashboardData && dashboardData.unrealizedPnl >= 0 ?
                                    "text-green-600 dark:text-green-400" :
                                    "text-red-400"
                                    }`}
                                >
                                    {dashboardData.unrealizedPnl.toFixed(2)} USDT
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Total unrealized P&L
                                </p>
                            </CardFooter>
                        </Card>

                        <Card className="col-span-2 justify-between gap-2">
                            <CardHeader className="gap-2">
                                <CardTitle className="text-sm text-muted-foreground">Avg. trade duration</CardTitle>
                                <CardTitle className="font-medium lg:text-2xl 2xl:text-3xl">
                                    {dashboardData?.averageTradeDuration.hour}<span className="ms-0 text-base text-muted-foreground">h </span>
                                    {dashboardData?.averageTradeDuration.minute}<span className="text-base text-muted-foreground">m</span>
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">
                                Avg. trade duration
                            </CardFooter>
                        </Card>

                        <Card className="col-span-2 justify-between gap-2">
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">Total closed positions</CardTitle>
                                <CardTitle className="font-medium lg:text-2xl 2xl:text-3xl">{dashboardData?.totalClosedOrders}</CardTitle>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">
                                {dashboardData?.totalClosedOrders} Long / 0 Short
                            </CardFooter>
                        </Card>
                        <div className="col-span-full grid grid-cols-2 gap-4">
                            <ChartBarNegative
                                data={dashboardData?.dailyPnl || []}
                                initialLoading={initialLoading}
                            />

                            <ChartLineDefault
                                data={dashboardData?.dailyPnl || []}
                                initialLoading={initialLoading}
                            />
                        </div>
                    </div>
                    <Card className="gap-2">
                        <CardHeader>
                            <CardTitle>P&L list</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 overflow-hidden">
                            <PnlCardContent data={data.closedPnL} />
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-full">
                    {children}
                </div>
            </div>
        </DashboardContext.Provider >
    );
}
