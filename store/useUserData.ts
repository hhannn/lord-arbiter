import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserDataStore {
    data: any;
    loading: boolean;
    userId: number | null;
    username: string | null;
    uid: string | null;
    fetchData: () => void;
    setUserId: (id: number, username: string, uid: string) => void;
    logout: () => void;
    startPolling: () => void;
    stopPolling: () => void;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const useUserData = create<UserDataStore>()(
    persist(
        (set, get) => {
            const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

            return {
                data: null,
                loading: false,
                userId: null,
                username: null,
                uid: null,

                fetchData: async () => {
                    set({ loading: true });
                    try {
                        const res = await fetch(
                            `${API_BACKEND_URL}/api/user/data`,
                            {
                                method: "GET",
                                credentials: "include",
                            }
                        );

                        if (!res.ok) throw new Error("Not authenticated");

                        const json = await res.json();
                        set({ data: { ...json }, loading: false });
                    } catch (err) {
                        console.error("❌ Error fetching user data", err);
                        set({ loading: false });
                    }
                },
                setUserId: (id, username, uid) => {
                    set({
                        userId: id,
                        username,
                        uid,
                    });
                },
                logout: () => {
                    set({
                        data: null,
                        loading: false,
                        userId: null,
                        username: null,
                        uid: null,
                    });
                },
                startPolling: () => {
                    if (pollingInterval) return;
                    get().fetchData(); // initial call
                    pollingInterval = setInterval(() => {
                        get().fetchData();
                    }, 5000);
                },
                stopPolling: () => {
                    if (pollingInterval) {
                        clearInterval(pollingInterval);
                        pollingInterval = null;
                    }
                },
            };
        },
        {
            name: "user-data", // localStorage key
            partialize: (state) => ({
                data: state.data,
                userId: state.userId,
                username: state.username,
                uid: state.uid,
                storage:
                    typeof window !== "undefined"
                        ? createJSONStorage(() => localStorage)
                        : undefined,
            }),
        }
    )
);
