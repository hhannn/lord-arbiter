import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { InputBase, InputBaseAdornment, InputBaseControl, InputBaseInput } from "../ui/input-base";
import { Button } from "../ui/button";
import { ArrowDownUp, ArrowLeftRight } from "lucide-react";
import { useUserData } from "@/store/useUserData";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface TransferDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children?: React.ReactNode
}

export function TransferDialog({ open, onOpenChange }: TransferDialogProps) {
    const { withdrawableBalance, fetchWithdrawableBalance, transfer } = useUserData();

    const UTABalance = useMemo(() => {
        return withdrawableBalance !== null ?
            Number(withdrawableBalance.UTA) : "0"
    }, [withdrawableBalance]);
    const FUNDBalance = useMemo(() => {
        return withdrawableBalance !== null ?
            Number(withdrawableBalance.FUND) : "0"
    }, [withdrawableBalance]);

    useEffect(() => {
        fetchWithdrawableBalance();
        reset();
    }, [open]);

    const zodSchema = useMemo(() => z.object({
        amount: z.coerce.number().min(0.01, "Must be at least 0.01"),
        from: z.string(),
        to: z.string()
    }).superRefine((data, ctx) => {
        const max = data.from === "UNIFIED" ? UTABalance : FUNDBalance;
        if (data.amount > Number(UTABalance)) {
            ctx.addIssue({
                code: "too_big",
                origin: "number",
                maximum: Number(max),
                inclusive: true,
                message: `Cannot exceed ${max} USDT`,
                path: ["amount"],
                input: data.amount
            });
        }
    }), [open]);

    const form = useForm({
        resolver: zodResolver(zodSchema),
        defaultValues: {
            amount: 0.0,
            from: "UNIFIED",
            to: "FUND"
        },
        mode: "onChange"
    });

    const reset = () => {
        form.reset({
            amount: 0.0,
            from: "UNIFIED",
            to: "FUND"
        });
    }

    function onSubmit(values: z.infer<typeof zodSchema>) {
        const amount = values.amount;
        const fromAccount = values.from;
        const toAccount = values.to;
        transfer({ amount, fromAccount, toAccount });
    }


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader className="pb-0">
                    <SheetTitle>Transfer</SheetTitle>
                    <SheetDescription>Transfer funds to another account</SheetDescription>
                </SheetHeader>
                <Separator />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="px-6 flex flex-col gap-4">
                            <div className="flex gap-4 items-stretch justify-between px-4 border rounded-lg">
                                <div className="flex-1 flex flex-col gap-1.5 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">From:</div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <div>{form.watch("from") === "UNIFIED" ? "UTA" : "Funding"}</div>
                                        <div className="text-sm text-muted-foreground">{form.watch("from") === "UNIFIED" ? UTABalance : FUNDBalance} USDT</div>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-end">
                                    <Separator className="absolute inset-x-0 mx-auto my-4" orientation="vertical" />
                                    <Controller
                                        name="from"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Button className="relative bg-background hover:backdrop-blur-sm"
                                                variant="outline"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const newFrom = field.value === "UNIFIED" ? "FUND" : "UNIFIED";
                                                    field.onChange(newFrom);
                                                    form.setValue("to", newFrom === "UNIFIED" ? "FUND" : "UNIFIED");
                                                }}
                                            >
                                                <ArrowLeftRight />
                                            </Button>
                                        )}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">To:</div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <div>{form.watch("to") === "UNIFIED" ? "UTA" : "Funding"}</div>
                                        <div className="text-sm text-muted-foreground">{form.watch("to") === "UNIFIED" ? UTABalance : FUNDBalance} USDT</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <InputBase>
                                                    <InputBaseControl>
                                                        <InputBaseInput
                                                            type="number" {...field} value={field.value as number | string}
                                                            max={form.watch("from") === "UNIFIED" ? UTABalance : FUNDBalance}
                                                        />
                                                    </InputBaseControl>
                                                    <InputBaseAdornment>
                                                        <Button className="px-2 h-6 text-foreground"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const maxValue = form.watch("from") === "UNIFIED" ? Number(UTABalance) : Number(FUNDBalance);

                                                                form.setValue("amount", maxValue, { shouldValidate: true });
                                                            }}
                                                        >
                                                            Max
                                                        </Button>
                                                    </InputBaseAdornment>
                                                    <InputBaseAdornment>USDT</InputBaseAdornment>
                                                </InputBase>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit"
                                disabled={form.formState.isSubmitting || !form.formState.isValid}
                                onClick={() => {
                                    const to = setTimeout(() => {
                                        fetchWithdrawableBalance();
                                    }, 500);
                                    return () => clearTimeout(to);
                                }}>
                                Transfer
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet >
    )
}