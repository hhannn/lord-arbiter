"use client";
import { useState, useEffect, useMemo } from "react";
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
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface ChartLineDefaultProps {
    className?: string;
    data: {
        date: string;
        pnl: number;
    }[];
    initialLoading: boolean;
}

export const description = "A line chart";

export function ChartLineDefault({ className, data, initialLoading }: ChartLineDefaultProps) {

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
        cumulativePnl: { label: "Cum. P&L" },
        pnl: { label: "Daily P&L" }
    };

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            const date = new Date(dataPoint.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Bangkok"
            });

            return (
                <div className="flex flex-col gap-2 bg-background border rounded-lg p-3 shadow-lg">
                    <p className="text-xs font-medium text-muted-foreground">{date}</p>
                    {payload.map((entry: any, index: number) => (
                        <>
                            <div className="flex gap-4 items-center">
                                <p className="text-muted-foreground">Cum. P&L</p>
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

    if (data.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle>
                        Daily P&L
                    </CardTitle>
                    <CardDescription>Test</CardDescription>
                </CardHeader>
                <CardContent className="h-full text-sm flex items-center justify-center">
                    <div>No data available.</div>
                </CardContent>
            </Card>
        )
    }

    const visibleTicks = useMemo(() => {
        const raw = chartData.map(d => d.date);
        return raw.slice(1, -1);
    }, [chartData]);

    return (
        <Card className={cn("py-4 gap-0", className)}>
            <CardHeader className="px-4 pt-1">
                <CardTitle>Cumulative P&L</CardTitle>
                <CardDescription>Trend of total P&L within the selected time period.</CardDescription>
            </CardHeader>
            <Separator className="mt-3" />
            <CardContent className="h-full px-0">
                <ChartContainer config={chartConfig}
                    className="h-[calc(100%+8px)] w-[calc(100%+12px)] max-h-[100px] md:max-h-[235px] lg:max-h-[150px] 2xl:max-h-[235px] aspect-[527/235] -mx-1.5 -my-1"
                >
                    <AreaChart className="chart-area"
                        data={chartData}
                    >
                        {/* <CartesianGrid vertical={false} /> */}
                        {/* <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => formatDate(value)}
                        /> */}
                        <ChartTooltip
                            cursor={false}
                            content={<CustomTooltipContent hideLabel />}
                        />
                        <defs>
                            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-foreground)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-foreground)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
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
            <Separator className="mb-3" />
            <CardFooter className="items-center justify-between gap-2 text-sm py-0 px-4">
                <div className="flex gap-2 leading-none font-medium">
                    Total P&L
                </div>
                <div className="text-muted-foreground leading-none">
                    {(() => {
                        const totalPnl = chartData[chartData.length - 1]?.cumulativePnl || 0;

                        return (
                            <div className={cn(
                                "font-medium",
                                totalPnl > 0 ? "text-success" : "text-destructive"
                            )}>
                                <span>
                                    {totalPnl > 0 ? "+" : "-"}{Number(totalPnl).toFixed(2)}
                                </span>
                                <span className="ms-1 text-sm font-normal">
                                    USDT
                                </span>
                            </div>
                        )
                    })()}
                </div>
            </CardFooter>
        </Card>
    );
}
