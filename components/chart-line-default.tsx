"use client";
import { useState, useEffect, useMemo } from "react";
import { useUserData } from "@/store/useUserData";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, Area, AreaChart } from "recharts";
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
    const lastData = data.slice(-7, -14);

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
        pnl: { label: "Daily PnL" }
    };

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;

            return (
                <div className="flex flex-col gap-2 bg-background border rounded-lg p-3 shadow-lg">
                    <p className="text-xs font-medium text-muted-foreground">{dataPoint.date}</p>
                    {payload.map((entry: any, index: number) => (
                        <>
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

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit'
        }).format(date);
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
                <ChartContainer config={chartConfig} className="h-full w-full max-h-[100px] md:max-h-[180px]">
                    <AreaChart
                        data={chartData}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => formatDate(value)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<CustomTooltipContent hideLabel />}
                        />
                        <Area
                            dataKey="cumulativePnl"
                            type="monotone"
                            fill="url(#fill)"
                            fillOpacity={0.4}
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
