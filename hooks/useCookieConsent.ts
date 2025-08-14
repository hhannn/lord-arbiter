import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const COOKIE_KEY = "cookie_consent";

function cookiesEnabled(): boolean {
    try {
        Cookies.set("test_cookie", "1");
        const enabled = Cookies.get("test_cookie") === "1";
        Cookies.remove("test_cookie");
        return enabled;
    } catch {
        return false;
    }
}

function setConsent(value: boolean) {
    if (cookiesEnabled()) {
        Cookies.set(COOKIE_KEY, value ? "1" : "0", {
            expires: 365,
            path: "/",
            sameSite: "Lax",
            secure: window.location.protocol === "https:",
        });
    } else {
        localStorage.setItem(COOKIE_KEY, value ? "1" : "0");
    }
}

function getConsent(): boolean {
    if (cookiesEnabled()) {
        return Cookies.get(COOKIE_KEY) === "1";
    } else {
        return localStorage.getItem(COOKIE_KEY) === "1";
    }
}

export function useCookieConsent() {
    const [consent, setConsentState] = useState<boolean>(false);
    const [checked, setChecked] = useState<boolean>(false);

    useEffect(() => {
        setConsentState(getConsent());
        setChecked(true);
    }, []);

    const acceptConsent = () => {
        setConsent(true);
        setConsentState(true);
    };

    return { consent, checked, acceptConsent };
}
