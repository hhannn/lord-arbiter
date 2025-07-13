import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "Lord Arbiter | Login",
  description: "Sign in to your MyApp account",
};

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="dark:bg-[radial-gradient(#fafafa12_1px,transparent_1px)] dark:[background-size:16px_16px] min-h-screen">
        <main className="flex flex-col items-stretch justify-center gap-8 p-4 max-w-sm mx-auto min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl sm:text-4xl font-medium">
                  Lord Arbiter
                </h1>
                <p className="text-sm text-muted-foreground">
                  Weeping may endure for a night, but joy comes in the morning.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4 w-full">
              <Input type="text" placeholder="API Key" />
              <Input type="password" placeholder="API Secret" />
              <Button variant="outline" className="w-full">
                Submit
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
