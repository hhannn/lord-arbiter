"use client";
import { useState, useEffect, useMemo } from "react";
import { useUserData } from "@/store/useUserData";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartLineDefaultProps {
    className?: string;
}

export const description = "A line chart";

export function ChartLineDefault({ className }: ChartLineDefaultProps) {
    const { data, apiKey, apiSecret, fetchData } = useUserData();
    const [initialLoading, setInitialLoading] = useState(true);

    // Restore auth data from localStorage once
    useEffect(() => {
        useUserData.getState().restoreFromStorage();
    }, []);

    // When keys are available, fetch user data and mark loading as false
    useEffect(() => {
        const store = useUserData.getState();

        // Restore user credentials from localStorage
        store.restoreFromStorage();

        // Only run fetch once after restore
        if (store.apiKey && store.apiSecret) {
            store.fetchData();

            const interval = setInterval(() => {
                store.fetchData();
            }, 60000); // 15s is safer for Bybit API

            return () => clearInterval(interval);
        }
    }, []);

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

    const chartData = useMemo(() => {
        const closedPnL = data?.closedPnL?.result?.list ?? [];
        const dailyMap: Record<string, number> = {};

        if (closedPnL.length === 0) {
            console.warn("No closed PnL data available");
            console.log("Closed PnL data:", closedPnL);
            return [];
        }

        closedPnL.forEach((item: any) => {
            const pnl = parseFloat(item.closedPnl);
            const itemTimestamp = Number(item.createdTime);

            const startOfDayTimestamp = getStartOfDayUTCPlus7(itemTimestamp);

            const date = new Date(startOfDayTimestamp).toISOString().slice(0, 10);
            if (!dailyMap[date]) dailyMap[date] = 0;
            dailyMap[date] += pnl;
        });

        const sorted = Object.entries(dailyMap)
            .map(([date, pnl]) => ({
                date,
                pnl: Number(pnl.toFixed(2)),
            }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );

        let cumulative = 0;
        return sorted.map((item) => {
            cumulative += item.pnl;
            return {
                ...item,
                cumulativePnl: Number(cumulative.toFixed(2)),
            };
        });
    }, [data]);

    const chartConfig: ChartConfig = {
        cumulativePnl: { label: "Cumulative PnL" },
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col items-stretch gap-2 col-span-4 h-full">
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
            </div>
        );
    }

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle>Cumulative PnL</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(5)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="cumulativePnl"
                            type="natural"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month{" "}
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
}
