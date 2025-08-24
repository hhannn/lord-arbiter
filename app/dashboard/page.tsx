import DashboardContent from "@/components/dashboard-content";

import { BotTableContainer } from "./table-container";
import { Banner } from "@/components/banner";

export default async function DashboardPage() {

    return (
        <>
            <Banner />
            <DashboardContent>
                <BotTableContainer />
            </DashboardContent>
        </>
    );
}
