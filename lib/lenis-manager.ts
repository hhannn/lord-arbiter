// lib/lenis-manager.ts
import Lenis from "lenis"

let lenisInstances: Set<Lenis> = new Set()
let rafId: number | null = null

function raf(time: number) {
  lenisInstances.forEach((lenis) => lenis.raf(time))
  rafId = requestAnimationFrame(raf)
}

export function registerLenis(lenis: Lenis) {
  lenisInstances.add(lenis)
  if (!rafId) rafId = requestAnimationFrame(raf)
}

export function unregisterLenis(lenis: Lenis) {
  lenisInstances.delete(lenis)
  if (lenisInstances.size === 0 && rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}
