"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableContainer } from "./table-container";
import { PnlRankingChart } from "@/components/charts/pnl-ranking-chart";
import { useUserData } from "@/store/useUserData";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ClosedPnl } from "@/types/bot";

function renameKeys(obj: Record<string, any>, keyMap: Record<string, string>) {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            keyMap[key] || key,
            value
        ])
    );
}

export default function Performance() {
    const { data, startPolling, stopPolling } = useUserData();
    let closedPnl = data?.closedPnL ?? [];

    closedPnl = closedPnl.map((item: ClosedPnl) =>
        renameKeys(item, { symbol: "asset" })
    );

    useEffect(() => {
        startPolling();

        return () => stopPolling();
    }, []);

    return (
        <div className="pt-6 px-4 flex flex-col gap-4 w-full">
            <div className="relative space-y-2 mb-4">
                <h1 className="text-4xl font-bold">The Morning Tally</h1>
                <span>Those who sow with tears will reap with songs of joy.</span>
            </div>
            <div className="relative grid grid-cols-4 gap-4 w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>P&L ranking</CardTitle>
                        <CardDescription>The end of a matter is better than its beginning.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PnlRankingChart data={closedPnl} />
                    </CardContent>
                </Card>
            </div>
            <DataTable data={closedPnl} columns={columns} />
        </div>
    )
}