"use client";
import { usePathname } from 'next/navigation'
import { useTheme } from "next-themes";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sun, Moon } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AppNavbar() {
    const { setTheme } = useTheme();

    const pathname = usePathname();
    const pageName = pathname.split("/").pop()?.replace("-", " ");

    // const container = useRef<HTMLDivElement>(null);
    // useGSAP(() => {
    //     ScrollTrigger.create({
    //         trigger: container.current,
    //         start: "top top",
    //         end: "max",
    //         pin: true,
    //         pinSpacing: false
    //     })
    // }, { scope: container })

    return (
        <div className='fixed md:relative z-10 px-8 py-3 border-b bg-background/80 rounded-t-3xl backdrop-blur-sm w-full'>
            <ul className="w-full flex justify-between items-center">
                <li className="flex items-center justify-between gap-2 min-w-0">
                    <SidebarTrigger />
                    <span className="h-[16px] w-[1px] me-1"></span>
                    <span className="font-medium truncate first-letter:uppercase">{pageName}</span>
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
