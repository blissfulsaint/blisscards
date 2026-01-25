"use client"

import { useSyncExternalStore } from "react"

// Subscribe to the moment hydration is complete.
function subscribe(callback: () => void) {
  // If we're not in a browser, no-op.
  if (typeof window === "undefined") return () => {}

  // Fire callback on next microtask after hydration.
  // This makes the first client render match the server, then updates right after.
  const id = queueMicrotask(callback)

  // queueMicrotask returns void, so just provide an unsubscribe no-op
  return () => {
    // nothing to clean up
  }
}

function getSnapshot() {
  // After hydration, we consider ourselves "mounted"
  return true
}

function getServerSnapshot() {
  // On the server we must return a stable value
  return false
}

export function useMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}