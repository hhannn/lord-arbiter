// store/useBotStore.ts
import { create } from "zustand";
import { Bot } from "@/types/bot";

interface BotState {
    data: Bot[];
    loading: boolean;
    error: string | null;
    fetchBots: () => Promise<void>;
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const useBotStore = create<BotState>((set) => ({
    data: [],
    loading: false,
    error: null,
    fetchBots: async () => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/bots`);

            if (!res.ok) throw new Error("Failed to fetch bots");
            
            const json = await res.json();
            set({ data: json, loading: false });
            // console.log(json)
        } catch (e) {
            // console.error("❌ Failed to fetch bots", e);
            set({ loading: false, error: (e as Error).message });
        }
    },
}));
