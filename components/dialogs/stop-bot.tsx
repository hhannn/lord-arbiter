import { useBotStore } from "@/store/useBotStore";
import { Bot } from "@/types/bot";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useState } from "react";

interface StopBotProps {
    bot: Bot;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StopBot({ bot, open, onOpenChange }: StopBotProps) {
    const { stopBot } = useBotStore();
    const [type, setType] = useState<"immediate" | "graceful">("immediate");

    async function handleStop() {
        await stopBot({
            botId: bot.id,
            type: type,
        });

        console.log("Stopping bot:", bot.id, "Type:", type);
        onOpenChange(false);
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Stop Bot</AlertDialogTitle>
                    <AlertDialogDescription>
                        {bot.status.toLowerCase() === "running" ? (
                            <>
                                Choose how you want to stop the bot <strong>{bot?.asset}</strong>.
                            </>
                        ) : (
                            <>
                                Are you sure you want to stop the bot <strong>{bot?.asset}</strong> Bot will stop without waiting for the current trade to finish. Pending orders will not be cancelled.
                            </>
                        )

                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {bot.status.toLowerCase() === "running" &&
                    <RadioGroup className="mt-4 p-4 border rounded-lg"
                        defaultValue="immediate"
                        onValueChange={(value) => setType(value as "immediate" | "graceful")}
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <RadioGroupItem value="immediate" id="immediate" />
                            <Label htmlFor="immediate" className="flex flex-col items-start gap-1">
                                <span className="font-semibold">Immediate</span>
                                <span className="text-sm text-muted-foreground font-normal">
                                    Bot will stop without waiting for the current trade to finish. Pending orders will not be cancelled.
                                </span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-4">
                            <RadioGroupItem value="graceful" id="graceful" />
                            <Label htmlFor="graceful" className="flex flex-col items-start gap-1">
                                <span className="font-semibold">Graceful</span>
                                <span className="text-sm text-muted-foreground font-normal">
                                    Bot will continue to run until it take profit is executed.
                                </span>
                            </Label>
                        </div>
                    </RadioGroup>
                }
                <AlertDialogFooter>
                    <AlertDialogCancel >Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStop}>Stop</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    );
}