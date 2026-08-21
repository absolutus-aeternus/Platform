import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import id from './locales/id.json'
import zh from './locales/zh.json'
import ar from './locales/ar.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ms from './locales/ms.json'
import th from './locales/th.json'
import vi from './locales/vi.json'

const messages = { en, id, zh, ar, ja, ko, ms, th, vi }

// Detect browser language or use stored preference
const getDefaultLocale = () => {
  try {
    const stored = localStorage.getItem('locale')
    if (stored && messages[stored]) return stored
  } catch (e) { /* localStorage unavailable */ }
  try {
    const browser = navigator.language.split('-')[0]
    return messages[browser] ? browser : 'en'
  } catch { return 'en' }
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages,
  missing: (locale, key) => {
    // Fallback to English if key missing
    const fallback = messages.en
    const keys = key.split('.')
    let result = fallback
    for (const k of keys) {
      result = result?.[k]
    }
    return result || key
  }
})

export default i18n

// Available languages
export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'zh', name: '中文简体', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
]
