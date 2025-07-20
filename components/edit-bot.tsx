"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AssetsCombobox } from "./assets-combobox";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

type EditBotProps = {
  bot: {
    asset: string;
    start_size: number;
    leverage: number;
    multiplier: number;
    take_profit: number;
    rebuy: number;
  };
  onSubmit?: () => void;
};

export function EditBot({ onSubmit, bot }: EditBotProps) {
  const [asset, setAsset] = useState("");
  const [startSize, setStartSize] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [takeProfit, setTakeProfit] = useState(1);
  const [rebuy, setRebuy] = useState(1);

  useEffect(() => {
    if (bot) {
      setAsset(bot.asset ?? "");
      setStartSize(bot.start_size ?? 0);
      setLeverage(bot.leverage ?? 1);
      setMultiplier(bot.multiplier ?? 1);
      setTakeProfit(bot.take_profit ?? 1);
      setRebuy(bot.rebuy ?? 1);
    }
  }, [bot]);

  const handleSubmit = async () => {
    try {
      const botData = {
        asset,
        start_size: startSize,
        leverage,
        multiplier,
        take_profit: takeProfit,
        rebuy,
      };

      const res = await fetch("/api/bots/edit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(botData),
      });

      if (!res.ok) throw new Error("Failed to edit bot");

      toast.success(`Bot edited.`);
      console.log("✅ Bot edited");

      onSubmit?.();
    } catch (error) {
      toast.error(`Bot edit error.`);
      console.error("❌ Bot edit error:", error);
    }
  };
}
