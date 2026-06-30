export const THEMES = ['system', 'light', 'dark', 'ocean', 'rose', 'forest', 'grape', 'crimson', 'sunset', 'sky', 'sakura'] as const
export type Theme = (typeof THEMES)[number]

export const THEME_LABELS: Record<Theme, string> = {
  system:  'System (auto)',
  light:   'Light',
  dark:    'Dark',
  ocean:   'Ocean',
  rose:    'Rose',
  forest:  'Forest',
  grape:   'Grape',
  crimson: 'Crimson',
  sunset:  'Sunset',
  sky:     'Sky',
  sakura:  'Sakura',
}
