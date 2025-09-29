"use client"

import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n/config"

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18n on client side
    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage)
    }
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}