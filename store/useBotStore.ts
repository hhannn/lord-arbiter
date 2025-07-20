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
            const user_id = localStorage.getItem("user_id");

            if (!user_id) {
                throw new Error("Missing user_id");
            }

            const res = await fetch(`/api/bots?user_id=${user_id}`);
            console.log("Raw API response for bots:", res);

            if (!res.ok) throw new Error("Failed to fetch bots");

            const json = await res.json();
            set({ data: json, loading: false });
        } catch (e) {
            set({ loading: false, error: (e as Error).message });
        }
    },
}));
