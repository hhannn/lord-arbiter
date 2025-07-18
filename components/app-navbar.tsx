"use client";
import { useEffect } from "react";
import { useUserData } from "@/store/useUserData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppNavbar() {
    const { data, loading, fetchData } = useUserData();

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (!loading) fetchData();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const userData = data?.userData?.result;

    return (
        <NavigationMenu>
            <NavigationMenuList className="w-full flex justify-between items-center">
                <NavigationMenuItem className="flex items-center justify-between gap-2 min-w-0">
                    <SidebarTrigger />
                    <span className="h-[16px] w-[1px] bg-muted me-1"></span>
                    <span className="font-medium truncate">Dashboard</span>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
