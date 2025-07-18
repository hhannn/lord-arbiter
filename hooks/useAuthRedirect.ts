// hooks/useAuthRedirect.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect() {
    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            router.replace("/login"); // 👈 redirect to login
        }
    }, []);
}
