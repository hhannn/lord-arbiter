import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useUserData } from "@/store/useUserData";
import { useEffect, useMemo } from "react";

export function MarginCard() {
    const { data, fetchData } = useUserData();

    useEffect(() => {
        const store = useUserData.getState();
        store.startPolling();
    })

    const accountIMRate = useMemo(() => {
        if (!data) return 0;
        return data.balance.result.list[0].accountIMRate * 100;
    }, [data]);

    const accountMMRate = useMemo(() => {
        if (!data) return 0;
        return data.balance.result.list[0].accountMMRate * 100;
    }, [data]);

    return (
        <Card className="col-span-1 justify-between gap-2">
            <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Margin</CardTitle>
            </CardHeader>
            <CardContent className="text-sm flex flex-col gap-2">
                <div>
                    <div className="flex items-bottom justify-between">
                        <span>IM</span>
                        <span>{accountIMRate?.toFixed(2)}%</span>
                    </div>
                    <Progress className="mt-0.5"
                        value={accountIMRate}
                        color={accountIMRate < 50 ? "bg-success" : "bg-destructive"}
                    />
                </div>
                <div>
                    <div className="flex items-bottom justify-between">
                        <span>MM</span>
                        <span>{accountMMRate?.toFixed(2)}%</span>
                    </div>
                    <Progress className="mt-0.5"
                        value={accountMMRate}
                        color={accountMMRate < 50 ? "bg-success" : "bg-destructive"}
                    />
                </div>
            </CardContent>
        </Card>
    );
}