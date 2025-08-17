"use client";

import { useState, useEffect, useMemo } from "react";
import { useUserData } from "@/store/useUserData";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";

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
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { DateRange } from "react-day-picker";
import { boolean } from "zod";

interface ChartBarNegativeProps {
    className?: string;
    data: {
        date: string;
        pnl: number;
    }[];
    initialLoading: boolean;
}

export const description = "A bar chart with negative values";

export function ChartBarNegative({ className, data, initialLoading}: ChartBarNegativeProps) {

    // if (!monthly) {
    //     data = data.slice(-7)
    // } else {
    //     data = data.slice(-30)
    // }

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;

            return (
                <div className="flex flex-col gap-2 bg-background border rounded-lg p-3 shadow-lg">
                    {payload.map((entry: any, index: number) => (
                        <>
                            <p className="text-xs font-medium text-muted-foreground">{dataPoint.date}</p>
                            <div className="flex gap-4 items-center">
                                <p className="text-muted-foreground">P&L</p>
                                <p className="text-sm font-mono text-end">{`${entry.value.toFixed(2)} USDT`}</p>
                            </div>
                        </>
                    ))}
                </div>
            );
        }
        return null;
    };

    const chartConfig: ChartConfig = {
        pnl: { label: "PnL" },
        date: { label: "test" }
    };

    const chartData = useMemo(() => {
        return data
            .map((item) => {
                const rowDate = new Date(item.date + "T00:00:00");
                return {
                    ...item,
                    formattedDate: rowDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                    }), // e.g. "17-08"
                };
            });
    }, [data]);

    if (initialLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
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

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle>
                    Daily P&L
                </CardTitle>
                <CardDescription>Test</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
                <ChartContainer
                    config={chartConfig}
                    className="h-full w-full max-h-[100px] md:max-h-[200px]"
                >
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <CustomTooltipContent />
                            }
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={8}
                            axisLine={false}
                            tickFormatter={(value) => formatDate(String(value))}
                        />
                        <Bar
                            dataKey="pnl"
                            radius={[4, 4, 4, 4]}
                            barSize={4}
                        >
                            {data.map((item) => (
                                <Cell
                                    key={item.date}
                                    fill={
                                        item.pnl > 0
                                            ? "var(--chart-1)"
                                            : "var(--chart-5)"
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month{" "}
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    {!monthly ? "Showing total PnL for the last 7 days." : "Showing total PnL for the last 30 days."}
                </div>
            </CardFooter> */}
        </Card>
    );
}
