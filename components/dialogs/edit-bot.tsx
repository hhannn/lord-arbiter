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
import { InputBase, InputBaseAdornment, InputBaseControl, InputBaseInput } from "../ui/input-base";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ControlGroup, ControlGroupItem } from "../ui/control-group";
import { ChevronsUpDownIcon, Info } from "lucide-react";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface EditBotDialogProps {
    bot: Bot;
    // children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditBotDialog({ bot, open, onOpenChange }: EditBotDialogProps) {

    const { updateBot, instrumentInfo, fetchInstrumentInfo, resetInstrumentInfo } = useBotStore();

    useEffect(() => {
        if (open) {
            fetchInstrumentInfo(bot.asset);
        } else {
            resetInstrumentInfo();
            reset();
        }
    }, [open, bot.asset, fetchInstrumentInfo, resetInstrumentInfo]);

    const formSchema = z.object({
        asset: z.string().nonempty("Asset is required"),
        start_type: z.enum(["USDT", "percent_equity", "qty"]),
        start_size: z.coerce.number(),
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
            .min(1, "Must be at least 1"),
        resonance: z.string().nullable().optional(),
        average_based: z.coerce.boolean(),
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

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asset: bot.asset,
            start_type: bot.start_type,
            start_size: bot.start_size,
            leverage: bot.leverage,
            multiplier: bot.multiplier,
            take_profit: bot.take_profit,
            rebuy: bot.rebuy,
            max_rebuy: bot.max_rebuy,
            resonance: bot.resonance,
            average_based: bot.average_based
        },
        mode: "onBlur",
        reValidateMode: "onBlur"
    })

    const { reset, trigger } = form;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        await updateBot(bot.id, {
            asset: bot.asset,
            start_size: values.start_size,
            leverage: values.leverage,
            multiplier: values.multiplier,
            take_profit: values.take_profit,
            rebuy: values.rebuy,
            max_rebuy: values.max_rebuy,
            start_type: values.start_type,
            resonance: values.resonance ?? null,
            average_based: values.average_based
        });

        console.log(values)

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className="flex flex-col">
                    <DialogTitle className="text-2xl">
                        Edit Bot {bot.id}
                    </DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        Wisdom is gained from the journey, not the arrival.
                    </DialogDescription>
                </DialogHeader>
                <Button
                    type="button"
                    disabled
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full"
                >
                    {bot.asset}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                <Form {...form}>
                    <form className="flex flex-col gap-4 items-end justify-end"
                        onSubmit={(e) => {
                            console.log("submitted")
                            form.handleSubmit(onSubmit)(e)
                        }}
                    >
                        <div className="space-y-4 w-full">
                            <div className="border p-4 rounded-md text-sm grid grid-cols-3 text-muted-foreground">
                                <div className="font-medium">Min. quantity</div>
                                <div className="font-medium">Quantity step</div>
                                <div className="font-medium">Market price</div>
                                <div className="text-foreground">{instrumentInfo?.minQty ?? "-"}</div>
                                <div className="text-foreground">{instrumentInfo?.qtyStep ?? "-"}</div>
                                <div className="text-foreground">WIP</div>
                            </div>
                        </div>
                        <div className={`grid grid-cols-3 gap-y-3 text-sm items-center font-medium`}>
                            <div>Start size</div>
                            <div className="grid col-span-2 gap-2">
                                <ControlGroup>
                                    <ControlGroupItem>
                                        <InputBase>
                                            <InputBaseControl>
                                                <FormField
                                                    control={form.control}
                                                    name="start_size"
                                                    render={({ field }) => (
                                                        <InputBaseInput {...field}
                                                            type="number"
                                                            value={field.value as number}
                                                            onChange={field.onChange}
                                                        />
                                                    )}
                                                />
                                            </InputBaseControl>
                                        </InputBase>
                                    </ControlGroupItem>
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
                                                <ControlGroupItem className="rounded-md rounded-l-none">
                                                    <SelectTrigger className="w-[150px]">
                                                        <SelectValue placeholder="Currency" />
                                                    </SelectTrigger>
                                                </ControlGroupItem>
                                                <SelectContent align="end">
                                                    <SelectItem value="percent_equity">% of equity</SelectItem>
                                                    <SelectItem value="USDT">USDT</SelectItem>
                                                    <SelectItem value="qty">quantity</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </ControlGroup>
                                <FormMessage className="col-span-2">
                                    {form.formState.errors.start_size?.message}
                                </FormMessage>
                            </div>

                            <FormField
                                control={form.control}
                                name="leverage"
                                render={({ field }) => (
                                    <FormItem className="col-span-full font-normal flex flex-col items-start mb-4">
                                        <FormLabel className="h-9 absolute">Leverage</FormLabel>
                                        <FormControl className="w-full">
                                            <div className="flex flex-col gap-4 items-end">
                                                <InputBase className="gap-0.5 w-16">
                                                    <InputBaseControl>
                                                        <InputBaseInput {...field} className="text-end mx-0"
                                                            type="number"
                                                            value={field.value as number}
                                                            onChange={field.onChange}
                                                            step={5}
                                                        />
                                                    </InputBaseControl>
                                                    <InputBaseAdornment>x</InputBaseAdornment>
                                                </InputBase>
                                                <Slider defaultValue={[25]}
                                                    min={instrumentInfo?.minLeverage}
                                                    max={instrumentInfo?.maxLeverage}
                                                    step={5}
                                                    value={[Number(field.value)]}
                                                    onValueChange={(value) => {
                                                        field.onChange(value[0])
                                                        setTimeout(() => {
                                                            trigger("leverage"); // ✅ run validation after state is updated
                                                        }, 0);
                                                    }}
                                                />
                                            </div>
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
                                            <InputBase>
                                                <InputBaseControl>
                                                    <InputBaseInput {...field}
                                                        type="number"
                                                        value={field.value as number}
                                                        onChange={field.onChange}
                                                        step={0.1}
                                                    />
                                                </InputBaseControl>
                                                <InputBaseAdornment>%</InputBaseAdornment>
                                            </InputBase>
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
                                            <InputBase>
                                                <InputBaseControl>
                                                    <InputBaseInput {...field}
                                                        type="number"
                                                        value={field.value as number}
                                                        onChange={field.onChange}
                                                        step={0.1}
                                                    />
                                                </InputBaseControl>
                                                <InputBaseAdornment>%</InputBaseAdornment>
                                            </InputBase>
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
                                            <InputBase>
                                                <InputBaseControl>
                                                    <InputBaseInput {...field}
                                                        type="number"
                                                        value={field.value as number}
                                                        onChange={field.onChange}
                                                        step={0.1}
                                                    />
                                                </InputBaseControl>
                                                <InputBaseAdornment>%</InputBaseAdornment>
                                            </InputBase>
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

                            <FormField
                                control={form.control}
                                name="average_based"
                                render={({ field }) => (
                                    <FormItem className="font-normal flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value as boolean}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="flex items-center">
                                            Average based rebuy
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="size-4 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-sm">If enabled, rebuy will be calculated based on average entry price.</p>
                                                    <p className="text-sm">If disabled, rebuy will be calculated based on last entry price.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit">Update bot</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}