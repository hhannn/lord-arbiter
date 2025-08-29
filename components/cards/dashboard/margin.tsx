import { Progress } from "@/components/ui/progress";
import { useUserData } from "@/store/useUserData";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface MarginProps {
    className?: string
}

export function Margin({ className }: MarginProps) {
    const { data, startPolling, stopPolling } = useUserData();

    useEffect(() => {
        startPolling();
        return () => stopPolling();
    }, []);

    const accountIMRate = useMemo(() => {
        if (!data) return 0;
        return data.balance.result.list[0].accountIMRate * 100;
    }, [data]);

    const accountMMRate = useMemo(() => {
        if (!data) return 0;
        return data.balance.result.list[0].accountMMRate * 100;
    }, [data]);

    return (
        <div className={cn("w-full text-xs flex gap-2 p-4 border rounded-lg bg-background/40", className)}>
            <div className="w-full">
                <div className="flex items-bottom justify-between gap-2">
                    <span>IM</span>
                    <span>{accountIMRate?.toFixed(2)}%</span>
                </div>
                <Progress className="mt-0.5 h-1"
                    value={accountIMRate}
                    color={accountIMRate < 50 ? "bg-success" : "bg-destructive"}
                />
            </div>
            <div className="w-full">
                <div className="flex items-bottom justify-between gap-2">
                    <span>MM</span>
                    <span>{accountMMRate?.toFixed(2)}%</span>
                </div>
                <Progress className="mt-0.5 h-1"
                    value={accountMMRate}
                    color={accountMMRate < 50 ? "bg-success" : "bg-destructive"}
                />
            </div>
        </div>
    );
}