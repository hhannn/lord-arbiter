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

import { DashboardContext } from "@/context/dashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { PnlListCard } from "./cards/dashboard/pnl-list";
import { DateRangePicker } from "./date-range-picker";
import { DateRange } from "react-day-picker";
import { add, addDays, startOfDay, startOfWeek } from "date-fns";
import { EquityCard } from "./cards/dashboard/equity";
import { AllTimePnlCard } from "./cards/dashboard/all-time-pnl";
import { AvgTradeDurationCard } from "./cards/dashboard/avg-trade-duration";
import { ClosedPnl } from "@/types/bot";

// ----- Types -----
interface DashboardData {
    equity: number;
    unrealizedPnl: number;
    time: string;
    dailyPnl: {
        date: string;
        pnl: number;
        roe: number;
        cashBalance: number;
    }[];
    transactionLog: {
        symbol: string;
        change: string;
        transactionTime: string;
        cashBalance: string
    }[];
}

type Transaction = {
    symbol: string;
    side: string;
    change: string;
    transactionTime: string;
    cashBalance: string;
};

interface DashboardContentProps {
    children: ReactNode;
}

const today = new Date()
const last7Days: DateRange = { from: startOfDay(addDays(today, -6)), to: today }

// ----- Component -----
export default function DashboardContent({ children }: DashboardContentProps) {
    useAuthRedirect();

    const { data, joinDate, startPolling, stopPolling } = useUserData();

    const [initialLoading, setInitialLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(last7Days);

    useEffect(() => {
        startPolling();
        setInitialLoading(false)

        return () => stopPolling();
    }, []);

    const dashboardData: DashboardData | null = useMemo(() => {
        if (!data) return null;

        const walletBalance = data.balance.result.list[0];

        const calculateDailyPnl = (closedPnL: ClosedPnl[], transaction: Transaction[]) => {
            if (!dateRange) return [];

            const map: Record<string, { pnl: number, cashBalance: number, roe: number }> = {};

            closedPnL.forEach((row) => {
                const date = new Date(Number(row.updatedTime));
                // shift into UTC+7 midnight
                const bangkokDate = new Date(
                    date.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
                );

                const key = bangkokDate.getTime(); // number key
                if (!map[key]) map[key] = { pnl: 0, cashBalance: 0, roe: 0 };
                map[key].pnl = (map[key]?.pnl || 0) + parseFloat(String(row.closedPnl));
            });

            transaction
                .sort((a, b) => Number(a.transactionTime) - Number(b.transactionTime))
                .forEach((trx) => {
                    const date = new Date(Number(trx.transactionTime));
                    // shift into UTC+7 midnight
                    const bangkokDate = new Date(
                        date.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
                    );

                    const key = bangkokDate.getTime(); // number key
                    if (!map[key]) map[key] = { pnl: 0, cashBalance: 0, roe: 0 };
                    // console.log(key, trx.cashBalance)
                    map[key].cashBalance = Number(trx.cashBalance);
                });

            return Object.entries(map)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([time, { pnl, cashBalance }]) => ({
                    date: String(new Date(Number(time))), // actual Date object in +7
                    pnl,
                    cashBalance,
                    roe: cashBalance === 0 ? 0 : pnl / (cashBalance - pnl) * 100
                }))
                .filter((item) => {
                    const rowDate = new Date(item.date).getTime();
                    const from = dateRange.from?.getTime() ?? 0;
                    const to = dateRange.to?.getTime() ?? Date.now();
                    return rowDate >= from && rowDate <= to;
                });
        };

        const dailyPnl = calculateDailyPnl(data.closedPnL || [], data.transactionLogs || []);

        console.log(dailyPnl)

        return {
            equity: parseFloat(walletBalance.totalEquity) || 0,
            unrealizedPnl: parseFloat(walletBalance.totalPerpUPL) || 0,
            time: data?.balance?.time
                ? new Date(data.balance.time).toLocaleString()
                : "",
            dailyPnl,
            transactionLog: data.transactionLogs || [],
        };
    }, [data, dateRange]);

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
        )
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
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                        />
                    </div>
                </div>
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                    <div className="flex flex-col col-span-2 md:grid md:grid-cols-4 gap-4">
                        <EquityCard />
                        <AllTimePnlCard data={data.closedPnL} date={joinDate} />
                        <AvgTradeDurationCard dateRange={dateRange} />

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
                    <PnlListCard data={data.closedPnL} dateRange={dateRange} />
                </div>

                <div className="col-span-full">
                    {children}
                </div>
            </div>
        </DashboardContext.Provider >
    );
}
