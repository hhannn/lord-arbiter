import DashboardContent from "@/components/dashboard-content";

import { BotTableContainer } from "./table-container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";
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
