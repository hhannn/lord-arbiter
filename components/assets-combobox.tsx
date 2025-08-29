"use client";

import * as React from "react";
import { useState, useEffect } from "react";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";

interface AssetsComboboxProps {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    initialValue?: string;
}

interface InstrumentInfo {
    category: string;
    symbol: string;
    minQty: number;
    qtyStep: number;
    minValue: number;
    minLeverage: number;
    maxLeverage: number;
}

export function AssetsCombobox({ value, onChange, error, initialValue }: AssetsComboboxProps) {
    const [symbols, setSymbols] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchSymbols() {
            try {
                const res = await fetch("/api/market/instrument-info", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                const perpetualSymbols = data.result.list.map(
                    (item: any) => item.symbol
                ).filter((symbol: string | null | undefined) => typeof symbol === 'string' && symbol) as string[];

                const filteredSymbols = perpetualSymbols.filter((symbol: string) => symbol.endsWith('USDT'));
                setSymbols(filteredSymbols);
            } catch (error) {
                toast.error("Failed to fetch symbols");
            } finally {
                setLoading(false);
            }
        }
        fetchSymbols();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="w-full">
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full"
                >
                    {(() => {
                        const selectedSymbol = symbols.find((s) => s === value) ?? (initialValue ? symbols.find((s) => s === initialValue) : null);

                        if (!selectedSymbol) return "Select asset";
                        const getLogoSuffix = (sym: string) => sym === "HYPEUSDT" ? "HYPEH" : sym.replace("USDT", "");

                        return (
                            <>
                                <div className="flex gap-2 items-center">
                                    <Avatar className="size-4">
                                        <AvatarImage
                                            src={`https://s3-symbol-logo.tradingview.com/crypto/XTVC${getLogoSuffix(selectedSymbol)}.svg`}
                                            alt={selectedSymbol}
                                        />
                                        <AvatarFallback>{selectedSymbol.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {selectedSymbol}
                                </div>
                            </>
                        );
                    })()}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[29rem] p-0">
                <Command value="">
                    <CommandInput placeholder="Search asset..." />
                    <CommandList>
                        {loading ? (
                            <CommandEmpty>Loading assets...</CommandEmpty>
                        ) : (
                            <CommandEmpty>No asset found.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {
                                symbols.map((symbol) => (
                                    <CommandItem
                                        key={symbol}
                                        value={symbol}
                                        onSelect={(currentValue) => {
                                            const selectedValue = currentValue === value ? "" : currentValue;
                                            onChange?.(selectedValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === symbol
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        <Avatar className="size-6">
                                            <AvatarImage
                                                src={`https://s3-symbol-logo.tradingview.com/crypto/XTVC${symbol === "HYPEUSDT" ? "HYPEH" :
                                                    symbol.replace("USDT", "")
                                                    }.svg`}
                                                alt={symbol}
                                            />
                                            <AvatarFallback>
                                                {symbol.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {symbol}
                                    </CommandItem>
                                ))
                            }
                        </CommandGroup>
                    </CommandList>
                </Command>
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </PopoverContent>
        </Popover>
    );
}
