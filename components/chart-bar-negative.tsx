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
    data: {
        date: string;
        pnl: number;
    }[];
    initialLoading: boolean;
    monthly: boolean;
}

export const description = "A bar chart with negative values";

export function ChartBarNegative({ className, data, initialLoading, monthly }: ChartBarNegativeProps) {

    if (!monthly) {
        data = data.slice(-7)
    } else {
        data = data.slice(-30)
    }

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;

            return (
                <div className="flex flex-col gap-2 bg-background border rounded-lg p-3 shadow-lg">
                    {payload.map((entry: any, index: number) => (
                        <>
                            <p className="text-xs font-medium text-muted-foreground">{dataPoint.date}</p>
                            <div className="flex gap-4 items-center">
                                <p className="text-muted-foreground">PnL</p>
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
        return data.map((item) => {
            const [year, month, day] = item.date.split("-");
            return {
                ...item,
                formattedDate: `${day}-${month}`,
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

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle>
                    Daily PnL
                </CardTitle>
                <CardDescription>{monthly ? "This month" : "Last 7 days"}</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
                <ChartContainer
                    config={chartConfig}
                    className="h-full w-full max-h-[150px]"
                >
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} horizontal={false} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <CustomTooltipContent hideLabel hideIndicator />
                            }
                        />
                        <Bar dataKey="pnl">
                            {data.map((item) => (
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
                    {!monthly ? "Showing total PnL for the last 7 days." : "Showing total PnL for the last 30 days."}
                </div>
            </CardFooter>
        </Card>
    );
}
