"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
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

interface ChartBarNegativeProps {
    className?: string;
}

export const description = "A bar chart with negative values";

export function ChartBarNegative({ className }: ChartBarNegativeProps) {
    const { data, apiKey, apiSecret, fetchData } = useUserData();
    const [initialLoading, setInitialLoading] = useState(true);

    // Restore auth data from localStorage once
    useEffect(() => {
        useUserData.getState().restoreFromStorage();
    }, []);

    // When keys are available, fetch user data and mark loading as false
    useEffect(() => {
        if (apiKey && apiSecret) {
            fetchData();
            setInitialLoading(false);

            const interval = setInterval(() => {
                fetchData();
            }, 15000);

            return () => clearInterval(interval);
        }
    }, [apiKey, apiSecret]);

    const dailyPnl = useMemo(() => {
        const closedPnL = data?.closedPnL?.result?.list ?? [];
        const dailyMap: Record<string, number> = {};

        closedPnL.forEach((item: any) => {
            const pnl = parseFloat(item.closedPnl);
            const date = new Date(Number(item.createdTime))
                .toISOString()
                .slice(0, 10);

            if (!dailyMap[date]) {
                dailyMap[date] = 0;
            }

            dailyMap[date] += pnl;
        });

        return Object.entries(dailyMap)
            .map(([date, pnl]) => ({
                date,
                pnl: Number(pnl.toFixed(2)),
            }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );
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
                <CardTitle>Daily PnL</CardTitle>
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
                                <ChartTooltipContent hideLabel hideIndicator />
                            }
                        />
                        <Bar dataKey="pnl">
                            <LabelList
                                position="top"
                                dataKey="pnl"
                                content={({ x, y, width, index }) => {
                                    const safeIndex =
                                        typeof index === "number" ? index : 0;
                                    const dateStr =
                                        dailyPnl[safeIndex]?.date ?? "";
                                    const date = new Date(dateStr);
                                    const day = dateStr
                                        ? date.toLocaleDateString("en-US", {
                                              weekday: "short",
                                          })
                                        : "";

                                    return (
                                        <text
                                            x={
                                                typeof x === "number" &&
                                                typeof width === "number"
                                                    ? x + width / 2
                                                    : 0
                                            }
                                            y={
                                                typeof y === "number"
                                                    ? y - 2
                                                    : y
                                            }
                                            fill="#999"
                                            textAnchor="middle"
                                            fontSize={12}
                                        >
                                            {day}
                                        </text>
                                    );
                                }}
                                fillOpacity={1}
                            />
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
