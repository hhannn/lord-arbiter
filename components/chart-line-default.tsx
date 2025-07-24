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
    data: {
        date: string;
        pnl: number;
    }[];
    initialLoading: boolean;
    monthly: boolean;
}

export const description = "A line chart";

export function ChartLineDefault({ className, data, initialLoading, monthly }: ChartLineDefaultProps) {

    data = monthly ? data.slice(-30) : data.slice(-7);

    const chartData = useMemo(() => {
        const dailyMap: Record<string, number> = {};

        data.forEach((item: any) => {
            const pnl = parseFloat(item.pnl);
            const date = item.date;

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
        cumulativePnl: { label: "Cum. PnL" },
    };

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;

            return (
                <div className="flex flex-col gap-2 bg-background border rounded-lg p-3 shadow-lg">
                    {payload.map((entry: any, index: number) => (
                        <>
                            <p className="text-xs font-medium text-muted-foreground">{dataPoint.date}</p>
                            <div className="flex gap-4 items-center">
                                <p className="text-muted-foreground">Cum. PnL</p>
                                <p className="text-sm font-mono text-end">{`${entry.value.toFixed(2)} USDT`}</p>
                            </div>
                        </>
                    ))}
                </div>
            );
        }
        return null;
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
                <CardDescription>
                    {
                        monthly ? "This month" : "Last 7 days"
                    }
                </CardDescription>
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
                            content={<CustomTooltipContent hideLabel />}
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
                    {!monthly ? "Showing cumulative PnL for the last 7 days." : "Showing cumulative PnL for the last 30 days."}
                </div>
            </CardFooter>
        </Card>
    );
}
