import { Shadow } from "@/components/shadow";
import { ThemeProvider } from "@/components/theme-provider";
import { EtheralShadow } from "@/components/ui/shadcn-io/etheral-shadow";
import dynamic from "next/dynamic";

export const metadata = {
    title: "Lord Arbiter",
    description: "Weeping may endure for a night, but joy comes in the morning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="h-screen overflow-hidden relative">
            <Shadow color="rgba(125, 125, 125, 1)" />
            <div className="relative min-h-screen">
                {children}
            </div>
        </main>
    );
}
