"use client";

import { useState, useEffect } from "react";
import { useBotStore } from "@/store/useBotStore";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Bot } from "@/types/bot";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export function BotTableContainer() {
    useAuthRedirect();
    const { data, fetchBots } = useBotStore();
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            await fetchBots();
            setInitialLoading(false); // Only after first load
        };
        load();
    }, []);
    

    if (initialLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }

    return <DataTable<Bot, unknown> data={data} columns={columns}/>;
}
