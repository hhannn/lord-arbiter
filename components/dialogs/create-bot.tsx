import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { AssetsCombobox } from "../assets-combobox";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { CirclePlus } from "lucide-react";

import { cn } from "@/lib/utils";

import { useBotStore } from "@/store/useBotStore";
import { InputBase, InputBaseAdornment, InputBaseControl, InputBaseInput } from "../ui/input-base";

export function CreateBotDialog() {

    const { createBot } = useBotStore();

    // State for Create Bot Dialog
    const [createAsset, setCreateAsset] = useState("");
    const [createStartSize, setCreateStartSize] = useState("");
    const [createLeverage, setCreateLeverage] = useState("");
    const [createMultiplier, setCreateMultiplier] = useState("");
    const [createTakeProfit, setCreateTakeProfit] = useState("");
    const [createRebuy, setCreateRebuy] = useState("");
    const [createMaxRebuy, setCreateMaxRebuy] = useState("");
    const [createStartType, setCreateStartType] = useState<"USDT" | "percent_equity">("percent_equity");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const [createErrors, setCreateErrors] = useState({
        asset: false,
        start_size: false,
        leverage: false,
        multiplier: false,
        take_profit: false,
        rebuy: false,
        start_type: false,
    });

    const resetCreateForm = () => {
        setCreateAsset("");
        setCreateStartSize("");
        setCreateLeverage("");
        setCreateMultiplier("");
        setCreateTakeProfit("");
        setCreateRebuy("");
        setCreateMaxRebuy("");
        setCreateStartType("percent_equity");
        setCreateErrors({
            asset: false,
            start_size: false,
            leverage: false,
            multiplier: false,
            take_profit: false,
            rebuy: false,
            start_type: false,
        });
    };

    async function handleCreateBot() {
        const newErrors = {
            asset: !createAsset.trim(),
            start_size: !createStartSize.trim() || isNaN(parseFloat(createStartSize)) || parseFloat(createStartSize) <= 0,
            leverage: !createLeverage.trim() || isNaN(parseFloat(createLeverage)) || parseFloat(createLeverage) <= 0,
            multiplier: !createMultiplier.trim() || isNaN(parseFloat(createMultiplier)) || parseFloat(createMultiplier) <= 0,
            take_profit: !createTakeProfit.trim() || isNaN(parseFloat(createTakeProfit)) || parseFloat(createTakeProfit) <= 0,
            rebuy: !createRebuy.trim() || isNaN(parseFloat(createRebuy)) || parseFloat(createRebuy) < 0,
            max_rebuy: !createMaxRebuy.trim() || isNaN(Number(createMaxRebuy)) || Number(createMaxRebuy) < 0,
            start_type: !createStartType.trim(),
        };

        setCreateErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        await createBot({
            asset: createAsset,
            start_size: parseFloat(createStartSize),
            leverage: parseFloat(createLeverage),
            multiplier: parseFloat(createMultiplier),
            take_profit: parseFloat(createTakeProfit),
            rebuy: parseFloat(createRebuy),
            max_rebuy: parseFloat(createMaxRebuy),
            start_type: createStartType
        });

        setCreateDialogOpen(false);
        resetCreateForm();
    }

    return (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} >
            <DialogTrigger asChild>
                <Button
                    className="ml-auto h-8" 
                    size="sm"
                    onClick={() => {
                        resetCreateForm(); // Reset form when opening
                        setCreateDialogOpen(true);
                    }}
                >
                    <CirclePlus />
                    Create new bot
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className="flex flex-col">
                    <DialogTitle className="text-2xl">
                        Create new bot
                    </DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        Enter the parameters for your new trading bot.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium">
                        Assets
                    </span>
                    <AssetsCombobox onSelect={setCreateAsset} />
                </div>
                <Separator className="my-4" />
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium">
                        Start size
                    </span>
                    <div className="flex gap-2 w-full">
                        <Input
                            className={cn(
                                createErrors.start_size
                                    ? "border-red-500"
                                    : ""
                            )}
                            type="number"
                            step="any"
                            value={createStartSize}
                            onChange={(e) =>
                                setCreateStartSize(e.target.value)
                            }
                        />
                        <Select
                            onValueChange={(value) => setCreateStartType(value as "USDT" | "percent_equity")}
                            value={createStartType}>
                            <SelectTrigger className={cn("w-[200px]", createErrors.start_type && "border-red-500")}>
                                <SelectValue
                                    placeholder={"% of equity"}
                                ></SelectValue>
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
                    <span className="w-[200px] font-medium">
                        Leverage
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseControl>
                                <InputBaseInput
                                    className={cn(createErrors.leverage && "border-red-500")}
                                    type="number"
                                    step={0.1}
                                    value={createLeverage}
                                    onChange={(e) =>
                                        setCreateLeverage(e.target.value)
                                    }
                                />
                            </InputBaseControl>
                            <InputBaseAdornment>x</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium">
                        Multiplier
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseControl>
                                <InputBaseInput
                                    className={cn(createErrors.multiplier && "border-red-500")}
                                    type="number"
                                    step={0.1}
                                    value={createMultiplier}
                                    onChange={(e) =>
                                        setCreateMultiplier(e.target.value)
                                    }
                                />
                            </InputBaseControl>
                            <InputBaseAdornment>x</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium">
                        Take Profit
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseControl>
                                <InputBaseInput
                                    className={cn(createErrors.take_profit && "border-red-500")}
                                    type="number"
                                    step={0.1}
                                    value={createTakeProfit}
                                    onChange={(e) =>
                                        setCreateTakeProfit(e.target.value)
                                    }
                                />
                            </InputBaseControl>
                            <InputBaseAdornment>%</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium">
                        Rebuy
                    </span>
                    <div className="w-full">
                        <InputBase>
                            <InputBaseControl>
                                <InputBaseInput
                                    className={cn(createErrors.rebuy && "border-red-500")}
                                    type="number"
                                    step={0.01}
                                    value={createRebuy}
                                    onChange={(e) =>
                                        setCreateRebuy(e.target.value)
                                    }
                                />
                            </InputBaseControl>
                            <InputBaseAdornment>%</InputBaseAdornment>
                        </InputBase>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="w-[200px] font-medium">
                        Max rebuy
                    </span>
                    <div className="w-full">
                        <Input
                            className={cn(createErrors.rebuy && "border-red-500")}
                            type="number"
                            step="any"
                            value={createMaxRebuy}
                            onChange={(e) =>
                                setCreateMaxRebuy(e.target.value)
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateBot}>
                        Create bot
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}