"use client";
import { useEffect } from "react";
import { useUserData } from "@/store/useUserData";
import { useTheme } from "next-themes";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sun, Moon } from "lucide-react";

export function AppNavbar() {
    const { data, loading, fetchData } = useUserData();
    const { setTheme } = useTheme();
    const {
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
    } = useSidebar()

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (!loading) fetchData();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const userData = data?.userData?.result;

    return (
        <div className={open ? "w-[calc(100%-16rem)]" : "w-[calc(100%-3rem)]"}>
            <ul className="w-full flex justify-between items-center">
                <li className="flex items-center justify-between gap-2 min-w-0">
                    <SidebarTrigger />
                    <span className="h-[16px] w-[1px] bg-muted me-1"></span>
                    <span className="font-medium truncate">Dashboard</span>
                </li>
                <li>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>
            </ul>
        </div>
    );
}
function useState(arg0: boolean): [any, any] {
    throw new Error("Function not implemented.");
}

