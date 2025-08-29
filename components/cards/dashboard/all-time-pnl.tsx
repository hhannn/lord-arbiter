import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClosedPnl } from "@/types/bot";
import { useEffect, useMemo } from "react";


interface AllTimePnlCardProps {
    className?: string
    data: ClosedPnl[]
    date?: string | null
}

export function AllTimePnlCard({ className, date, data }: AllTimePnlCardProps) {
    if (!data && !date) return null

    const pnl = data.filter((item: ClosedPnl) => {
        if (!date) return true;
        const start = new Date(String(date)).getTime();
        return (Number(item.createdTime) >= start);
    })
    .sort((a: ClosedPnl, b: ClosedPnl) => Number(b.createdTime) - Number(a.createdTime))
    .reduce((sum, item) => sum + Number(item.closedPnl), 0);
    
    useEffect(() => {
        console.log(pnl)
    }, [])

    return (
        <Card className={cn(
            "gap-4 justify-between",
            className
        )}>
            <CardHeader>
                <CardTitle>All time P&L</CardTitle>
                <CardDescription>Total P&L from Lord Arbiter</CardDescription>
            </CardHeader>
            <CardContent className="flex items-baseline justify-start">
                <div className="text-2xl font-bold">{pnl.toFixed(2)}</div>
                <div className="ms-0.5 text-sm text-muted-foreground">USDT</div>
            </CardContent>
        </Card>
    )
}