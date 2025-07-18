import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
    title: "Lord Arbiter",
    description: "Sign in to your MyApp account",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head />
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="dark:bg-[radial-gradient(#fafafa12_1px,transparent_1px)] dark:[background-size:16px_16px] min-h-screen">
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
