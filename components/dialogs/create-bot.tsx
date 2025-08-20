import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { AssetsCombobox } from "../assets-combobox";
import { Input } from "../ui/input";

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Switch } from "../ui/switch";
import { Shadow } from "../shadow";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Info, Plus } from "lucide-react";
import { start } from "repl";

interface CreateBotDialogProps {
    asset?: string
    startType?: "USDT" | "percent_equity" | "qty"
    startSize?: number
    multiplier?: number
    takeProfit?: number
    rebuy?: number
    maxRebuy?: number
    resonance?: string
    averageBased?: boolean
    children?: React.ReactNode
}

export function CreateBotDialog({ asset, startType, startSize, multiplier, takeProfit, rebuy, maxRebuy, averageBased, children }: CreateBotDialogProps) {

    const { createBot, instrumentInfo, fetchInstrumentInfo } = useBotStore();
    const [switched, setSwitched] = useState(false);

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
        average_based: z.coerce.boolean()
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

    const [openForm, setOpenForm] = useState(asset ? true : false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asset: asset ? asset : "",
            start_type: startType ? startType : "percent_equity",
            start_size: startSize ? startSize : instrumentInfo?.minQty ?? 1,
            leverage: 1,
            multiplier: multiplier || 1,
            take_profit: takeProfit || 1,
            rebuy: rebuy || 1,
            max_rebuy: maxRebuy || 1,
            average_based: averageBased || false
        },
        mode: "onBlur",
        reValidateMode: "onBlur"
    })

    const { reset, trigger } = form;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.

        if (values.asset === "FARTCOINUSDT" && switched) {
            await createBot({
                asset: values.asset,
                start_size: values.start_size,
                leverage: 25,
                multiplier: 1,
                take_profit: 1.2,
                rebuy: 6,
                max_rebuy: 10,
                start_type: values.start_type,
                resonance: "A018123",
                average_based: false
            });
        } else {
            await createBot({
                asset: values.asset,
                start_size: values.start_size,
                leverage: values.leverage,
                multiplier: values.multiplier,
                take_profit: values.take_profit,
                rebuy: values.rebuy,
                max_rebuy: values.max_rebuy,
                start_type: values.start_type,
                resonance: null,
                average_based: values.average_based ? true : false
            });
        }

        setOpenForm(false);
        setCreateDialogOpen(false);
        console.log(values)
        reset();
    }

    return (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} >
            <DialogTrigger asChild>
                {children ? children :
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
                }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className="flex flex-col">
                    <DialogTitle className="text-2xl">
                        Create new bot
                    </DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        A journey of a thousand miles begins with a single step.
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
                            </div>
                        </div>
                        <div className={
                            `${!openForm ? "hidden" :
                                form.getValues("asset") === "FARTCOINUSDT" ? "flex" :
                                    "hidden"
                            } w-full flex justify-between items-center gap-4 p-4 border border-b-border rounded-md relative overflow-hidden`
                        }>
                            <div className="absolute left-0 top-0 w-full h-full"><Shadow /></div>
                            <div className="space-y-1 relative">
                                <div className="text-base font-medium">
                                    Forte circuit
                                </div>
                                <div className="text-sm font-base text-muted-foreground">
                                    If enabled, special parameters will be used for this bot.
                                </div>
                            </div>
                            <Switch className={`cursor-pointer relative`}
                                checked={switched}
                                onCheckedChange={() => setSwitched(!switched)}>
                            </Switch>
                        </div>
                        {!switched ?
                            <div className={`w-full grid grid-cols-2 items-stretch gap-y-3 gap-x-2 text-sm ${openForm ? "block" : "hidden"}`}>
                                <FormField
                                    control={form.control}
                                    name="start_size"
                                    render={({ field }) => (
                                        <FormItem className="col-span-full">
                                            <FormLabel>Start size</FormLabel>
                                            <FormControl>
                                                <ControlGroup>
                                                    <ControlGroupItem>
                                                        <InputBase className="w-full">
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
                                        <FormItem className="col-span-2 font-normal flex flex-col items-start">
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
                                <Separator className="col-span-2 my-2" />

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
                            :
                            <FormField
                                control={form.control}
                                name="start_size"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Start size</FormLabel>
                                        <FormControl>
                                            <ControlGroup>
                                                <ControlGroupItem>
                                                    <InputBase className="w-full">
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
                        }
                        <Button className={openForm ? "block" : "hidden"} type="submit">Create bot</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}