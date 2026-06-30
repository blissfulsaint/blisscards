"use client"

import { useCallback, useSyncExternalStore } from 'react'
import type { Theme } from './types'
import { loadTheme, saveTheme, applyTheme } from './storage'

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notify() {
  listeners.forEach(fn => fn())
}

let cachedTheme: Theme = 'system'

function getSnapshot(): Theme {
  return cachedTheme
}

function getServerSnapshot(): Theme {
  return 'system'
}

// Initialize from localStorage on first client import
if (typeof window !== 'undefined') {
  cachedTheme = loadTheme()
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((next: Theme) => {
    cachedTheme = next
    saveTheme(next)
    applyTheme(next)
    notify()
  }, [])

  return { theme, setTheme }
}
