"use client";

import { useState, useEffect, useMemo } from "react";
// Removed useUserData as data will now be passed via props
// import { useUserData } from "@/store/useUserData"; 

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

// Define the expected type for each item in the dailyPnl array
interface DailyPnlItem {
    date: string; // YYYY-MM-DD format
    pnl: any;  // The calculated PnL for that day
}

interface ChartBarNegativeProps {
    className?: string;
    // NEW: dailyPnl is now a required prop, containing the pre-calculated data
    dailyPnl?: DailyPnlItem[];
    // NEW: Optional loading state prop, managed by the parent
    isLoading?: boolean;
}

export const description = "A bar chart with negative values";

// The getStartOfDayUTCPlus7 helper function is removed from here.
// It should now reside in the parent component that calculates and passes 'dailyPnl'.

export function BotDailyChart({ className, dailyPnl = [], isLoading = false }: ChartBarNegativeProps) {

    const chartConfig: ChartConfig = {
        pnl: {
            label: "PnL",
            color: "var(--chart-1)", // Default color, will be overridden by Cell fill
        },
    };

    // Use the isLoading prop to show skeleton loading
    if (isLoading) {
        return (
            <Card className={cn("flex flex-col", className)}>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="h-full flex-grow">
                    <Skeleton className="h-[150px] w-full" />
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardFooter>
            </Card>
        );
    }

    // Check if dailyPnl is empty after being passed (e.g., if parent had no data)
    if (dailyPnl.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle>Daily PnL</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                    No PnL data available for the last 7 days.
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="text-muted-foreground leading-none">
                        Showing total PnL for the last 7 days (UTC+7).
                    </div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <ChartContainer
            config={chartConfig}
            className="h-full w-full max-h-[100px]"
        >
            <BarChart accessibilityLayer data={dailyPnl}>
                <CartesianGrid vertical={false} horizontal={false} />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            hideLabel
                            hideIndicator
                            formatter={(value: any, name: string | number, props: any) => {
                                // Formatter remains the same, as it operates on the 'pnl' value
                                return `${value} USDT`;
                            }}
                        />
                    }
                />
                <Bar dataKey="pnl">
                    <LabelList
                        position="top"
                        dataKey="pnl"
                        content={({ x, y, width, index }) => {
                            const safeIndex =
                                typeof index === "number" ? index : 0;
                            const itemPnl = dailyPnl[safeIndex]?.pnl;
                            const dateStr = dailyPnl[safeIndex]?.date ?? "";
                            // Use the date string directly as it's already YYYY-MM-DD
                            const date = new Date(dateStr + "T00:00:00Z"); // Append T00:00:00Z for consistent UTC interpretation
                            const day = dateStr
                                ? `${date.getDate()}-${date.getMonth()}`
                                : "";

                            const textY = typeof y === "number" ? (itemPnl >= 0 ? y - 2 : y + 14) : y;
                            const textColor = "#999";

                            return (
                                <text
                                    x={
                                        typeof x === "number" &&
                                            typeof width === "number"
                                            ? x + width / 2
                                            : 0
                                    }
                                    y={textY}
                                    fill={textColor}
                                    textAnchor="middle"
                                    fontSize={12}
                                    fontWeight="bold"
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
    );
}