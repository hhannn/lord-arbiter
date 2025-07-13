"use client";

import { Calendar, Home, Search, Settings, Bot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Bot", url: "#", icon: Bot },
];

type AppSidebarProps = {
  collapsible?: "offcanvas" | "icon" | "none";
};

export function AppSidebar({ collapsible = "icon" }: AppSidebarProps) {
  const { state } = useSidebar(); // Use 'state' instead of 'collapsed'
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible={collapsible}>
      <SidebarContent>
        {/* Logo Section - Always visible */}
        <div className="flex items-center gap-4 px-4 py-3 border-b">
          <Image
            src="/assets/logo.png"
            alt="logo"
            width={24}
            height={24}
            className="w-8 h-8 aspect-square object-contain flex-shrink-0"
          />
          {!isCollapsed && (
            <span className="text-lg font-medium truncate">
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
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}