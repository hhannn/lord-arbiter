import DashboardContent from "@/components/dashboard-content";

import { BotTableContainer } from "./table-container";
import { AppNavbar } from "@/components/app-navbar";

export default async function DashboardPage() {

    return (
        <>
            <DashboardContent>
                <BotTableContainer />
            </DashboardContent>
        </>
    );
}
