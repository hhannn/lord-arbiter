"use client";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function Banner() {

    const [ loading, setLoading ] = useState(true);
    const [isAlertVisible, setIsAlertVisible] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("isAlertVisible");
        setIsAlertVisible(stored !== "false"); // default true
        setLoading(false);
    }, []);

    const closeBanner = () => {
        localStorage.setItem("isAlertVisible", "false");
        setIsAlertVisible(false);
    };

    if (!isAlertVisible || loading) return null;

    return (
        <Alert className="w-full mt-4 backdrop-blur-2xl flex items-center justify-between overflow-hidden">
            <img className="w-full h-auto absolute left-0 top-0" src="https://cdn.wanderer.moe/wuthering-waves/cards/T_CardLong22.png" />
            <div>
                <AlertTitle>Backtest results</AlertTitle>
                <AlertDescription>Check the performance of the bots from 2 February 2025.</AlertDescription>
            </div>
            <div className="flex gap-2">
                <Button className="relative" size="sm">
                    <Link href="/dashboard/backtest-result">Check now</Link>
                </Button>
                <Button className="relative size-8" size="sm" variant="ghost"
                    onClick={closeBanner}
                >
                    <X />
                </Button>
            </div>
        </Alert>
    )
}
