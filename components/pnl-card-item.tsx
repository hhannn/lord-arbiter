import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"

interface PnlCardItemProps {
    data: any;
    item: any;
}

export function PnlCardItem({ data, item }: PnlCardItemProps) {
    return (
        <>
            <li className="flex flex-col gap-2 justify-between py-4 bg-background rounded-md border">
                <div className="flex justify-between px-4">
                    <div className="flex gap-2 items-center">
                        <Avatar className="size-4">
                            <AvatarImage src={`https://app.hyperliquid.xyz/coins/${data.symbol}.svg`} className="" />
                            <AvatarFallback>{item.symbol.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="">{item.symbol}</span>
                        <Badge variant="outline">
                            {item.side === "Sell" ?
                                <>
                                    <ArrowUpRight className="text-green-400" /> Close long
                                </>
                                :
                                <>
                                    <ArrowDownRight className="text-destructive" /> Close short
                                </>
                            }
                        </Badge>
                    </div>
                    <span className={`font-medium text-${item.closedPnl > 0 ? "green-400" : "destructive"}`}>
                        {item.closedPnl > 0 ? `+${Number(item.closedPnl).toFixed(4)}` : Number(item.closedPnl).toFixed(4)}
                    </span>
                </div>
                <Separator />
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 text-sm text-muted-foreground px-4 py-2 space-y-2">
                    <div className="space-y-1">
                        <div className="font-medium">Entry price</div>
                        <div className="text-foreground">{Number(item.avgEntryPrice).toFixed(4)}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium">Value</div>
                        <div className="text-foreground">{Number(item.cumEntryValue).toFixed(2)} USDT</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium">Trade duration</div>
                        <div className="text-foreground">{String(data.duration.hour)}h {String(data.duration.minute)}m</div>
                    </div>
                </div>
                <Separator />
                <div className="px-4 text-end text-sm text-muted-foreground">{String(data.date)}</div>
            </li>
        </>
    )
}
