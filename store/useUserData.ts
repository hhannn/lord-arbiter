import { TransferPayload } from "@/types/bot";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserDataStore {
    data: any;
    withdrawableBalance: any;
    loading: boolean;
    userId: number | null;
    username: string | null;
    uid: string | null;
    joinDate: string | null;
    fetchData: () => void;
    fetchWithdrawableBalance: () => void;
    transfer: (payload: TransferPayload) => void;
    setUserId: (id: number, username: string, uid: string, joinDate: string) => void;
    logout: () => void;
    startPolling: () => void;
    stopPolling: () => void;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const useUserData = create<UserDataStore>()(
    persist(
        (set, get) => {
            return {
                data: null,
                withdrawableBalance: null,
                loading: false,
                userId: null,
                username: null,
                uid: null,
                joinDate: null,

                fetchData: async () => {
                    set({ loading: true });
                    try {
                        const res = await fetch(`/api/user/data`, {
                            method: "GET",
                            credentials: "include",
                        });

                        if (!res.ok) throw new Error("Not authenticated");

                        const json = await res.json();
                        set({ data: { ...json }, loading: false });
                    } catch (err) {
                        console.error("❌ Error fetching user data", err);
                        set({ loading: false });
                    }
                },

                fetchWithdrawableBalance: async () => {
                    set({ loading: true });
                    try {
                        const res = await fetch(
                            `/api/user/withdrawable_balance`,
                            {
                                method: "GET",
                                credentials: "include",
                            }
                        );

                        if (!res.ok) throw new Error("Not authenticated");

                        const json = await res.json();
                        const withdrawableBalance = {
                            UTA: json.result.withdrawableAmount.UTA
                                .withdrawableAmount,
                            FUND: json.result.withdrawableAmount.FUND
                                .withdrawableAmount,
                        };
                        console.log(withdrawableBalance);
                        set({
                            withdrawableBalance: withdrawableBalance,
                            loading: false,
                        });
                    } catch (err) {
                        console.error("❌ Error fetching user data", err);
                        set({ loading: false });
                    }
                },

                setUserId: (userId, username, uid, joinDate) => {
                    set({
                        userId: userId,
                        username,
                        uid,
                        joinDate,
                    });
                },

                logout: async () => {
                    try {
                        await fetch(`/api/user/logout`, {
                            method: "POST",
                            credentials: "include",
                        });
                    } catch (e) {
                        toast.error("Failed to logout", {
                            description: "Unexpected error occurred",
                        });
                        console.error("❌ Error logging out", e);
                    }

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
                        if (document.visibilityState === "visible") {
                            get().fetchData();
                        } else {
                            console.log("page inactive");
                        }
                    }, 5000);
                },

                stopPolling: () => {
                    if (pollingInterval) {
                        clearInterval(pollingInterval);
                        pollingInterval = null;
                    }
                },

                transfer: async (payload) => {
                    try {
                        await fetch(`/api/user/transfer`, {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        });

                        toast.success(
                            `Transferred 1 USDT from ${payload.fromAccount} to ${payload.toAccount}.`
                        );
                    } catch (e) {
                        toast.error("Failed to transfer", {
                            description: "Unexpected error occurred",
                        });
                        console.error("❌ Error transferring", e);
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
                joinDate: state.joinDate,
                storage:
                    typeof window !== "undefined"
                        ? createJSONStorage(() => localStorage)
                        : undefined,
            }),
        }
    )
);
