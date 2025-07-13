import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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
import Link from "next/link";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full dark:bg-[radial-gradient(#fafafa12_1px,transparent_1px)] dark:[background-size:16px_16px]">
                <AppSidebar />
                <main className="flex-1 w-full">
                    <Image
                        priority
                        src="/assets/bg-gradient.svg"
                        height={472}
                        width={422}
                        alt="Background Gradient"
                        className="-z-10 -translate-x-full pointer-events-none absolute top-[57px] left-1/3 hidden scale-100 dark:block"
                    />
                    <div className="w-full h-[57px] bg-neutral-950 py-2 px-4 gap-4 border-b border-neutral-800 fixed top-0 z-10 flex items-center">
                        <NavigationMenu className="w-full max-w-none justify-start">
                            <NavigationMenuList className="w-full justify-start">
                                <NavigationMenuItem className="flex items-center gap-2">
                                    <SidebarTrigger />
                                    <span className="h-[16px] w-[1px] bg-muted me-1"></span>
                                    <span className="font-medium">
                                        Dashboard
                                    </span>
                                    {/* <NavigationMenuLink asChild>
                    <Link href="/login">Documentation</Link>
                  </NavigationMenuLink> */}
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
