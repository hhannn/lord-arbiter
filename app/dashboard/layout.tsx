import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { AppNavbar } from "@/components/app-navbar";
import Footer from "@/components/footer";

export const metadata = {
    title: "Lord Arbiter",
    description: "Weeping may endure for a night, but joy comes in the morning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    
    return (
        <SidebarProvider className="static flex flex-col pe-2 pb-2">
            {/* dark:bg-[radial-gradient(#fcfcfc12_1px,transparent_1px)] dark:[background-size:32px_32px] */}
            <div className="flex min-h-screen w-full font-inter">
                {/* <DotPattern width={60} height={60} glow={true} cx={1} cy={1} cr={1} className={"-z-10 opacity-40"} /> */}
                <AppSidebar />
                <div className="relative w-full bg-background my-2 md:ms-0 flex-1 border rounded-3xl">
                    <AppNavbar />
                    <main className="relative">
                        {/* <Image
                        priority
                        src="/assets/bg-gradient.svg"
                        height={472}
                        width={422}
                        alt="Background Gradient"
                        className="-z-10 -translate-x-full pointer-events-none absolute top-[57px] left-1/3 hidden scale-100 dark:block opacity-50"
                    /> */}
                        <div className="px-0 md:px-6">
                            {children}
                        </div>
                    </main>
                </div>
                <Toaster richColors position="top-center" />
            </div>
            <Footer />
        </SidebarProvider >
    );
}
