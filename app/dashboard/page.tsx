import DashboardContent from "@/components/dashboard-content";

import { BotTableContainer } from "./table-container";

export default async function DashboardPage() {

    return (
        <DashboardContent>
            <BotTableContainer/>
        </DashboardContent>
    );
}
