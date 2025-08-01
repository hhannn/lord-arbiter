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
    setKeys: (apiKey: string, apiSecret: string) => void;
    setUserId: (id: number, username: string, uid: string) => void;
    restoreFromStorage: () => void;
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
                throw new Error("Failed to fetch");
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
        setKeys: (apiKey, apiSecret) => {
            localStorage.setItem("bybit_api_key", apiKey);
            localStorage.setItem("bybit_api_secret", apiSecret);
            set({ apiKey, apiSecret });
        },
        setUserId: (id, username, uid) => {
            localStorage.setItem("user_id", String(id));
            localStorage.setItem("username", username);
            localStorage.setItem("uid", uid);
            set({ userId: id, username, uid });
        },
        restoreFromStorage: (): void => {
            const apiKey = localStorage.getItem("bybit_api_key");
            const apiSecret = localStorage.getItem("bybit_api_secret");
            const userId = localStorage.getItem("user_id");
            const username = localStorage.getItem("username");
            const uid = localStorage.getItem("uid");

            if (apiKey && apiSecret && userId) {
                set({
                    apiKey,
                    apiSecret,
                    userId: parseInt(userId),
                    username,
                    uid,
                });
            }
        },
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
