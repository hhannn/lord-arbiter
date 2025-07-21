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

interface AssetsComboboxProps {
    onSelect?: (value: string) => void;
    initialValue?: string;
}

export function AssetsCombobox({ onSelect, initialValue }: AssetsComboboxProps) {
    const [symbols, setSymbols] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [value, setValue] = useState(initialValue || "");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchSymbols() {
            try {
                const res = await fetch(
                    "https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000"
                );
                const data = await res.json();
                const perpetualSymbols = data.result.list.map(
                    (item: any) => item.symbol
                ).filter((symbol: string | null | undefined) => typeof symbol === 'string' && symbol) as string[];

                const filteredSymbols = perpetualSymbols.filter((symbol: string) => symbol.endsWith('USDT'));
                setSymbols(filteredSymbols);
            } catch (error) {
                console.error("Failed to fetch symbols:", error);
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
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full"
                >
                    {value
                        ? symbols.find((symbol) => symbol === value)
                        : "Select asset"}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
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
                                            const selectedValue =
                                                currentValue === value
                                                    ? ""
                                                    : currentValue;
                                            setValue(selectedValue);
                                            setOpen(false);
                                            onSelect?.(selectedValue);
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
                                        {symbol}
                                    </CommandItem>
                                ))
                            }
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
