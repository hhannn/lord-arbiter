"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
} from "@/components/ui/chart";

// Define the expected type for each item in the dailyPnl array
interface DailyPnlItem {
    date: string; // YYYY-MM-DD format
    pnl: number;  // The calculated PnL for that day
}

interface ChartBarNegativeProps {
    dailyPnl?: DailyPnlItem[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

interface Payload {
    dataKey: string;
    value: number;
}

export const description = "A bar chart with negative values";

export function BotDailyChart({ dailyPnl = [] }: ChartBarNegativeProps) {

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

    // console.log(dailyPnl)

    const CustomTooltipContent = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="grid grid-cols-2 bg-background border rounded-lg p-3 shadow-lg">
                    <p className="text-muted-foreground">{`Date`}</p>
                    <p className="text-sm text-end font-mono">{label}</p>
                    {payload.map((entry: Payload, index) => (
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
                <ChartTooltip content={<CustomTooltipContent />} />
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