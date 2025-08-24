import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBotStore } from "@/store/useBotStore";
import React from "react";

interface DeleteBotDialogProps {
    botId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteBotDialog({ botId, open, onOpenChange }: DeleteBotDialogProps) {
    const { deleteBot } = useBotStore();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete bot ID{" "}
                        <span className="font-bold text-red-500">{botId}</span>{" "}
                        and remove its data from our servers. If the bot is running, it will be stopped first.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteBot(botId)} className="bg-red-600 hover:bg-red-700 text-white">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
