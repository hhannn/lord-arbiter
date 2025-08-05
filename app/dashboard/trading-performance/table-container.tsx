"use client"

import { useEffect } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useUserData } from "@/store/useUserData";

function renameKeys(obj: Record<string, any>, keyMap: Record<string, string>) {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            keyMap[key] || key,
            value
        ])
    );
}

export function TableContainer() {
    const { data, startPolling, stopPolling } = useUserData();
    let closedPnl = data?.closedPnL?.result.list ?? [];

    closedPnl = closedPnl.map((item: any) =>
        renameKeys(item, { symbol: "asset" })
    );

    useEffect(() => {
        startPolling();

        return () => stopPolling();
    }, []);

    return (
        <DataTable data={closedPnl} columns={columns} />
        // <div></div>
    )
}