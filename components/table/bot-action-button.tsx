"use client";

import { useState, useEffect, useMemo } from "react";
import { Bot } from "@/types/bot"; // Assuming your Bot interface is in types/bot.ts

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger, // Keep DialogTrigger for the edit dialog
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AssetsCombobox } from "@/components/assets-combobox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "../ui/badge";

import { MoreHorizontal, Pencil, X, LoaderCircle, Rocket, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react"; // Added FileText back
import { IconPlayerStopFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserData } from "@/store/useUserData"; // Assuming this is your user data store
import { BotDailyChart } from "../charts/bot-daily-pnl-chart"; // Correct import and alias
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { Card, CardDescription, CardTitle } from "../ui/card"; // Assuming these are used for the chart card
import { useDashboardData } from "@/context/dashboardContext";
import { Item } from "@radix-ui/react-select";
import { DeleteBotDialog } from "../dialogs/delete-bot";
import { BotDetailDialog } from "../dialogs/bot-detail";
import { EditBotDialog } from "../dialogs/edit-bot";
import { useBotStore } from "@/store/useBotStore";

interface BotActionButtonsProps {
    bot: Bot;
}

export function BotActionButtons({
    bot
}: BotActionButtonsProps) {
    const {
        id, status
    } = bot;

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { startBot, stopBot } = useBotStore();

    switch (status.toLowerCase()) {
        case "idle":
        case "error":
        case "stopped":
            return (
                <>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="my-2 size-8"
                                size="icon"
                                variant="secondary"
                                title="More action"
                            >
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => startBot(id)}>
                                    <Rocket className="mr-2 h-4 w-4" />
                                    Run
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                    e.preventDefault();
                                    setEditDialogOpen(true);
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setDetailDialogOpen(true)}>
                                    Bot details
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    className="text-red-400"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <X className="mr-2 h-4 w-4 text-red-400" />
                                    Delete bot
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <EditBotDialog bot={bot} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
                    <DeleteBotDialog botId={id} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
                    <BotDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} bot={bot} />
                </>
            );
        case "running":
            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger> {/* Added asChild here */}
                            <Button
                                className="my-2 size-8"
                                size="icon"
                                variant="ghost"
                                title="More actions"
                            >
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setDetailDialogOpen(true)}>
                                Bot details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => stopBot(id)}
                            >
                                <IconPlayerStopFilled className="text-destructive mr-2" />
                                Stop bot
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu >
                    <BotDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} bot={bot} />
                </>
            );
        case "stopping":
            return (
                <Button
                    className="my-2 size-8"
                    size="icon"
                    disabled
                    variant="outline"
                    title="Stopping bot"
                >
                    <LoaderCircle className="animate-spin" />
                </Button>
            );
        default:
            return null;
    }
}