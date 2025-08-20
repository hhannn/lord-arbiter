import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono, Inter, Azeret_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"]
})

const notoMono = Noto_Sans_Mono({
  variable: "--font-noto-sans-mono",
  subsets: ["latin"]
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Lord Arbiter",
  description: "Weeping may endure for a night, but joy comes in the morning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${azeretMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* <video autoPlay loop muted playsInline className="mix-blend-lighten fixed bottom-0 -z-10 opacity-40">
          <source src="https://wutheringwaves.kurogames.com/static4.0/assets/bg-wave-4a496675.mp4" />
        </video> */}
          {/* <LenisProvider> */}
            {children}
          {/* </LenisProvider> */}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
