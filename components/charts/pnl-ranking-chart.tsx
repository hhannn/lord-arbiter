"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"

export const description = "A bar chart with a custom label"

interface PnlRankingChartProps {
    data: RankData[];
}

type RankData = {
    asset: string;
    closedPnl: number;
}

export function PnlRankingChart({ data }: PnlRankingChartProps) {
    const [chartMargin, setChartMargin] = useState(0)

    const rankData = data.map(({ asset, closedPnl }) => ({
        asset,
        closedPnl: Number(Number(closedPnl).toFixed(4))
    }));

    const aggregatedMap = rankData.reduce((acc: { [key: string]: RankData }, { asset, closedPnl }) => {
        if (!acc[asset]) {
            acc[asset] = { asset, closedPnl: 0 };
        }

        acc[asset].closedPnl += closedPnl;
        return acc;
    }, {});

    const chartData = Object.values(aggregatedMap).sort((a, b) => b.closedPnl - a.closedPnl).slice(0, 5);

    useEffect(() => {
        const maxLabelLength = chartData.reduce((max, item) => Math.max(max, item.asset.length), 0);
        setChartMargin(maxLabelLength * 4)
    }, [chartData])

    const colors = [
        "var(--foreground)",
        "var(--chart-1)",
        "var(--chart-2)",
        "var(--chart-3)",
        "var(--chart-4",
        // add more colors if needed
    ];

    const chartConfig = chartData.reduce((acc, { asset }, idx) => {
        acc[asset] = {
            label: asset.toUpperCase(),          // Label can be asset symbol uppercase or whatever you want
            color: colors[idx % colors.length],  // Cycle colors if assets > colors.length
        };
        return acc;
    }, {} as Record<string, { label: string; color: string }>);

    // Optionally, add static config keys, e.g. closedPnl
    chartConfig.closedPnl = {
        label: "P&L",
        color: "var(--foreground)", // you can define your own P&L color
    };

    return (
        <ChartContainer config={chartConfig} className="max-h-32">
            <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                    left: chartMargin,
                }}
            >
                <YAxis
                    dataKey="asset"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) =>
                        chartConfig[value as keyof typeof chartConfig]?.label
                    }
                />
                <XAxis dataKey="closedPnl" type="number" hide />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="closedPnl" layout="vertical" radius={5} barSize={4}>
                    {chartData.map((entry) => (
                        <Cell
                            key={entry.asset}
                            fill={chartConfig[entry.asset as keyof typeof chartConfig]?.color || "#8884d8"}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}
