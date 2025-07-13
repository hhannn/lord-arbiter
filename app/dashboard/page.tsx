import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartLineDefault } from "@/components/section-chart";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"

import { SectionIcon, TrendingUp } from "lucide-react";

export const metadata = {
    title: "Lord Arbiter",
    description: "Sign in to your MyApp account",
};

export default function Dashboard() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex flex-col min-h-screen w-full px-4 py-6 mt-[57px]">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome to Lord Arbiter
                    </h1>
                    <p className="text-neutral-600">
                        Weeping may endure for a night, but joy comes in the
                        morning.
                    </p>

                    <div className="grid grid-cols-12 gap-4 mt-6">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Assets</CardTitle>
                                <CardTitle className="text-3xl">$120</CardTitle>
                            </CardHeader>
                        </Card>
                        <ChartLineDefault className="col-span-4" />
                        <Card className="col-span-12">
                            <CardHeader>
                                <CardTitle>Running bot</CardTitle>
                                <Table>
                                    <TableCaption>
                                        List of your active bots
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">
                                                Assets
                                            </TableHead>
                                            <TableHead>Start size</TableHead>
                                            <TableHead>Leverage</TableHead>
                                            <TableHead>Multiplier</TableHead>
                                            <TableHead>Take profit</TableHead>
                                            <TableHead>Rebuy</TableHead>
                                            <TableHead>Current position</TableHead>
                                            <TableHead>Unrealized PnL</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">
                                                HYPE
                                            </TableCell>
                                            <TableCell>5.5 USDT</TableCell>
                                            <TableCell>25x</TableCell>
                                            <TableCell>1.2</TableCell>
                                            <TableCell>1.5%</TableCell>
                                            <TableCell>1%</TableCell>
                                            <TableCell>0.06 HYPE</TableCell>
                                            <TableCell>0.01 USDT</TableCell>
                                            <TableCell>
                                                <Badge variant={"secondary"}>
                                                    Running
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
