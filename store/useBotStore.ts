// store/useBotStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Bot, CreateBotPayload, instrumentInfo } from "@/types/bot";

import { toast } from "sonner";

interface BotState {
    data: Bot[];
    instrumentInfo: instrumentInfo | null;
    loading: boolean;
    error: string | null;
    fetchBots: () => Promise<void>;
    fetchInstrumentInfo: (payload: string) => Promise<void>;
    resetInstrumentInfo: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    createBot: (payload: CreateBotPayload) => Promise<void>;
    deleteBot: (botId: number) => Promise<void>;
    updateBot: (botId: number, payload: Partial<Bot>) => Promise<void>;
    startBot: (botId: number) => Promise<void>;
    stopBot: (botId: number) => Promise<void>;
}

const BYBIT_URL = "https://api.bybit.com";
const API_FRONTEND_URL =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

let pollingInterval: NodeJS.Timeout | null = null;

export const useBotStore = create<BotState>()(
    persist(
        (set, get) => ({
            data: [],
            instrumentInfo: null,
            loading: false,
            error: null,

            fetchBots: async () => {
                try {
                    set({ loading: true });
                    const res = await fetch(
                        `${API_BACKEND_URL}/api/user/bots`,
                        {
                            method: "POST",
                            credentials: "include",
                        }
                    );

                    if (!res.ok) throw new Error("Failed to fetch bots");

                    const bots = await res.json();

                    const updates = await Promise.all(
                        bots
                            .filter(
                                (bot: any) =>
                                    bot.status?.toLowerCase() === "running"
                            )
                            .map(async (bot: any) => {
                                try {
                                    const positionRes = await fetch(
                                        `${API_BACKEND_URL}/api/bot/position`,
                                        {
                                            method: "POST",
                                            credentials: "include",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                asset: bot.asset,
                                            }),
                                        }
                                    );

                                    if (!positionRes.ok) return null;
                                    const data = await positionRes.json();

                                    return {
                                        id: bot.id,
                                        current_position: Number(
                                            data.size || 0
                                        ),
                                        unrealized_pnl: Number(
                                            data.unrealizedPnL || 0
                                        ),
                                        liq_price: Number(data.liqPrice || 0),
                                        current_price: Number(
                                            data.markPrice || 0
                                        ),
                                        take_profit_price: Number(
                                            data.takeProfit || 0
                                        ),
                                        side: String(data.side || 0),
                                        position_value: Number(
                                            data.positionValue || 0
                                        ),
                                    };
                                } catch (err) {
                                    console.error("Position fetch error", err);
                                    return null;
                                }
                            })
                    );

                    const updatedBots = bots.map((bot: any) => {
                        const update = updates.find((u) => u?.id === bot.id);
                        return update ? { ...bot, ...update } : bot;
                    });

                    set({ data: updatedBots, loading: false });
                } catch (err) {
                    set({ loading: false, error: "Failed to fetch bots" });
                }
            },

            fetchInstrumentInfo: async (payload: string) => {
                const res = await fetch(
                    `${BYBIT_URL}/v5/market/instruments-info?category=linear&symbol=${payload}`,
                    {
                        method: "GET",
                    }
                );

                if (!res.ok) {
                    toast.error("Failed to fetch instrument info", {
                        description: "Unexpected error occurred",
                    });
                }

                const data = await res.json();
                const symbolInfo = data?.result?.list?.[0];
                if (!symbolInfo) {
                    toast.error("Symbol info not found in response");
                    return;
                }
                const lotSizeFilter = symbolInfo?.lotSizeFilter;
                const leverageFilter = symbolInfo?.leverageFilter;
                const minQty = Number(lotSizeFilter?.minOrderQty);
                const qtyStep = Number(lotSizeFilter?.qtyStep);
                const minValue = Number(lotSizeFilter?.minNotionalValue);
                const minLeverage = Number(leverageFilter?.minLeverage);
                const maxLeverage = Number(leverageFilter?.maxLeverage);
                console.log(minQty, qtyStep, minValue);
                set({ instrumentInfo: { minQty, qtyStep, minValue, minLeverage, maxLeverage } });
            },

            resetInstrumentInfo: () => set({ instrumentInfo: null }),

            startPolling: () => {
                if (pollingInterval) return;
                get().fetchBots(); // initial call

                pollingInterval = setInterval(() => {
                    get().fetchBots();
                    // console.log(get().data);
                }, 5000);
            },

            stopPolling: () => {
                if (pollingInterval) clearInterval(pollingInterval);
                pollingInterval = null;
            },

            // -- Create bot handler -- //
            createBot: async (payload) => {
                try {
                    const res = await fetch(
                        `${API_BACKEND_URL}/api/bots/create`,
                        {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        }
                    );

                    const result = await res.json();

                    if (!res.ok) {
                        toast.error("Failed to create bot", {
                            description:
                                typeof result === "object" && result.detail
                                    ? result.detail
                                    : "Unexpected error occurred",
                        });
                        return;
                    }

                    toast.success(`Bot created for ${payload.asset}`, {
                        description: new Date().toLocaleDateString(),
                    });

                    get().fetchBots(); // Refresh after create
                } catch (error) {
                    console.error("Create bot error:", error);
                    toast.error("An error occurred while creating the bot.");
                }
            },

            // -- Delete bot handler -- //
            deleteBot: async (botId) => {
                toast(`Deleting bot ${botId}...`);
                try {
                    const res = await fetch(
                        `${API_BACKEND_URL}/api/bots/delete/${botId}`,
                        {
                            method: "DELETE", // Use DELETE method for deletion
                            credentials: "include",
                        }
                    );

                    if (!res.ok) {
                        const errorData = await res.json();
                        console.error("❌ Failed to delete bot", errorData);
                        toast.error("❌ Failed to delete bot", {
                            description:
                                errorData?.detail ||
                                "Unexpected error occurred",
                        });
                    } else {
                        toast.success(`Bot ${botId} has been deleted.`);
                        get().fetchBots();
                    }
                } catch (e) {
                    console.error("❌ Delete error:", e);
                    toast.error("An error occurred while deleting the bot.");
                }
            },

            updateBot: async (botId, payload) => {
                toast(`Updating bot ${botId}...`);
                try {
                    const res = await fetch(
                        `${API_BACKEND_URL}/api/bots/edit/${botId}`,
                        {
                            method: "PUT", // Or PATCH, depending on your API
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        }
                    );

                    const responseData = await res.json();

                    if (!res.ok) {
                        console.error("❌ Failed to update bot", responseData);
                        toast.error("Failed to update bot", {
                            description:
                                typeof responseData === "object" &&
                                responseData?.detail
                                    ? responseData.detail
                                    : "Unexpected error occurred",
                        });
                        throw new Error(
                            responseData?.detail || "Failed to update bot"
                        ); // Propagate error for catch block in BotActionButtons
                    } else {
                        console.log("✅ Bot updated:", responseData);
                        toast.success(`Bot ${botId} has been updated.`);
                    }
                } catch (error) {
                    console.error("❌ Error updating bot:", error);
                    toast.error("An error occurred while updating the bot.");
                    // Re-throw the error so BotActionButtons can catch it if needed (e.g., to prevent dialog close)
                    throw error;
                }
            },

            startBot: async (botId) => {
                toast(`Starting bot ${botId}.`);
                const res = await fetch(
                    `${API_BACKEND_URL}/api/bots/start/${botId}`,
                    {
                        method: "POST",
                    }
                );

                if (res.ok) {
                    toast.success(`🚀 Started bot ${botId}`);
                    get().fetchBots();
                } else {
                    const errorData = await res.json();
                    toast.error("❌ Failed to start bot", {
                        description:
                            errorData?.detail || "Unexpected error occurred",
                    });
                }
            },

            stopBot: async (botId) => {
                try {
                    const res = await fetch(
                        `${API_BACKEND_URL}/api/bots/stop/${botId}`,
                        {
                            method: "POST",
                        }
                    );

                    if (res.ok) {
                        toast.info(`🛑 Stopping ${botId}...`);
                        get().fetchBots();
                    } else {
                        const errorData = await res.json();
                        toast.error("❌ Failed to stop bot", {
                            description:
                                errorData?.detail ||
                                "Unexpected error occurred",
                        });
                    }
                } catch (e) {
                    console.error("❌ Stop error:", e);
                    toast.error("An error occurred while stopping the bot.");
                }
            },
        }),
        {
            name: "bot-storage", // localStorage key
            partialize: (state) => ({ data: state.data }), // only persist bot data
        }
    )
);
