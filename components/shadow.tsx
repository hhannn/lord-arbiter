"use client"

import { useTheme } from "next-themes"
import { EtheralShadow } from "@/components/ui/shadcn-io/etheral-shadow"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ShadowProps {
    color?: string;
}

export const Shadow = ({ color }: ShadowProps) => {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const shadowColor =
        resolvedTheme === "dark"
            ? color ? color : "rgba(50, 50, 50, 1)"
            : "rgba(128, 128, 128, 1)" // or any color you want for light mode

    const opacity = resolvedTheme === "dark" ? 0.8 : 0.2

    return (
        <>
            {mounted && (
                <EtheralShadow
                    color={shadowColor}
                    animation={{ scale: 120, speed: 80 }}
                    noise={{ opacity: opacity, scale: 1 }}
                    sizing="fill"
                    className="h-screen w-full fixed -z-10 right-0"
                />
            )}
        </>
    )
}
