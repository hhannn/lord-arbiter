import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../ui/card"
import { Button } from "../../ui/button"
import { IconTransfer } from "@tabler/icons-react"
import { Separator } from "../../ui/separator"
import { useState } from "react"
import { TransferDialog } from "@/components/dialogs/transfer"
import { useDashboardData } from "@/context/dashboardContext"
import { cn } from "@/lib/utils"

interface EquityCardProps {
    className?: string
}

export function EquityCard({ className }: EquityCardProps) {
    const dashboardData = useDashboardData();
    const [transferOpen, setTransferOpen] = useState(false);

    return (
        <Card className={cn(
            "col-span-2 px-0 py-0 flex-row items-center justify-between gap-2 overflow-hidden",
            className
        )}>
            <div className="flex flex-col gap-2">
                <CardHeader className="pt-4">
                    <CardTitle className="text-sm text-muted-foreground font-medium">Equity</CardTitle>
                    <CardDescription className="text-foreground flex items-end gap-2">
                        <span className="text-2xl 2xl:text-3xl font-semibold">
                            {dashboardData.equity.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">USDT</span>
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col items-start pb-4">
                    <div className={`text-sm ${dashboardData && dashboardData.unrealizedPnl >= 0 ?
                        "text-success" :
                        "text-red-400"
                        }`}
                    >
                        {dashboardData.unrealizedPnl.toFixed(2)} USDT
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Unrealized P&L
                    </p>
                </CardFooter>
            </div>
            <CardContent className="h-full px-0 flex">
                <Separator orientation="vertical" />
                <Button className="h-full rounded-none" variant="ghost" onClick={() => setTransferOpen(true)}>
                    <IconTransfer /> Transfer
                </Button>
            </CardContent>
            <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
        </Card>
    );
}