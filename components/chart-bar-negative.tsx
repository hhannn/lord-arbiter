"use client";

import { useState, useEffect, useMemo } from "react";
import { useUserData } from "@/store/useUserData";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList } from "recharts";

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
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface ChartBarNegativeProps {
    className?: string;
    data: [];
    initialLoading: boolean;
}

export const description = "A bar chart with negative values";

export function ChartBarNegative({ className, data, initialLoading }: ChartBarNegativeProps) {

    // Helper function to get the start of the day in UTC+7 (Western Indonesia Time)
    const getStartOfDayUTCPlus7 = (timestampMs: number): number => {
        // 1. Create a Date object from the original UTC timestamp

        const offsetMs = 7 * 60 * 60 * 1000;
        const dateAdjustedForUTCPlus7 = new Date(timestampMs + offsetMs);

        const year = dateAdjustedForUTCPlus7.getUTCFullYear();
        const month = dateAdjustedForUTCPlus7.getUTCMonth();
        const day = dateAdjustedForUTCPlus7.getUTCDate();

        const utcMidnightOfUTCPlus7Day = Date.UTC(year, month, day, 0, 0, 0, 0);

        return utcMidnightOfUTCPlus7Day - offsetMs;
    };

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="grid grid-cols-2 space-x-4 items-center bg-background border rounded-lg p-3 shadow-lg">
                    {payload.map((entry: any, index: number) => (
                        <>
                            <p className="text-muted-foreground">PnL</p>
                            <p className="text-sm font-mono text-end">{entry.value}</p>
                        </>
                    ))}
                </div>
            );
        }
        return null;
    };

    const dailyPnl = useMemo(() => {
        const closedPnL = data ?? [];
        const dailyMap: Record<string, number> = {};

        closedPnL.forEach((item: any) => {
            const pnl = parseFloat(item.closedPnl);
            const itemTimestamp = Number(item.createdTime);

            const startOfDayTimestamp = getStartOfDayUTCPlus7(itemTimestamp);
            const date = new Date(startOfDayTimestamp).toISOString().slice(0, 10);

            const today = getStartOfDayUTCPlus7(new Date().getTime());
            const sevenDaysAgo = getStartOfDayUTCPlus7(today - 7 * 24 * 60 * 60 * 1000);
            const timeFilter = itemTimestamp > Number(new Date(sevenDaysAgo))
            

            if (!dailyMap[date]) {
                dailyMap[date] = 0;
            }

            if (timeFilter) {
                dailyMap[date] += pnl;
            }
        });

        return Object.entries(dailyMap)
            .map(([date, pnl]) => ({
                date: date,
                pnl: Number(pnl.toFixed(2)),
            }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((item) => {
                const [year, month, day] = item.date.split('-');
                const formattedDate = `${day}-${month}`;

                return {
                    date: formattedDate, pnl: item.pnl
                };
            });
}, [data]);

const chartConfig: ChartConfig = {
    visitors: { label: "Visitors" },
};

if (initialLoading) {
    return (
        <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
    );
}

return (
    <Card className={cn("", className)}>
        <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
                Daily PnL
                <Tabs defaultValue="7">
                    <TabsList>
                        <TabsTrigger value="7">
                            7 days
                        </TabsTrigger>
                        <TabsTrigger value="30">
                            30 days
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="h-full">
            <ChartContainer
                config={chartConfig}
                className="h-full w-full max-h-[150px]"
            >
                <BarChart accessibilityLayer data={dailyPnl}>
                    <CartesianGrid vertical={false} horizontal={false} />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <CustomTooltipContent hideLabel hideIndicator />
                        }
                    />
                    <Bar dataKey="pnl">
                        <LabelList position="top" dataKey="date" fillOpacity={1} />
                        {dailyPnl.map((item) => (
                            <Cell
                                key={item.date}
                                fill={
                                    item.pnl > 0
                                        ? "var(--chart-1)"
                                        : "var(--chart-3)"
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
                Trending up by 5.2% this month{" "}
                <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
                Showing total PnL for the last 7 days.
            </div>
        </CardFooter>
    </Card>
);
}
