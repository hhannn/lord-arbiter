"use client";

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
    ChartLegend,
    ChartLegendContent,
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
    dailyPnl?: DailyPnlItem[];
}

export const description = "A bar chart with negative values";

export function BotDailyChart({ className, dailyPnl = [] }: ChartBarNegativeProps) {

    const chartConfig: ChartConfig = {
        pnl: {
            label: "PnL",
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

    // Use the isLoading prop to show skeleton loading
    // if (isLoading) {
    //     return (
    //         <Card className={cn("flex flex-col", className)}>
    //             <CardHeader>
    //                 <Skeleton className="h-6 w-1/2 mb-2" />
    //                 <Skeleton className="h-4 w-1/3" />
    //             </CardHeader>
    //             <CardContent className="h-full flex-grow">
    //                 <Skeleton className="h-[150px] w-full" />
    //             </CardContent>
    //             <CardFooter className="flex-col items-start gap-2 text-sm">
    //                 <Skeleton className="h-4 w-2/3" />
    //                 <Skeleton className="h-4 w-1/2" />
    //             </CardFooter>
    //         </Card>
    //     );
    // }

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
            className="h-full w-full"
        >
            <BarChart accessibilityLayer data={dailyPnl}>
                <CartesianGrid vertical={false} horizontal={false}/>
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                />
                <ChartTooltip content={<CustomTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                    dataKey="pnl"
                    stackId="a"
                    fill="var(--chart-1)"
                    radius={[0, 0, 4, 4]}
                />
                <Bar
                    dataKey="roi"
                    stackId="a"
                    fill="var(--chart-2)"
                    radius={[0, 0, 0, 0]}
                />
                <Bar
                    dataKey="roe"
                    stackId="a"
                    fill="var(--chart-3)"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
}