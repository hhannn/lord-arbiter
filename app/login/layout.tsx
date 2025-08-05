import { ThemeProvider } from "@/components/theme-provider";

import { SpeedInsights } from "@vercel/speed-insights/next"
import dynamic from "next/dynamic";

export const metadata = {
    title: "Lord Arbiter",
    description: "Weeping may endure for a night, but joy comes in the morning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head />
            <body>
                <video autoPlay muted loop playsInline className="fixed -z-20">
                    <source
                        src="https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/video/1734710400000/w9ijnl9qgqh70nc899-1734783150908.mp4"
                    />
                </video>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="min-h-screen">
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
