import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { AppNavbar } from "@/components/app-navbar";
import Link from "next/link";
import Image from "next/image";
import { ThemeProvider } from "@/components/theme-provider";

import { SpeedInsights } from "@vercel/speed-insights/next"
import { DotPattern } from "@/components/magicui/dot-pattern";
import { EtheralShadow } from "@/components/ui/shadcn-io/etheral-shadow";
import { Shadow } from "@/components/shadow";

export const metadata = {
    title: "Lord Arbiter",
    description: "Weeping may endure for a night, but joy comes in the morning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider>
                <div className="flex min-h-screen w-full font-sans dark:bg-[radial-gradient(#fcfcfc12_1px,transparent_1px)] dark:[background-size:32px_32px]">
                    {/* <DotPattern width={60} height={60} glow={true} cx={1} cy={1} cr={1} className={"-z-10 opacity-40"} /> */}
                    <AppSidebar />
                    <main className="flex-1 w-full">
                        {/* <Image
                            priority
                            src="/assets/bg-gradient.svg"
                            height={472}
                            width={422}
                            alt="Background Gradient"
                            className="-z-10 -translate-x-full pointer-events-none absolute top-[57px] left-1/3 hidden scale-100 dark:block opacity-50"
                        /> */}
                        <div className="w-full h-[57px] bg-background py-2 px-4 gap-4 border-b border-border fixed top-0 z-10 flex items-center">
                            <AppNavbar />
                        </div>
                        <Shadow />
                        {children}
                    </main>
                    <Toaster richColors position="top-center" />
                </div>
            </SidebarProvider>
        </ThemeProvider>
    );
}
