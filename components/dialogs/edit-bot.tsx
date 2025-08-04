"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AssetsCombobox } from "../assets-combobox";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect, useState } from "react";
import { Bot } from "@/types/bot";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useBotStore } from "@/store/useBotStore";
import { InputBase, InputBaseAdornment, InputBaseInput } from "../ui/input-base";

interface EditBotDialogProps {
    bot: Bot;
    // children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditBotDialog({ bot, open, onOpenChange }: EditBotDialogProps) {

    const { updateBot } = useBotStore();

    const [editAsset, setEditAsset] = useState(bot.asset);
    const [editStartSize, setEditStartSize] = useState(String(bot.start_size));
    const [editLeverage, setEditLeverage] = useState(String(bot.leverage));
    const [editMultiplier, setEditMultiplier] = useState(String(bot.multiplier));
    const [editTakeProfit, setEditTakeProfit] = useState(String(bot.take_profit));
    const [editRebuy, setEditRebuy] = useState(String(bot.rebuy));
    const [editStartType, setEditStartType] = useState<"USDT" | "percent_equity">(bot.start_type); // Explicitly typed
    const [editMaxRebuy, setEditMaxRebuy] = useState(String(bot.max_rebuy));

    const [editErrors, setEditErrors] = useState({
        asset: false, start_size: false, leverage: false,
        multiplier: false, take_profit: false, rebuy: false, start_type: false,
        max_rebuy: false
    });

    const handleUpdateBot = async () => {
        const newErrors = {
            asset: !editAsset.trim(),
            start_size: !editStartSize.trim() || isNaN(parseFloat(editStartSize)) || parseFloat(editStartSize) <= 0,
            leverage: !editLeverage.trim() || isNaN(parseFloat(editLeverage)) || parseFloat(editLeverage) <= 0,
            multiplier: !editMultiplier.trim() || isNaN(parseFloat(editMultiplier)) || parseFloat(editMultiplier) <= 0,
            take_profit: !editTakeProfit.trim() || isNaN(parseFloat(editTakeProfit)) || parseFloat(editTakeProfit) <= 0,
            rebuy: !editRebuy.trim() || isNaN(parseFloat(editRebuy)) || parseFloat(editRebuy) < 0,
            start_type: !editStartType.trim(),
            max_rebuy: !editMaxRebuy.trim() || isNaN(parseFloat(editMaxRebuy)) || parseFloat(editMaxRebuy) < 0,
        };

        setEditErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        console.log("Calculated newErrors object (JSON.stringify):", JSON.stringify(newErrors));
        console.log("Value of hasError:", hasError);
        if (hasError) {
            toast.error("Please fill in all required fields correctly for editing.");
            return;
        }

        try {
            await updateBot(bot.id, {
                asset: editAsset,
                start_size: parseFloat(editStartSize),
                leverage: parseFloat(editLeverage),
                multiplier: parseFloat(editMultiplier),
                take_profit: parseFloat(editTakeProfit),
                rebuy: parseFloat(editRebuy),
                start_type: editStartType,
                max_rebuy: Number(editMaxRebuy),
            });
            toast.success("Bot updated successfully!");
            onOpenChange(false);
        } catch (error) {
            // The error handling for the actual API call is in the parent's onUpdateBot function.
            console.error("Error during bot update (in EditBotDialog):", error);
            toast.error("Failed to update bot. Please try again.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className="flex flex-col">
                    <DialogTitle className="text-2xl">
                        Edit Bot {bot.id}
                    </DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        Modify the parameters for your bot.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium text-white">
                        Assets
                    </span>
                    <AssetsCombobox onSelect={setEditAsset} initialValue={editAsset} />
                </div>
                <Separator className="my-4" />
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium text-white">
                        Start size
                    </span>
                    <div className="flex gap-2 w-full">
                        <Input
                            className={cn(editErrors.start_size ? "border-red-500" : "")}
                            type="number"
                            step="any"
                            value={editStartSize}
                            onChange={(e) => setEditStartSize(e.target.value)}
                        />
                        <Select
                            onValueChange={(value) => setEditStartType(value as "USDT" | "percent_equity")}
                            value={editStartType}
                        >
                            <SelectTrigger className={cn("w-[200px]", editErrors.start_type && "border-red-500")}>
                                <SelectValue placeholder={"% of equity"}></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="percent_equity">% of equity</SelectItem>
                                    <SelectItem value="USDT">USDT</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium text-white">
                        Leverage
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseInput
                                className={cn(editErrors.leverage && "border-red-500")}
                                type="number"
                                step="any"
                                value={editLeverage}
                                onChange={(e) => setEditLeverage(e.target.value)}
                            />
                            <InputBaseAdornment>x</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium text-white">
                        Multiplier
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseInput
                                className={cn(editErrors.multiplier && "border-red-500")}
                                type="number"
                                step="any"
                                value={editMultiplier}
                                onChange={(e) => setEditMultiplier(e.target.value)}
                            />
                            <InputBaseAdornment>x</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium text-white">
                        Take Profit
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseInput
                                className={cn(editErrors.take_profit && "border-red-500")}
                                type="number"
                                step="any"
                                value={editTakeProfit}
                                onChange={(e) => setEditTakeProfit(e.target.value)}
                            />
                            <InputBaseAdornment>%</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium text-white">
                        Rebuy
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseInput
                                className={cn(editErrors.rebuy && "border-red-500")}
                                type="number"
                                step="any"
                                value={editRebuy}
                                onChange={(e) => setEditRebuy(e.target.value)}
                            />
                            <InputBaseAdornment>%</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium text-white">
                        Max Rebuy
                    </span>
                    <div className="w-full">
                        <Input
                            className={cn(editErrors.max_rebuy && "border-red-500")}
                            type="number"
                            step="any"
                            value={editMaxRebuy}
                            onChange={(e) => setEditMaxRebuy(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdateBot}>
                        Update Bot
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}