"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PnlRankingChart } from "@/components/charts/pnl-ranking-chart";
import { useUserData } from "@/store/useUserData";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

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
        <div className="relative flex flex-col gap-4 mx-auto pb-6">
            <Alert className="relative flex self-center items-center justify-between overflow-hidden w-[calc(100%+48px)] rounded-none border-x-0 border-t-0 px-6">
                <img className="absolute right-0 top-0"
                    src="https://skowt.cc/_next/image?url=https%3A%2F%2Fpack.skowt.cc%2Fasset%2F01983920-6f6a-771a-b42d-da6da3a32218.png&w=1920&q=75"
                />
                <div className="relative flex flex-col gap-1">
                    <AlertTitle>Want to do your own backtest?</AlertTitle>
                    <AlertDescription>Check out our TradingView script.</AlertDescription>
                </div>
                <a href="https://www.tradingview.com/script/kMhavaZr-Tofu-Martingale-V3/" target="_blank">
                    <Button className="relative">Get script <ArrowUpRight /></Button>
                </a>
            </Alert>
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