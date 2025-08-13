"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PnlRankingChart } from "@/components/charts/pnl-ranking-chart";
import { useUserData } from "@/store/useUserData";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function Performance() {

    const data = [
        {
            asset: "HYPEUSDT",
            startSize: "6 USDT",
            takeProfit: 1.2,
            rebuy: 4,
            averageBased: true,
            maxRebuy: 19,
            drawdown: 25.71,
            drawdownRatio: 8.57,
            pnl: 190.21,
            roi: 63,
            pdRatio: 7.4,
            side: "long"
        },
        {
            asset: "FARTCOIN",
            startSize: "6 USDT",
            takeProfit: 1.5,
            rebuy: 5,
            averageBased: false,
            maxRebuy: 14,
            drawdown: 57.88,
            drawdownRatio: 19.29,
            pnl: 145.56,
            roi: 48.55,
            pdRatio: 2.51,
            side: "long"
        },
        {
            asset: "FARTCOIN",
            startSize: "6 USDT",
            takeProfit: 2,
            rebuy: 5,
            averageBased: false,
            maxRebuy: 0,
            drawdown: 62.7,
            drawdownRatio: 20.29,
            pnl: 153.76,
            roi: 51.28,
            pdRatio: 2.45,
            side: "long"
        }
    ]

    return (
        <div className="relative pt-6 px-4 flex flex-col gap-4 mx-auto">
            <div className="bg-background rounded-xl border p-4 grid grid-cols-4 gap-2">
                {/* <div className="col-span-full font-medium mb-2">Backtest detail</div> */}
                <div className="rounded-sm text-sm">
                    <div className="font-bold text-muted-foreground mb-1">Period</div>
                    <div>2 Feb - 10 Aug 2025</div>
                </div>
                <div className="rounded-sm text-sm">
                    <div className="font-bold text-muted-foreground mb-1">Starting equity</div>
                    <div>300 USDT</div>
                </div>
                <div className="col-span-2 rounded-sm text-sm">
                    <div className="font-bold text-muted-foreground mb-1">Additional notes</div>
                    <div>P/D is a result of the P&L divided by the drawdown. Higher P/D is better.</div>
                </div>
            </div>
            <DataTable data={data} columns={columns} />
        </div>
    )
}