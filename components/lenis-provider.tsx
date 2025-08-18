"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import Lenis from "lenis"
import { registerLenis, unregisterLenis } from "@/lib/lenis-manager"

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
    return useContext(LenisContext)
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        const lenis = new Lenis({ smoothWheel: true })
        lenisRef.current = lenis
        registerLenis(lenis)

        return () => {
            unregisterLenis(lenis)
            lenis.destroy()
        }
    }, [])

    return (
        <LenisContext.Provider value={lenisRef.current}>
            {children}
        </LenisContext.Provider>
    )
}
