import { create } from 'zustand'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'ai4ms_theme'

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* noop */ }
  return 'dark'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
  } else {
    root.classList.remove('light')
  }
}

interface ThemeState {
  theme: Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getStoredTheme()
  applyTheme(initial)

  return {
    theme: initial,

    toggle: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch { /* noop */ }
      set({ theme: next })
    },
  }
})
