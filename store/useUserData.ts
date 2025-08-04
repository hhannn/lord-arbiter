// useUserData.tsx
import { create } from "zustand";
import { throttle } from "lodash";

interface UserDataStore {
    data: any;
    loading: boolean;
    apiKey: string | null;
    apiSecret: string | null;
    userId: number | null;
    username: string | null; // 👈 add
    uid: string | null;
    fetchData: () => void;
    logout: () => void;
}

export const useUserData = create<UserDataStore>((set, get) => {
    const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const API_FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

    const doFetch = async () => {
        set({ loading: true });
        try {
            const res = await fetch(`${API_BACKEND_URL}/api/user/data`, {
                method: "GET",
                credentials: "include", // ✅ Send cookie
            });

            if (!res.ok) {
                throw new Error("Not authenticated");
            }

            const json = await res.json();
            set({ data: json, loading: false });
        } catch (err) {
            console.error("❌ Error fetching user data", err);
            set({ loading: false });
        }
    };

    // ✅ Only define once and reuse
    const throttledFetch = throttle(doFetch, 10000, {
        leading: true,
        trailing: false,
    });

    return {
        data: null,
        loading: false,
        apiKey: null,
        apiSecret: null,
        userId: null,
        username: null,
        uid: null,

        fetchData: throttledFetch, // 👈 exposed as throttled version
        logout: () => {
            localStorage.removeItem("bybit_api_key");
            localStorage.removeItem("bybit_api_secret");
            localStorage.removeItem("user_id");
            set({
                data: null,
                loading: false,
                apiKey: null,
                apiSecret: null,
                userId: null,
            });
        },
    };
});
