import { ref, onMounted } from 'vue'

/**
 * Dark mode composable
 * Supports: system preference, manual toggle, localStorage persistence
 */
export function useDarkMode() {
  const isDark = ref(false)
  const mode = ref('system') // 'system' | 'light' | 'dark'
  
  const applyTheme = (dark) => {
    isDark.value = dark
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }
  
  const setMode = (newMode) => {
    mode.value = newMode
    localStorage.setItem('theme', newMode)
    
    if (newMode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(systemDark)
    } else {
      applyTheme(newMode === 'dark')
    }
  }
  
  const toggle = () => {
    const newMode = isDark.value ? 'light' : 'dark'
    setMode(newMode)
  }
  
  onMounted(() => {
    const saved = localStorage.getItem('theme') || 'system'
    setMode(saved)
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (mode.value === 'system') {
        applyTheme(e.matches)
      }
    })
  })
  
  return { isDark, mode, setMode, toggle }
}
