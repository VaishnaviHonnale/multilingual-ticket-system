"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import { useTranslation } from "react-i18next"

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" }
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en")

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    i18n.changeLanguage(languageCode)
    
    // Store preference in localStorage
    localStorage.setItem("preferred-language", languageCode)
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto min-w-[120px]">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            <span className="hidden sm:inline">{currentLang.nativeName}</span>
            <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.nativeName}</span>
              <span className="text-muted-foreground text-sm">({language.name})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}