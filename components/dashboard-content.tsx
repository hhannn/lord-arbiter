// dashboard-content.tsx

"use client";

import React, {
    ReactElement,
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useUserData } from "@/store/useUserData";

import { ChartBarNegative } from "@/components/chart-bar-negative";
import { ChartLineDefault } from "@/components/chart-line-default";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

import { DashboardContext } from "@/context/dashboardContext";
import { Skeleton } from "./ui/skeleton";

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
    averageTradeDuration: string;
    totalClosedOrders: string;
}

interface DashboardContentProps {
    children: ReactNode;
}

// ----- Component -----
export default function DashboardContent({ children }: DashboardContentProps) {
    const { data } = useUserData();

    const [initialLoading, setInitialLoading] = useState(true);
    const [monthly, setMonthly] = useState(false);

    useEffect(() => {
        const store = useUserData.getState();
        const load = async () => {
            store.restoreFromStorage();
            setInitialLoading(false);

            if (store.apiKey && store.apiSecret) {
                store.fetchData();

                const interval = setInterval(() => {
                    store.fetchData();
                }, 15000);

                return () => clearInterval(interval);
            }
        };
        load();
    }, []);

    type Transaction = {
        symbol: string;
        side: string;
        change: string;
        transactionTime: string;
        cashBalance: string;
    };

    function calculateTotalPnl(transactions: Transaction[], range: "weekly" | "monthly") {
        const offsetMs = 7 * 60 * 60 * 1000;
        const now = Date.now() + offsetMs;
        const days = range === "weekly" ? 7 : 30;
        const fromTime = now - days * 24 * 60 * 60 * 1000;

        return transactions.reduce((sum, trx) => {
            const timestamp = Number(trx.transactionTime) + offsetMs;
            if (timestamp >= fromTime && timestamp <= now) {
                return sum + parseFloat(trx.change);
            }
            return sum;
        }, 0);
    }

    const dashboardData: DashboardData | null = useMemo(() => {
        const walletBalance = data?.balance?.result?.list?.[0];
        if (!walletBalance) return null;

        const calculateDailyPnl = (transactions: Transaction[]) => {
            const offset = 7 * 60 * 60 * 1000;
            const map: Record<string, number> = {};

            transactions.forEach((trx) => {
                const date = new Date(Number(trx.transactionTime) + offset)
                    .toISOString()
                    .slice(0, 10);
                map[date] = (map[date] || 0) + parseFloat(trx.change);
            });

            return Object.entries(map)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, pnl]) => ({ date, pnl }));
        };

        const dailyPnl = calculateDailyPnl(data.transactionLogs || []);
        const totalPnl = calculateTotalPnl(data.transactionLogs || [], monthly ? "monthly" : "weekly");

        // Average trade time
        const diffs: any[] = []
        data.closedPnL?.result.list.forEach((item: any) => {
            const diff = new Date(Number(item.updatedTime)).getTime() - new Date(Number(item.createdTime)).getTime();

            diffs.push(diff)
        })

        const totalDiff = diffs.reduce((acc, val) => acc + val)
        const diffMs = Number(totalDiff) / Number(diffs.length)
        const diffMinutes = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        const averageTradeDuration = `${hours}h ${minutes}m`

        return {
            equity: parseFloat(walletBalance.totalEquity) || 0,
            unrealizedPnl: parseFloat(walletBalance.totalPerpUPL) || 0,
            time: data?.balance?.time
                ? new Date(data.balance.time).toLocaleString()
                : "",
            dailyPnl,
            totalPnl,
            averageTradeDuration,
            totalClosedOrders: data.closedPnL?.result.list.length,
            transactionLog: data.transactionLogs || [],
        };
    }, [data, monthly]);

    if (!dashboardData) {
        return (
            <div className="space-y-2 px-8">
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
            </div>
        )// prevent context from being null
    }

    return (
        <DashboardContext.Provider value={dashboardData}>
            <div className="flex flex-col min-h-screen w-full px-4 py-6 pt-[80px]">
                <div className="flex flex-col md:flex-row">
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-3xl font-bold mb-2">Welcome to Lord Arbiter</h1>
                        <p className="text-neutral-600">
                            Weeping may endure for a night, but joy comes in the morning.
                        </p>
                    </div>
                    <div className="text-sm text-neutral-500 ms-auto">
                        {data ? dashboardData?.time : "Loading..."}
                        <Tabs defaultValue="7">
                            <TabsList>
                                <TabsTrigger value="7" onClick={() => setMonthly(false)}>
                                    7 days
                                </TabsTrigger>
                                <TabsTrigger value="30" onClick={() => setMonthly(true)}>
                                    30 days
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="flex flex-col md:grid grid-cols-12 gap-4 mt-6">
                    <div className="col-span-8 flex flex-col gap-4">
                        <div className="grow-0 flex items-stretch gap-4">
                            <Card className="flex-1">
                                <CardHeader>
                                    <CardTitle>Equity</CardTitle>
                                    <CardTitle className="flex items-end gap-2">
                                        <span className="text-2xl md:text-3xl">
                                            {data && dashboardData
                                                ? dashboardData.equity.toFixed(2)
                                                : "Loading..."}
                                        </span>
                                        <span className="text-sm text-muted-foreground">USDT</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardFooter className="flex flex-col items-start">
                                    <div
                                        className={`text-sm ${dashboardData && dashboardData.unrealizedPnl >= 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {data && dashboardData
                                            ? `${dashboardData.unrealizedPnl.toFixed(2)} USDT`
                                            : "Loading..."}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Total unrealized PnL
                                    </p>
                                </CardFooter>
                            </Card>

                            <Card className="flex-1 justify-between">
                                <CardHeader>
                                    <CardTitle>Total PnL</CardTitle>
                                    <CardTitle className="flex items-end gap-2">
                                        <span className="text-2xl md:text-3xl">
                                            {data && dashboardData
                                                ? dashboardData.totalPnl.toFixed(2)
                                                : "Loading..."}
                                        </span>
                                        <span className="text-sm text-muted-foreground">USDT</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardFooter className="text-sm text-muted-foreground">
                                    {monthly
                                        ? "Total closed PnL this month."
                                        : "Total closed PnL this week."}
                                </CardFooter>
                            </Card>
                            <Card className="flex-1">
                                <CardHeader className="gap-2">
                                    <CardTitle>Avg. trade duration</CardTitle>
                                    <span className="font-medium text-xl md:text-3xl">{dashboardData?.averageTradeDuration}</span>
                                </CardHeader>
                                <CardContent className="">
                                </CardContent>
                                <CardFooter className="text-sm text-muted-foreground">
                                    Avg. trade duration this week
                                </CardFooter>
                            </Card>
                            <Card className="flex-1 justify-between">
                                <CardHeader>
                                    <CardTitle>Total closed positions</CardTitle>
                                    <span className="font-medium text-xl md:text-3xl">{dashboardData?.totalClosedOrders}</span>
                                </CardHeader>
                                <CardFooter className="text-sm text-muted-foreground">
                                    {dashboardData?.totalClosedOrders} Long / 0 Short
                                </CardFooter>
                            </Card>
                        </div>
                        <div className="shrink-0 flex gap-4">
                            <ChartBarNegative
                                data={dashboardData?.dailyPnl || []}
                                initialLoading={initialLoading}
                                className="flex-1 shrink-0"
                                monthly={monthly}
                            />
                            <ChartLineDefault
                                data={dashboardData?.dailyPnl || []}
                                initialLoading={initialLoading}
                                className="flex-1 shrink-0"
                                monthly={monthly}
                            />
                        </div>

                    </div>
                    <div className="col-span-4 flex flex-col gap-4">
                        <div className="flex gap-4">
                        </div>

                    </div>

                    {/* <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle className="text-xl">Activity Log</CardTitle>
                            <CardDescription>
                                Recent activities on your account
                            </CardDescription>
                            <CardContent className="text-sm ps-0">
                                <ul className="space-y-2">
                                    <li className="flex gap-2">Logged in</li>
                                    <li className="flex gap-2">Updated profile</li>
                                    <li className="flex gap-2">Changed password</li>
                                </ul>
                            </CardContent>
                        </CardHeader>
                    </Card> */}

                    <div className="col-span-12">
                        {children}
                    </div>
                </div>
            </div>
        </DashboardContext.Provider>
    );
}
