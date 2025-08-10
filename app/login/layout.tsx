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
        <>
            <main className="h-screen overflow-hidden relative">
                <Shadow color="rgba(125, 125, 125, 1)" />
                <div className="relative min-h-screen">
                    {children}
                </div>
            </main>
            {/* <video autoPlay muted loop playsInline className="fixed -z-20">
                <source
                    src="https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/video/1734710400000/w9ijnl9qgqh70nc899-1734783150908.mp4"
                />
            </video> */}
        </>

    );
}
