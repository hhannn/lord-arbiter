"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PnlRankingChart } from "@/components/charts/pnl-ranking-chart";
import { useUserData } from "@/store/useUserData";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function Performance() {
    const [sheet, setSheet] = useState([]);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/sheet");
            const result = await res.json();
            console.log(result)
            setSheet(result);
        })();
    }, []);

    return (
        <div className="relative py-6 px-4 flex flex-col gap-4 mx-auto">
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
            </div>
            <DataTable data={sheet} columns={columns} />
        </div>
    )
}