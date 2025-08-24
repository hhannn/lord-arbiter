"use client";

import { useState } from "react";
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

import { MoreHorizontal, Pencil, X, LoaderCircle, Rocket, FileText } from "lucide-react"; // Added FileText back
import { IconPlayerStopFilled } from "@tabler/icons-react";
import { DeleteBotDialog } from "../dialogs/delete-bot";
import { BotDetailDialog } from "../dialogs/bot-detail";
import { EditBotDialog } from "../dialogs/edit-bot";
import { useBotStore } from "@/store/useBotStore";
import { StopBot } from "../dialogs/stop-bot";

interface BotActionButtonsProps {
    bot: Bot;
}

export function BotActionButtons({
    bot
}: BotActionButtonsProps) {
    const { id, status } = bot;

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [stopDialogOpen, setStopDialogOpen] = useState(false);

    const { startBot } = useBotStore();

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
                                variant="ghost"
                                title="More action"
                            >
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                                    <FileText className="mr-2 h-4 w-4" />
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
                    <EditBotDialog botId={id} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
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
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                setEditDialogOpen(true);
                            }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDetailDialogOpen(true)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Bot details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setStopDialogOpen(true)}
                            >
                                <IconPlayerStopFilled className="text-destructive mr-2" />
                                Stop bot
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu >
                    <EditBotDialog botId={id} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
                    <BotDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} bot={bot} />
                    <StopBot bot={bot} open={stopDialogOpen} onOpenChange={setStopDialogOpen} />
                </>
            );
        case "graceful_stopping":
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
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startBot(id)} disabled>
                                <Rocket className="mr-2 h-4 w-4" />
                                Continue bot
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDetailDialogOpen(true)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Bot details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setStopDialogOpen(true)}
                            >
                                <IconPlayerStopFilled className="text-destructive mr-2" />
                                Stop bot
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu >
                    <BotDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} bot={bot} />
                    <StopBot bot={bot} open={stopDialogOpen} onOpenChange={setStopDialogOpen} />
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