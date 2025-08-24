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
import { Separator } from "../ui/separator";

interface ChartBarNegativeProps {
    className?: string;
    data: {
        date: string;
        pnl: number;
    }[];
    initialLoading: boolean;
}

interface CustomTooltipContent {
    active?: boolean;
    payload?: any[];
    label?: string;
}

export const description = "A bar chart with negative values";

export function ChartBarNegative({ className, data, initialLoading }: ChartBarNegativeProps) {

    // if (!monthly) {
    //     data = data.slice(-7)
    // } else {
    //     data = data.slice(-30)
    // }

    const CustomTooltipContent = ({ active, payload, label }: CustomTooltipContent) => {
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
                    {payload.map((entry: any, index: number) => (
                        <>
                            <p className="text-xs font-medium text-muted-foreground">{date}</p>
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
        // date: { label: "test" }
    };

    const chartData = useMemo(() => {
        return data
            .map((item) => {
                const rowDate = new Date(item.date + "T00:00:00");
                return {
                    ...item,
                    formattedDate: rowDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
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
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
        }).format(date);
    }

    if (data.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle>
                        Daily P&L
                    </CardTitle>
                    <CardDescription>Total profit and loss for the current day.</CardDescription>
                </CardHeader>
                <CardContent className="h-full text-sm flex items-center justify-center">
                    <div>No data available.</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("py-4 gap-0", className)}>
            <CardHeader className="pt-1 px-4">
                <CardTitle>Daily P&L</CardTitle>
                <CardDescription>Total profit and loss for the current day.</CardDescription>
            </CardHeader>
            <Separator className="mt-3" />
            <CardContent className="h-full px-0 overflow-hidden">
                <ChartContainer
                    config={chartConfig}
                    className="h-[calc(100%)] w-[calc(100%+8px)] max-h-[100px] md:max-h-[235px] lg:max-h-[150px] 2xl:max-h-[235px] -mx-1 -my-1"
                >
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid
                            vertical={false}
                        // horizontal={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <CustomTooltipContent />
                            }
                        />
                        <XAxis
                            padding={{ left: 24, right: 24 }}
                            dataKey="date"
                            tickLine={false}
                            tickMargin={8}
                            axisLine={false}
                            interval={"preserveStartEnd"}
                            stroke="var(--border)"
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
                                    fill={item.pnl > 0 ? "var(--chart-1)" : "var(--chart-5)"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <Separator className="mb-3" />
            <CardFooter className="items-center justify-between gap-2 text-sm py-0 px-4">
                <div className="flex gap-2 leading-none font-medium">
                    Today's P&L
                </div>
                <div className="text-muted-foreground leading-none">
                    {(() => {
                        const totalPnl = chartData[chartData.length - 1]?.pnl || 0;

                        return (
                            <div className={cn(
                                "font-medium",
                                totalPnl > 0 ? "text-success" : "text-destructive"
                            )}>
                                <span>
                                    {totalPnl > 0 && "+"}{Number(totalPnl).toFixed(2)}
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
