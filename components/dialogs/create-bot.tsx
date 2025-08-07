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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

export function CreateBotDialog() {

    const { createBot, instrumentInfo, fetchInstrumentInfo } = useBotStore();

    const formSchema = z.object({
        asset: z.string().nonempty("Asset is required"),
        start_type: z.enum(["USDT", "percent_equity", "qty"]),
        start_size: z.coerce.number(),
        // .min(
        //     instrumentInfo ? instrumentInfo.minQty : 0.001,
        //     `Start size must be at least asset's minimum quantity of ${instrumentInfo?.minQty}`
        // )
        // .multipleOf(
        //     instrumentInfo ? instrumentInfo.qtyStep : 0.0001,
        //     `Must be multiple asset's quantity step of ${instrumentInfo?.qtyStep}`
        // ),
        leverage: z.coerce.number()
            .min(instrumentInfo?.minLeverage ?? 1, `Minimum leverage is ${instrumentInfo?.minLeverage}x`)
            .max(instrumentInfo?.maxLeverage ?? 25, `Maximum leverage is ${instrumentInfo?.maxLeverage}x`),
        multiplier: z.coerce.number()
            .min(1, "Must be at least 1"),
        take_profit: z.coerce.number()
            .min(0.01, "Must be at least 0.01"),
        rebuy: z.coerce.number()
            .min(0.01, "Must be at least 0.01"),
        max_rebuy: z.coerce.number()
            .min(1, "Must be at least 1")
    })
        .superRefine((data, ctx) => {
            if (data.start_type === "qty") {
                const minQty = instrumentInfo?.minQty ?? 0.001;
                const qtyStep = instrumentInfo?.qtyStep ?? 0.0001;

                if (data.start_size < minQty) {
                    ctx.addIssue({
                        path: ["start_size"],
                        code: "too_small",
                        origin: "number", // ✅ required in Zod 3.23+
                        minimum: minQty,
                        inclusive: true,
                        message: `Start size must be at least asset's minimum quantity of ${minQty}`,
                    });
                }

                const isMultipleOf = Math.abs((data.start_size / qtyStep) % 1) < 1e-8;
                if (!isMultipleOf) {
                    ctx.addIssue({
                        path: ["start_size"],
                        code: "custom",
                        message: `Must be multiple of asset's quantity step ${qtyStep}`,
                    });
                }
            } else if (data.start_type === "USDT") {
                if (data.start_size < 5) {
                    ctx.addIssue({
                        path: ["start_size"],
                        code: "too_small",
                        origin: "number", // ✅ required in Zod 3.23+
                        minimum: 5,
                        inclusive: true,
                        message: `Start size is less than minimum notional value of 5`,
                    })
                }
            }
        });


    const [openForm, setOpenForm] = useState(false);

    // State for Create Bot Dialog
    // const [createAsset, setCreateAsset] = useState("");
    // const [createStartSize, setCreateStartSize] = useState("");
    // const [createLeverage, setCreateLeverage] = useState("");
    // const [createMultiplier, setCreateMultiplier] = useState("");
    // const [createTakeProfit, setCreateTakeProfit] = useState("");
    // const [createRebuy, setCreateRebuy] = useState("");
    // const [createMaxRebuy, setCreateMaxRebuy] = useState("");
    // const [createStartType, setCreateStartType] = useState<"USDT" | "percent_equity" | "qty">("percent_equity");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // const [createErrors, setCreateErrors] = useState({
    //     asset: false,
    //     start_size: false,
    //     leverage: false,
    //     multiplier: false,
    //     take_profit: false,
    //     rebuy: false,
    //     start_type: false,
    // });

    // const resetCreateForm = () => {
    //     setCreateAsset("");
    //     setCreateStartSize("");
    //     setCreateLeverage("");
    //     setCreateMultiplier("");
    //     setCreateTakeProfit("");
    //     setCreateRebuy("");
    //     setCreateMaxRebuy("");
    //     setCreateStartType("percent_equity");
    //     setCreateErrors({
    //         asset: false,
    //         start_size: false,
    //         leverage: false,
    //         multiplier: false,
    //         take_profit: false,
    //         rebuy: false,
    //         start_type: false,
    //     });
    // };

    // async function handleCreateBot() {
    //     const newErrors = {
    //         asset: !createAsset.trim(),
    //         start_size: !createStartSize.trim() || isNaN(parseFloat(createStartSize)) || parseFloat(createStartSize) <= 0,
    //         leverage: !createLeverage.trim() || isNaN(parseFloat(createLeverage)) || parseFloat(createLeverage) <= 0,
    //         multiplier: !createMultiplier.trim() || isNaN(parseFloat(createMultiplier)) || parseFloat(createMultiplier) <= 0,
    //         take_profit: !createTakeProfit.trim() || isNaN(parseFloat(createTakeProfit)) || parseFloat(createTakeProfit) <= 0,
    //         rebuy: !createRebuy.trim() || isNaN(parseFloat(createRebuy)) || parseFloat(createRebuy) < 0,
    //         max_rebuy: !createMaxRebuy.trim() || isNaN(Number(createMaxRebuy)) || Number(createMaxRebuy) < 0,
    //         start_type: !createStartType.trim(),
    //     };

    //     setCreateErrors(newErrors);

    //     if (Object.values(newErrors).some(Boolean)) {
    //         toast.error("Please fill in all required fields correctly.");
    //         return;
    //     }

    //     await createBot({
    //         asset: createAsset,
    //         start_size: parseFloat(createStartSize),
    //         leverage: parseFloat(createLeverage),
    //         multiplier: parseFloat(createMultiplier),
    //         take_profit: parseFloat(createTakeProfit),
    //         rebuy: parseFloat(createRebuy),
    //         max_rebuy: parseFloat(createMaxRebuy),
    //         start_type: createStartType
    //     });

    //     setCreateDialogOpen(false);
    //     resetCreateForm();
    // }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asset: "",
            start_type: "percent_equity",
            start_size: instrumentInfo?.minQty ?? 1,
            leverage: 1,
            multiplier: 1,
            take_profit: 1,
            rebuy: 1,
            max_rebuy: 10
        },
        mode: "onBlur",
        reValidateMode: "onBlur"
    })

    const { reset, trigger } = form;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        await createBot({
            asset: values.asset,
            start_size: values.start_size,
            leverage: values.leverage,
            multiplier: values.multiplier,
            take_profit: values.take_profit,
            rebuy: values.rebuy,
            max_rebuy: values.max_rebuy,
            start_type: values.start_type
        });

        setOpenForm(false);
        setCreateDialogOpen(false);
        console.log(values)
        reset();
    }

    return (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} >
            <DialogTrigger asChild>
                <Button
                    className="ml-auto h-8"
                    size="sm"
                    onClick={() => {
                        // resetCreateForm(); // Reset form when opening
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
                <Form {...form}>
                    <form className="flex flex-col gap-4 items-end justify-end"
                        onSubmit={(e) => {
                            console.log("submitted")
                            form.handleSubmit(onSubmit)(e)
                        }}
                    >
                        <div className="space-y-4 w-full">
                            <Controller
                                control={form.control}
                                name="asset"
                                render={({ field }) => (
                                    <AssetsCombobox
                                        onChange={(value) => {
                                            field.onChange(value);                  // update form value
                                            fetchInstrumentInfo(value);             // your custom side effect
                                            setOpenForm(true);                      // open the form
                                        }}
                                        value={field.value}
                                    />
                                )}
                            >
                            </Controller>
                            <div className="border p-4 rounded-md text-sm grid grid-cols-3 text-muted-foreground">
                                <div className="font-medium">Min. quantity</div>
                                <div className="font-medium">Quantity step</div>
                                <div className="font-medium">Market price</div>
                                <div className="text-foreground">{instrumentInfo?.minQty ?? "-"}</div>
                                <div className="text-foreground">{instrumentInfo?.qtyStep ?? "-"}</div>
                                <div className="text-foreground">WIP</div>
                                <div className="mt-2 font-medium">Min. leverage</div>
                                <div className="mt-2 font-medium">Max. leverage</div>
                                <div className="col-start-1 text-foreground">{instrumentInfo?.minLeverage}</div>
                                <div className="text-foreground">{instrumentInfo?.maxLeverage}</div>
                            </div>
                        </div>
                        <div className={`grid grid-cols-3 gap-y-3 text-sm items-center font-medium ${openForm ? "block" : "hidden"}`}>
                            <div>Start size</div>
                            <div className="grid grid-cols-2 col-span-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="start_size"
                                    render={({ field }) => (
                                        <FormItem className="font-normal">
                                            <FormControl className="">
                                                <Input {...field}
                                                    type="number"
                                                    value={field.value as number}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="start_type"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                setTimeout(() => {
                                                    trigger("start_size");     // ✅ run validation after state is updated
                                                }, 0);
                                            }}
                                        >
                                            <FormControl className="1">
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="percent_equity">% of equity</SelectItem>
                                                    <SelectItem value="USDT">USDT</SelectItem>
                                                    <SelectItem value="qty">Quantity</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormMessage className="col-span-2">
                                    {form.formState.errors.start_size?.message}
                                </FormMessage>
                            </div>

                            <div>Leverage</div>
                            <FormField
                                control={form.control}
                                name="leverage"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 font-normal">
                                        <FormControl>
                                            <Input {...field}
                                                type="number"
                                                value={field.value as number}
                                                onChange={field.onChange}
                                                step={0.1}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>Multiplier</div>
                            <FormField
                                control={form.control}
                                name="multiplier"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 font-normal">
                                        <FormControl>
                                            <Input {...field}
                                                type="number"
                                                value={field.value as number}
                                                onChange={field.onChange}
                                                step={0.1}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>Take profit</div>
                            <FormField
                                control={form.control}
                                name="take_profit"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 font-normal">
                                        <FormControl>
                                            <Input {...field}
                                                type="number"
                                                value={field.value as number}
                                                onChange={field.onChange}
                                                step={0.1}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>Rebuy</div>
                            <FormField
                                control={form.control}
                                name="rebuy"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 font-normal">
                                        <FormControl>
                                            <Input {...field}
                                                type="number"
                                                value={field.value as number}
                                                onChange={field.onChange}
                                                step={0.1}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>Max rebuy</div>
                            <FormField
                                control={form.control}
                                name="max_rebuy"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 font-normal">
                                        <FormControl>
                                            <Input {...field}
                                                type="number"
                                                value={field.value as number}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button className={openForm ? "block" : "hidden"} type="submit">Create bot</Button>
                    </form>
                </Form>
                {/* <Separator className="my-4" />
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
                </div> */}
                {/* <DialogFooter>
                    <Button onClick={handleCreateBot}>
                        Create bot
                    </Button>
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}