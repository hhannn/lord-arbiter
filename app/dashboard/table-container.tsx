"use client";

import { useState, useEffect } from "react";
import { useBotStore } from "@/store/useBotStore";
import { DataTable } from "./data-table";
import { columns, Bot } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";

export function BotTableContainer() {
    const { data, fetchBots, loading } = useBotStore();

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

    return <DataTable data={data} columns={columns} />;
}
