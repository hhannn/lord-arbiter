"use client"

import { Shadow } from "./shadow";
import { Separator } from "./ui/separator";
import { useSidebar } from "./ui/sidebar";

export default function Footer() {
    // const { state } = useSidebar();
    // const isCollapsed = state === "collapsed";

    return (
        <footer className={`mt-2 bg-background backdrop-blur-xs p-4 2xl:p-8 pb-4 self-end border rounded-3xl relative overflow-hidden`}>
            <div className="absolute left-0 bottom-0 h-full w-full">
                {/* <Shadow /> */}
            </div>
            <div className="relative p-2 flex flex-col md:grid md:grid-cols-3 gap-4">
                <div className="space-y-4 col-span-1">
                    <div className="flex gap-4 items-center">
                        <img className="size-12 rounded-full" src="/assets/logo.png" alt="logo" />
                        <div className="text-2xl font-semibold">Lord arbiter</div>
                    </div>
                    <div className="text-muted-foreground text-sm">
                        This is an independent fan project, not affiliated with or endorsed by Kuro Games. All game assets, content, and trademarks belong to their respective owners.
                    </div>
                </div>
                <div className="-col-start-1 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <ul className="space-y-1">
                        <li className="font-medium text-foreground">Development</li>
                        <li>System status</li>
                        <li>Changelog</li>
                        <li>
                            <a href="https://www.notion.so/24d4dd36cfab804381bcfa62ac2289f6?v=24d4dd36cfab80be8db0000c6fcb3c3e&source=copy_link" target="_blank" rel="noopener noreferrer">
                                Project tracker
                            </a>
                        </li>
                    </ul>
                    <ul className="space-y-1">
                        <li className="font-medium text-foreground">Legal</li>
                        <li>Privacy policy</li>
                        <li>Terms & conditions</li>
                    </ul>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="relative text-muted-foreground w-full text-center text-sm">© 2025 Lord Arbiter</div>
        </footer>
    )
}