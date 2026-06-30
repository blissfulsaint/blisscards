import type { Theme } from './types'
import { THEMES } from './types'

const STORAGE_KEY = 'blisscards_theme'

export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && (THEMES as readonly string[]).includes(raw)) {
      return raw as Theme
    }
  } catch {
    // localStorage blocked (private browsing, etc.)
  }
  return 'system'
}

export function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}
