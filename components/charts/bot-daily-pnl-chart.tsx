"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";

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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

// Define the expected type for each item in the dailyPnl array
interface DailyPnlItem {
    date: string; // YYYY-MM-DD format
    pnl: any;  // The calculated PnL for that day
}

interface ChartBarNegativeProps {
    className?: string;
    dailyPnl?: DailyPnlItem[];
}

export const description = "A bar chart with negative values";

export function BotDailyChart({ className, dailyPnl = [] }: ChartBarNegativeProps) {

    const chartConfig: ChartConfig = {
        pnl: {
            label: "P&L",
            color: "var(--chart-1)", // Default color, will be overridden by Cell fill
        },
        roi: {
            label: "ROI",
            color: "var(--chart-2)", // Default color, will be overridden by Cell fill
        },
        roe: {
            label: "ROE",
            color: "var(--chart-3)", // Default color, will be overridden by Cell fill
        },
    };

    console.log(dailyPnl)

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="grid grid-cols-2 bg-background border rounded-lg p-3 shadow-lg">
                    <p className="text-muted-foreground">{`Date`}</p>
                    <p className="text-sm text-end font-mono">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <>
                            <p className="text-muted-foreground">
                                {entry.dataKey === 'roi' ? "ROI" :
                                    entry.dataKey === 'roe' ? "ROE" : "PnL"
                                }
                            </p>
                            <p key={index} className="text-sm text-end font-mono">
                                {entry.dataKey === 'roi' ? `${(entry.value).toFixed(2)}%` :
                                    entry.dataKey === 'roe' ? `${(entry.value).toFixed(2)}%` :
                                        `${entry.value?.toFixed(2) || '0.00'} USDT`
                                }
                            </p>
                        </>
                    ))}
                </div>
            );
        }
        return null;
    };

    function formatDate(dateString: string): string {
        const [day, month] = dateString.split("-").map(Number);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = months[month - 1] || "???";

        return `${monthName} ${String(day).padStart(2, "0")}`;
    }

    if (dailyPnl.length === 0) {
        return (
            <div className="mt-4 text-center">No data available.</div>
        )
    }

    return (
        <ChartContainer
            config={chartConfig}
            className="h-full w-full"
        >
            <BarChart accessibilityLayer data={dailyPnl}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    tickFormatter={(value) => formatDate(value)}
                />
                <ChartTooltip content={<CustomTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                    dataKey="pnl"
                    type="bump"
                    stackId="a"
                    fill="var(--color-chart-1)"
                    barSize={4}
                    radius={[0, 0, 2, 2]}
                />
                <Bar
                    dataKey="roi"
                    type="bump"
                    stackId="a"
                    fill="var(--color-chart-2)"
                    barSize={4}
                />
                <Bar
                    dataKey="roe"
                    type="bump"
                    stackId="a"
                    fill="var(--color-chart-3)"
                    barSize={4}
                    radius={[2, 2, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
}