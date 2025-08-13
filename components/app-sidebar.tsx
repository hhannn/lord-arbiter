"use client";

import { useUserData } from "@/store/useUserData";
import { useRouter } from "next/navigation";

import { Home, Bot, ChevronsUpDown, ChevronUp, Calculator, ChartArea, ChartLine, Settings, LogOut, LayoutDashboard, User, BotIcon, TestTubeDiagonal } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ProfileDialog } from "./dialogs/profile-dialog";
import { use, useState } from "react";

const items = [
    // { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Backtest result", url: "/dashboard/backtest-result", icon: TestTubeDiagonal },
    { title: "Trading performance", url: "/dashboard/performance", icon: ChartLine },
    // { title: "Bot", url: "#", icon: Bot },
    { title: "Calculator", url: "/dashboard/calculator", icon: Calculator },
];

type AppSidebarProps = {
    collapsible?: "offcanvas" | "icon" | "none";
};

export function AppSidebar({ collapsible = "icon" }: AppSidebarProps) {
    const router = useRouter();
    const { state } = useSidebar();
    const { username, uid, logout } = useUserData();
    const isCollapsed = state === "collapsed";

    const [profileDialogOpen, setProfileDialogOpen] = useState(false);

    return (
        <Sidebar collapsible={collapsible} className="border-none">
            <SidebarContent className="">
                {/* Logo Section - Always visible */}
                <div
                    className={`flex items-center gap-4 ${isCollapsed ? "px-3 pt-6 pb-2" : "px-4 pt-6 pb-2"
                        }`}
                >
                    <img
                        className={`aspect-square object-contain shrink-0 rounded-sm ${isCollapsed ? "size-6" : "size-8"}`}
                        src="/assets/logo.png"
                        alt="logo"
                    />
                    {!isCollapsed && (
                        <span className="text-md font-medium truncate">
                            Lord Arbiter
                        </span>
                    )}
                </div>

                {/* Navigation Menu */}
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <a
                                    href="/dashboard"
                                    className="flex items-center gap-3"
                                >
                                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && (
                                        <span className="truncate text-sm">
                                            Dashboard
                                        </span>
                                    )}
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <a
                                    href="/dashboard/bots"
                                    className="flex items-center gap-3"
                                >
                                    <BotIcon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && (
                                        <span className="truncate text-sm">
                                            Bots
                                        </span>
                                    )}
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarGroupLabel>Analysis</SidebarGroupLabel>
                        <SidebarMenu>
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
                                                    <span className="truncate text-sm">
                                                        {item.title}
                                                    </span>
                                                )}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="w-full pb-8 px-2">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="w-full flex items-center justify-between gap-4 p-2 hover:bg-accent cursor-pointer rounded-md">
                            <div className={`flex items-center gap-4`}>
                                <Avatar className={`aspect-square object-contain flex-shrink-0 rounded-sm ${isCollapsed ? "size-4" : "size-8"}`}>
                                    <AvatarImage
                                        src={
                                            "https://oyster.ignimgs.com/mediawiki/apis.ign.com/wuthering-waves/3/30/Rover-havoc-male-icon.png"
                                        }
                                        alt="MN"
                                    />
                                    <AvatarFallback>MN</AvatarFallback>
                                </Avatar>
                                {!isCollapsed && (
                                    <div className="flex flex-col items-stretch gap-0 overflow-hidden">
                                        <span className="font-medium truncate text-start">
                                            {username || "Unknown User"}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            UID: {uid || "N/A"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <ChevronUp className="size-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-60">
                        <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                            <User />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            logout();
                            router.push("/login");
                        }}>
                            <LogOut className="text-destructive" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
            <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
        </Sidebar>
    );
}
