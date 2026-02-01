'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import Cookies from 'js-cookie'

export type Language = 'en' | 'hi' | 'te'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Initialize language from cookie on mount
  useEffect(() => {
    const cookieVal = Cookies.get('googtrans')
    // cookieVal is usually "/en/te" or "/auto/te"
    if (cookieVal) {
      const parts = cookieVal.split('/')
      const targetLang = parts[parts.length - 1] as Language
      if (['en', 'hi', 'te'].includes(targetLang)) {
        setLanguageState(targetLang)
      }
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)

    // Handle Google Translate cookie
    if (lang === 'en') {
      // For English, removing the cookie is the most reliable way to revert
      Cookies.remove('googtrans', { path: '/' })
      Cookies.remove('googtrans', { path: '/', domain: window.location.hostname })
    } else {
      // For other languages, set the translation cookie
      // Format: /source_lang/target_lang
      Cookies.set('googtrans', `/en/${lang}`, { path: '/' })
    }

    // Reload to apply translation
    window.location.reload()
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
