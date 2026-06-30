export const THEMES = ['system', 'light', 'dark', 'ocean', 'rose'] as const
export type Theme = (typeof THEMES)[number]

export const THEME_LABELS: Record<Theme, string> = {
  system: 'System (auto)',
  light:  'Light',
  dark:   'Dark',
  ocean:  'Ocean',
  rose:   'Rose',
}
