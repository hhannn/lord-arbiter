
import { DataTable } from "./data-table";
import { ClosedPnl, columns } from "./columns";
import { TableContainer } from "./table-container";


export default async function Performance() {

    return (
        <div className="pt-20 px-4 flex flex-col gap-4">
            <TableContainer />
        </div>
    )
}