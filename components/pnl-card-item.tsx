import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"

interface PnlCardItemProps {
    data: any;
}

export function PnlCardItem({ data }: PnlCardItemProps) {
    return (
        <ul className="space-y-2">
            {data?.map((item: any) => {
                // console.log(item)
                const symbol = String(item.symbol).replace("USDT", "");
                const createdDate = new Date(Number(item.createdTime));
                const updatedDate = new Date(Number(item.updatedTime));
                const timeDiff = Number(updatedDate) - Number(createdDate);
                const totalMinutes = Math.floor(timeDiff / 1000 / 60);

                const duration = {
                    hour: Math.floor(totalMinutes / 60),
                    minute: totalMinutes % 60
                }

                // const formattedDate = createdDate.toDateString().slice(3) + ", " + createdDate.toTimeString().slice(0, 8)
                const formattedDate = createdDate.toLocaleString("en-GB", {
                    timeZone: "Asia/Jakarta", // or "Asia/Bangkok"
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

                const itemData = {
                    symbol: symbol,
                    pair: item.symbol,
                    side: item.side,
                    createdDate: createdDate,
                    updatedDate: updatedDate,
                    duration: duration,
                    date: formattedDate,
                }

                if (!data) {
                    return null;
                }

                return (
                    <li className="flex flex-col gap-2 justify-between py-2 bg-background rounded-md border">
                        <div className="flex justify-between px-4 text-sm">
                            <div className="flex gap-2 items-center">
                                <Avatar className="size-4">
                                    <AvatarImage src={`https://app.hyperliquid.xyz/coins/${itemData.symbol}.svg`} className="" />
                                    <AvatarFallback>{itemData.symbol.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span className="">{itemData.symbol}</span>
                                {/* <Badge variant="outline">
                            {item.side === "Sell" ?
                                <>
                                    <ArrowUpRight className="text-green-400" /> Close long
                                </>
                                :
                                <>
                                    <ArrowDownRight className="text-destructive" /> Close short
                                </>
                            }
                        </Badge> */}
                            </div>
                            <span className={`font-medium text-${item.closedPnl > 0 ? "green-400" : "destructive"}`}>
                                {item.closedPnl > 0 ? `+${Number(item.closedPnl).toFixed(4)}` : Number(item.closedPnl).toFixed(4)}
                            </span>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 text-sm text-muted-foreground px-4 space-y-2">
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
                                <div className="text-foreground">{String(itemData.duration.hour)}h {String(itemData.duration.minute)}m</div>
                            </div>
                        </div>
                        <Separator />
                        <div className="px-4 text-end text-sm text-muted-foreground">{String(itemData.date)}</div>
                    </li>
                )

            })}
        </ul>
    )
}
