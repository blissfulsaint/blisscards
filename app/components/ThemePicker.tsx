"use client"

import { useTheme } from "@/app/lib/theme/useTheme"
import { THEMES, THEME_LABELS } from "@/app/lib/theme/types"
import type { Theme } from "@/app/lib/theme/types"

export function ThemePicker() {
  const { theme, setTheme } = useTheme()

  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-muted">Theme</span>
      <select
        aria-label="Color theme"
        value={theme}
        onChange={e => setTheme(e.target.value as Theme)}
        className="border rounded px-2 py-1 bg-bg text-fg appearance-none cursor-pointer"
      >
        {THEMES.map(t => (
          <option key={t} value={t}>{THEME_LABELS[t]}</option>
        ))}
      </select>
    </label>
  )
}
