// dashboard-content.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
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

interface DashboardContentProps {
    children: React.ReactNode,
}


export default function DashboardContent({ children }: DashboardContentProps) {
    const { data, loading, fetchData, apiKey, apiSecret } = useUserData();

    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const store = useUserData.getState();
        const load = async () => {
            
            store.restoreFromStorage();
            setInitialLoading(false);
    
            // Only run fetch once after restore
            if (store.apiKey && store.apiSecret) {
                store.fetchData();
    
                const interval = setInterval(() => {
                    store.fetchData();
                }, 15000); // 15s is safer for Bybit API
    
                return () => clearInterval(interval);
            }
        };
        load();

    }, []);

    const dashboardData = useMemo(() => {
        const walletBalance = data?.balance?.result?.list?.[0];
        if (!walletBalance) {
            console.warn("⚠️ Unexpected response format", data);
            return;
        }

        const closedPnL = data?.closedPnL?.result?.list ?? [];
        if (!closedPnL) {
            console.warn("⚠️ No account info found", data);
            return;
        }

        const totalClosedPnL = closedPnL.reduce(
            (sum: number, item: { closedPnl: string }) => {
                return sum + parseFloat(item.closedPnl);
            },
            0
        );

        // console.log("Total closed PnL:", totalClosedPnL);
        return {
            assets: parseFloat(walletBalance.totalEquity) || 0,
            unrealizedPnl: parseFloat(walletBalance.totalPerpUPL) || 0,
            volume: totalClosedPnL,
            cumulativePnl: 0,
            time: data?.balance?.time
                ? new Date(data.balance.time).toLocaleString()
                : "",
            dailyPnl: [],
            closedPnL: closedPnL
        };
    }, [data]);

    if (!apiKey || !apiSecret) {
    }

    return (
        <div className="flex flex-col min-h-screen w-full px-4 py-6 pt-[80px]">
            <div className="flex">
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome to Lord Arbiter
                    </h1>
                    <p className="text-neutral-600">
                        Weeping may endure for a night, but joy comes in the
                        morning.
                    </p>
                </div>
                <div className="text-sm text-neutral-500 ms-auto">
                    {dashboardData ? dashboardData.time : "Loading..."}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-6">
                <div className="col-span-4 flex flex-col gap-4">
                    <div className="flex items-stretch gap-4">
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Equity</CardTitle>
                                <CardTitle className="flex items-end gap-2">
                                    <span className="text-3xl">
                                        {dashboardData &&
                                            typeof dashboardData.assets === "number"
                                            ? `${dashboardData.assets.toFixed(
                                                2
                                            )}`
                                            : "Loading..."}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        USD
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="flex flex-col items-start">
                                <div
                                    className={`text-sm ${dashboardData &&
                                        dashboardData.unrealizedPnl >= 0
                                        ? "text-green-800"
                                        : "text-red-400"
                                        }`}
                                >
                                    {dashboardData &&
                                        typeof dashboardData.unrealizedPnl ===
                                        "number"
                                        ? `${dashboardData.unrealizedPnl.toFixed(
                                            2
                                        )} USD`
                                        : "Loading..."}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Total unrealized PnL
                                </p>
                            </CardFooter>
                        </Card>
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Total PnL</CardTitle>
                                <CardTitle className="flex items-end gap-2">
                                    <span className="text-3xl">
                                        {dashboardData &&
                                            typeof dashboardData.volume === "number"
                                            ? `${dashboardData.volume.toFixed(
                                                2
                                            )}`
                                            : "Loading..."}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        USD
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">
                                Total closed PnL this week.
                            </CardFooter>
                        </Card>
                    </div>
                    <ChartBarNegative data={dashboardData?.closedPnL} initialLoading={initialLoading} className="flex-1" />
                </div>

                <ChartLineDefault data={dashboardData?.closedPnL} initialLoading={initialLoading} className="col-span-4" />

                <Card className="col-span-4">
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
                </Card>

                <div className="col-span-12">{children}</div>
            </div>
        </div>
    );
}
function fetchBots() {
    throw new Error("Function not implemented.");
}

