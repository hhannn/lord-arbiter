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
        <SidebarProvider className="flex flex-col md:pe-2 pb-2">
            {/* dark:bg-[radial-gradient(#fcfcfc12_1px,transparent_1px)] dark:[background-size:32px_32px] */}
            <div className="flex min-h-screen w-full font-inter">
                <AppSidebar />
                <div className="w-full md:my-2 md:ms-0 md:rounded-3xl overflow-hidden">
                    <div className="relative">
                        <AppNavbar />
                        <div className="bg-background w-full rounded-b-3xl">
                            <main className="w-full pt-12 md:pt-0 md:px-6">
                                {children}
                            </main>
                        </div>
                        <div className="w-full h-full absolute top-0 left-0 md:border rounded-3xl z-10 pointer-events-none" />
                    </div>
                    <Footer />
                </div>
                <Toaster richColors position="top-center" />
            </div>
        </SidebarProvider >
    );
}
