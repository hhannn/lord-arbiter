"use client";

import React, { useEffect, useRef } from "react"
import Lenis from "lenis"
import { registerLenis, unregisterLenis } from "@/lib/lenis-manager"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea, } from "@/components/ui/scroll-area";
import { DateRange } from "react-day-picker";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface PnlCardContentProps {
    data: PnlItem[];
    dateRange?: DateRange;
}

interface PnlItem {
    symbol: string;
    createdTime: number;
    updatedTime: number;
    side: string;
    closedPnl: number;
    avgEntryPrice: number;
    cumEntryValue: number;
}

export function PnlListCard({ data, dateRange }: PnlCardContentProps) {
    const rootRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const wrapper = rootRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]'
        ) as HTMLElement | null
        if (!wrapper) return

        const content = wrapper.firstElementChild as HTMLElement | null
        if (!content) return

        const lenis = new Lenis({
            wrapper,
            content,
            smoothWheel: true,
        })

        registerLenis(lenis)
        return () => {
            unregisterLenis(lenis)
            lenis.destroy()
        }
    }, [data])

    if (!data) {
        return null;
    }

    data = data.sort((a: PnlItem, b: PnlItem) => {
        return Number(b.updatedTime) - Number(a.updatedTime)
    })
        .filter((item: PnlItem) => {
            const rowDate = Number(item.updatedTime)
            return new Date(rowDate) >= (dateRange?.from ?? new Date()) && new Date(rowDate) <= (dateRange?.to ?? new Date());
        })

    useEffect(() => {
        console.log(data)
    }, [])

    return (
        <Card className="gap-0 py-4 justify-between" >
            <CardHeader>
                <CardTitle>P&L list</CardTitle>
            </CardHeader>
            <Separator className="mt-3" />
            <CardContent className="px-4 overflow-hidden flex-1">
                <ScrollArea ref={rootRef} className="h-[200px] xl:h-[360px] 2xl:h-[400px]">
                    <ul className="space-y-2 my-4">
                        {data?.map((item: PnlItem) => {
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

                            const icons = symbol === "HYPE" ? "HYPEH" : symbol;

                            const itemData = {
                                symbol: symbol,
                                pair: item.symbol,
                                icon: `https://s3-symbol-logo.tradingview.com/crypto/XTVC${icons}.svg`,
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
                                                <AvatarImage src={itemData.icon} className="" />
                                                <AvatarFallback>{itemData.symbol.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <span className="" key={itemData.symbol}>{itemData.symbol}</span>
                                        </div>
                                        <span className={`font-medium text-${item.closedPnl > 0 ? "success" : "destructive"}`}>
                                            {item.closedPnl > 0 ? `+${Number(item.closedPnl).toFixed(4)}` : Number(item.closedPnl).toFixed(4)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-3 xl:grid-cols-3 text-sm text-muted-foreground px-4 space-y-2">
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
                </ScrollArea>
            </CardContent>
            <Separator className="mb-3" />
            <CardFooter className="text-sm flex items-center justify-between">
                <div className="font-medium">
                    Total closed orders
                </div>
                <div className="font-medium">
                    {data?.length}
                </div>
            </CardFooter>
        </Card>
    )
}
