"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format, startOfDay, startOfWeek } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "./ui/separator"

interface DatePickerProps {
    className?: string
    onChange?: (range: DateRange | undefined, label?: string) => void
    value?: DateRange
}

export function DateRangePicker({ className, onChange, value }: DatePickerProps) {
    // const [date, setDate] = React.useState<DateRange | undefined>({
    //     from: new Date(),
    //     to: addDays(new Date(), -7),
    // })
    const [rangeName, setRangeName] = React.useState("Last 7 days")

    function setRange(range: DateRange | undefined, label?: string) {
        if (onChange) onChange(range, label)
        setRangeName(label || "")
    }

    function getToday() {
        const now = new Date()
        const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000)
        return utc7 // convert to Asia/Bangkok timezone
    }

    function getRange(range: string): DateRange {
        const today = new Date();

        switch (range) {
            case "thisWeek":
                const monday = startOfWeek(today, { weekStartsOn: 1 }) // Monday as start

                return {
                    from: monday,
                    to: addDays(monday, 6),
                };
            case "thisMonth":
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                return {
                    from: new Date(today.getFullYear(), today.getMonth(), 1),
                    to: today < lastDayOfMonth ? today : lastDayOfMonth,
                };
            case "last7Days":
                return {
                    from: startOfDay(addDays(today, -6)),
                    to: today,
                };
            case "last30Days":
                return {
                    from: startOfDay(addDays(today, -29)),
                    to: today,
                };
            default:
                return {
                    from: today,
                    to: today,
                };
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal text-foreground",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rangeName ? (
                            rangeName
                        ) : value?.from && (
                            value.to ? (
                                <>
                                    {format(value.from, "LLL dd, y")} -{" "}
                                    {format(value.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(value.from, "LLL dd, y")
                            )
                        )}
                        {/* {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )} */}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flex" align="end">
                    <div className="p-2 flex flex-col items-stretch gap-1">
                        <Button
                            className="justify-start"
                            variant="ghost"
                            onClick={() => setRange(getRange("thisWeek"), "This week")}
                        >
                            This week
                        </Button>

                        <Button
                            className="justify-start"
                            variant="ghost"
                            onClick={() => setRange(getRange("thisMonth"), "This month")}
                        >
                            This month
                        </Button>

                        <Button
                            className="justify-start"
                            variant="ghost"
                            onClick={() => setRange(getRange("last7Days"), "Last 7 days")}
                        >
                            Last 7 days
                        </Button>

                        <Button
                            className="justify-start"
                            variant="ghost"
                            onClick={() => setRange(getRange("last30Days"), "Last 30 days")}
                        >
                            Last 30 days
                        </Button>
                    </div>
                    <div>
                        <Separator orientation="vertical" />
                    </div>
                    <Calendar
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={(range) => setRange(range || undefined)}
                        weekStartsOn={1}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
function utcToZonedTime(now: Date, TZ: any) {
    throw new Error("Function not implemented.")
}

