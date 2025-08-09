import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { AssetsCombobox } from "../assets-combobox";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { CirclePlus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { useBotStore } from "@/store/useBotStore";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ControlGroup,
    ControlGroupItem,
} from "@/components/ui/control-group";
import {
    InputBase,
    InputBaseAdornment,
    InputBaseControl,
    InputBaseInput,
} from "@/components/ui/input-base";
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
                        message: `Minimum notional value is 5 USDT`,
                    })
                }
            }
        });


    const [openForm, setOpenForm] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
                    <Plus />
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
                                            field.onChange(value);
                                            fetchInstrumentInfo(value);
                                            setOpenForm(true);
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
                        <div className={`w-full grid grid-cols-2 items-stretch gap-y-3 gap-x-2 text-sm font-medium ${openForm ? "block" : "hidden"}`}>
                            <FormField
                                control={form.control}
                                name="start_size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start size</FormLabel>
                                        <FormControl>
                                            <ControlGroup>
                                                <ControlGroupItem>
                                                    <InputBase>
                                                        <InputBaseControl>
                                                            <InputBaseInput {...field}
                                                                type="number"
                                                                value={field.value as number}
                                                                onChange={field.onChange}
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
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="leverage"
                                render={({ field }) => (
                                    <FormItem className="font-normal">
                                        <FormLabel>Leverage</FormLabel>
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
                                                <InputBaseAdornment>x</InputBaseAdornment>
                                            </InputBase>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="multiplier"
                                render={({ field }) => (
                                    <FormItem className="font-normal">
                                        <FormLabel>Multiplier</FormLabel>
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
                                                <InputBaseAdornment>x</InputBaseAdornment>
                                            </InputBase>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="take_profit"
                                render={({ field }) => (
                                    <FormItem className="font-normal">
                                        <FormLabel>Take profit</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="rebuy"
                                render={({ field }) => (
                                    <FormItem className="font-normal">
                                        <FormLabel>Rebuy</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="max_rebuy"
                                render={({ field }) => (
                                    <FormItem className="font-normal">
                                        <FormLabel>Max rebuy</FormLabel>
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
            </DialogContent>
        </Dialog >
    )
}