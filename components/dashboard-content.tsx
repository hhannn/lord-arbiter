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
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

import { DashboardContext } from "@/context/dashboardContext";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { PnlCardItem } from "./pnl-card-item";

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

// ----- Component -----
export default function DashboardContent({ children }: DashboardContentProps) {
    useAuthRedirect();

    const { data } = useUserData();

    const [initialLoading, setInitialLoading] = useState(true);
    const [monthly, setMonthly] = useState(false);

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

    function calculateTotalPnl(transactions: Transaction[], range: "weekly" | "monthly") {
        const offsetMs = 7 * 60 * 60 * 1000;
        const now = Date.now() + offsetMs;
        const days = range === "weekly" ? 7 : 30;
        const fromTime = now - days * 24 * 60 * 60 * 1000;

        return transactions?.reduce((sum, trx) => {
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

        const dailyPnl = calculateDailyPnl(data?.transactionLogs || []);
        const totalPnl = calculateTotalPnl(data?.transactionLogs || [], monthly ? "monthly" : "weekly");

        // Average trade time
        if (!data) {
            const diffs: any[] = []
            data?.closedPnL?.result.list.forEach((item: any) => {
                const diff = new Date(Number(item.updatedTime)).getTime() - new Date(Number(item.createdTime)).getTime();
    
                diffs.push(diff)
            })
    
            const totalDiff = diffs?.reduce((acc, val) => acc + val)
            const diffMs = Number(totalDiff) / Number(diffs.length)
            const diffMinutes = Math.floor(diffMs / 1000 / 60);
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            const averageTradeDuration = {
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
            averageTradeDuration: {
                hour: 0,
                minute: 0
            },
            totalClosedOrders: data.closedPnL?.result.list.length,
            transactionLog: data.transactionLogs || [],
        };
    }, [data, monthly]);

    if (!dashboardData || initialLoading) {
        console.log("loading")
        return (
            <div className="flex flex-col space-y-2 px-8 min-h-screen w-full">
                <div>LOADING</div>
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
                        <p className="">
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
                        <div className="flex-1/3 flex flex-col md:flex-row items-stretch gap-4">
                            <Card className="flex-1 justify-between">
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">Equity</CardTitle>
                                    <CardTitle className="flex items-end gap-2">
                                        <span className="text-2xl md:text-3xl">
                                            {dashboardData.equity.toFixed(2)}
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
                                        {dashboardData.unrealizedPnl.toFixed(2)} USDT
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Total unrealized P&L
                                    </p>
                                </CardFooter>
                            </Card>

                            <Card className="flex-1 justify-between">
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">Total P&L</CardTitle>
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
                                        ? "Total closed P&L this month."
                                        : "Total closed P&L this week."}
                                </CardFooter>
                            </Card>
                            <Card className="flex-1">
                                <CardHeader className="gap-2">
                                    <CardTitle className="text-sm text-muted-foreground">Avg. trade duration</CardTitle>
                                    <CardTitle className="font-medium text-xl md:text-3xl">
                                        {dashboardData?.averageTradeDuration.hour}<span className="ms-0 text-base text-muted-foreground">h </span>
                                        {dashboardData?.averageTradeDuration.minute}<span className="text-base text-muted-foreground">m</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="">
                                </CardContent>
                                <CardFooter className="text-sm text-muted-foreground">
                                    Avg. trade duration this week
                                </CardFooter>
                            </Card>
                            <Card className="flex-1 justify-between">
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">Total closed positions</CardTitle>
                                    <CardTitle className="font-medium text-xl md:text-3xl">{dashboardData?.totalClosedOrders}</CardTitle>
                                </CardHeader>
                                <CardFooter className="text-sm text-muted-foreground">
                                    {dashboardData?.totalClosedOrders} Long / 0 Short
                                </CardFooter>
                            </Card>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="text-xl">P&L list</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4">
                                <ScrollArea className="h-[380px] rounded-md">
                                    <ul className="space-y-2">
                                        {data.closedPnL?.result.list.map((item: any) => {
                                            // console.log(item)
                                            const symbol = String(item.symbol).replace("USDT", "");
                                            const createdDate = new Date(Number(item.createdTime));
                                            const updatedDate = new Date(Number(item.updatedTime));
                                            const timeDiff = Number(updatedDate) - Number(createdDate);
                                            const totalMinutes = Math.floor(timeDiff / 1000 / 60);

                                            const duration = {
                                                hour: Math.floor(totalMinutes / 60),
                                                minute: totalMinutes % 60
                                            }

                                            // const formattedDate = createdDate.toDateString().slice(3) + ", " + createdDate.toTimeString().slice(0, 8)
                                            const formattedDate = createdDate.toLocaleString("en-GB", {
                                                timeZone: "Asia/Jakarta", // or "Asia/Bangkok"
                                                year: "numeric",
                                                month: "short",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            });

                                            const itemData = {
                                                symbol: symbol,
                                                pair: item.symbol,
                                                side: item.side,
                                                createdDate: createdDate,
                                                updatedDate: updatedDate,
                                                duration: duration,
                                                date: formattedDate,
                                            }

                                            return (
                                                <PnlCardItem data={itemData} item={item}/>
                                            )

                                        })}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>
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
