
import { DataTable } from "./data-table";
import { ClosedPnl, columns } from "./columns";
import { TableContainer } from "./table-container";

async function getData(): Promise<ClosedPnl[]> {
    // Fetch data from your API here.
    return [
        {
            id: "1",
            asset: "Test",
            qty: 1,
            entryPrice: 1,
            exitPrice: 1,
            closedPnl: 1,
            openingFee: 1,
            closingFee: 1,
            tradeTime: "test",
            duration: "test",
        },
        // ...
    ]
}

export default async function Performance() {
    const data = await getData()

    return (
        <div className="pt-20 px-4 flex flex-col gap-4">
            <TableContainer />
        </div>
    )
}