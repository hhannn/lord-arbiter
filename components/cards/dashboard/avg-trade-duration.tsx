import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUserData } from "@/store/useUserData";
import { useEffect } from "react";
import { ClosedPnl } from "@/types/bot";
import { DateRange } from "react-day-picker";

interface AvgTradeDurationCardProps {
    className?: string;
    dateRange?: DateRange;
}

export function AvgTradeDurationCard({ className, dateRange }: AvgTradeDurationCardProps) {
    const { data, startPolling, stopPolling } = useUserData();

    useEffect(() => {
        startPolling();
        return () => stopPolling();
    }, []);

    const avgTradeDuration = () => {
        if (!data?.closedPnL?.length) return { hour: 0, minute: 0 };

        const filteredData = data?.closedPnL?.filter((item: ClosedPnl) => {
            if (!dateRange) return true; // no filter, include all

            const rowDate = new Date(Number(item.updatedTime));
            const from = dateRange.from ? new Date(dateRange.from) : new Date(0); // earliest possible
            const to = dateRange.to ? new Date(dateRange.to) : new Date(); // now as fallback

            return rowDate >= from && rowDate <= to;
        });

        const diffs: number[] = []
        filteredData?.forEach((item: ClosedPnl) => {
            const diff = new Date(Number(item.updatedTime)).getTime() - new Date(Number(item.createdTime)).getTime();

            diffs.push(diff)
        })

        if (diffs.length > 0) {
            const totalDiff = diffs.reduce((acc, val) => acc + val)
            const diffMs = Number(totalDiff) / Number(diffs.length)
            const diffMinutes = Math.floor(diffMs / 1000 / 60);
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            return { hour: hours, minute: minutes }
        }
    }

    return (
        <Card className={cn(
            "col-span-1 justify-between gap-2",
            className
        )}>
            <CardHeader className="gap-2">
                <CardDescription className="font-medium">Avg. trade duration</CardDescription>
                <CardTitle className="font-medium lg:text-2xl 2xl:text-3xl">
                    {avgTradeDuration()?.hour}<span className="ms-0 text-base text-muted-foreground">h </span>
                    {avgTradeDuration()?.minute}<span className="text-base text-muted-foreground">m</span>
                </CardTitle>
            </CardHeader>
        </Card>
    );
}