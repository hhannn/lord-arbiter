"use client";

import { useState, useEffect } from "react";
import { useUserData } from "@/store/useUserData";

import { Home, Bot, ChevronsUpDown, ChevronUp } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Image from "next/image";

const items = [
    { title: "Home", url: "#", icon: Home },
    { title: "Bot", url: "#", icon: Bot },
];

type AppSidebarProps = {
    collapsible?: "offcanvas" | "icon" | "none";
};

export function AppSidebar({ collapsible = "icon" }: AppSidebarProps) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    const { username, uid } = useUserData();

    return (
        <Sidebar collapsible={collapsible}>
            <SidebarContent>
                {/* Logo Section - Always visible */}
                <div
                    className={`flex items-center gap-4 ${
                        isCollapsed ? "px-2 py-1" : "px-4 py-3"
                    }`}
                >
                    <Image
                        src="/assets/logo.png"
                        alt="logo"
                        width={24}
                        height={24}
                        className="w-8 h-8 aspect-square object-contain flex-shrink-0 rounded-sm"
                    />
                    {!isCollapsed && (
                        <span className="text-md font-medium truncate">
                            Lord Arbiter
                        </span>
                    )}
                </div>

                {/* Navigation Menu */}
                <SidebarGroup>
                    <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-3"
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            {!isCollapsed && (
                                                <span className="truncate">
                                                    {item.title}
                                                </span>
                                            )}
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className={`w-full flex flex-row items-center justify-between gap-4 pb-8 ${isCollapsed ? "px-2" : "px-4"}`}>
                <div className={`flex items-center gap-4`}>
                    <Avatar className="w-8 h-8 aspect-square object-contain flex-shrink-0 rounded-sm">
                        <AvatarImage
                            src={
                                "https://oyster.ignimgs.com/mediawiki/apis.ign.com/wuthering-waves/3/30/Rover-havoc-male-icon.png"
                            }
                            alt="MN"
                        />
                        <AvatarFallback>MN</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex flex-col gap-0 overflow-hidden">
                            <span className="font-medium truncate">
                                {username || "Unknown User"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                UID: {uid || "N/A"}
                            </span>
                        </div>
                    )}
                </div>
                <ChevronUp className="size-4" />
            </SidebarFooter>
        </Sidebar>
    );
}
