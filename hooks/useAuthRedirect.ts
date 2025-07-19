// hooks/useAuthRedirect.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect() {
    const router = useRouter();

    const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const API_FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch(`${API_BACKEND_URL}/api/user/data`, {
                credentials: "include",
            });
            if (res.status === 401) {
                router.push("/login");
            }
        };

        checkAuth();
    }, []);
}
