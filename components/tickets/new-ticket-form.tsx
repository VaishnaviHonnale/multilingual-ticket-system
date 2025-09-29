"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"
import { SpeechToTextButton } from "@/components/speech/speech-to-text-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewTicketFormProps {
  userId: string
}

export function NewTicketForm({ userId }: NewTicketFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [category, setCategory] = useState("")
  const [language, setLanguage] = useState("en")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { t, i18n } = useTranslation()

  const handleTitleTranscript = (transcript: string) => {
    setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }

  const handleDescriptionTranscript = (transcript: string) => {
    setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }

  const getSpeechLanguage = (langCode: string) => {
    const languageMap: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      zh: "zh-CN",
    }
    return languageMap[langCode] || "en-US"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("tickets")
        .insert({
          title,
          description,
          priority,
          category: category || null,
          language,
          created_by: userId,
          status: "open",
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: t("common.success"),
        description: t("tickets.ticketCreated"),
      })

      router.push(`/tickets/${data.id}`)
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast({
        title: t("common.error"),
        description: t("tickets.createError", "Failed to create ticket. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">{t("tickets.title")} *</Label>
            <SpeechToTextButton
              onTranscript={handleTitleTranscript}
              language={getSpeechLanguage(language)}
              disabled={isLoading}
            />
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("tickets.titlePlaceholder", "Brief description of the issue")}
            required
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">{t("tickets.description")} *</Label>
            <SpeechToTextButton
              onTranscript={handleDescriptionTranscript}
              language={getSpeechLanguage(language)}
              disabled={isLoading}
            />
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("tickets.descriptionPlaceholder", "Detailed description of the issue")}
            rows={6}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="priority">{t("tickets.priority")}</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder={t("tickets.selectPriority", "Select priority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("priority.low")}</SelectItem>
                <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                <SelectItem value="high">{t("priority.high")}</SelectItem>
                <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">{t("tickets.category")}</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t("tickets.categoryPlaceholder", "e.g., Technical, Billing, General")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="language">{t("tickets.language", "Language")}</Label>
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value)
                // Optionally sync with i18n language
                if (value !== i18n.language) {
                  i18n.changeLanguage(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("tickets.selectLanguage", "Select language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("languages.en")}</SelectItem>
                <SelectItem value="es">{t("languages.es")}</SelectItem>
                <SelectItem value="fr">{t("languages.fr")}</SelectItem>
                <SelectItem value="de">{t("languages.de")}</SelectItem>
                <SelectItem value="zh">{t("languages.zh")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("speech.speechToTextHelp", "Speech-to-Text Help")}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>
              • {t("speech.clickMicrophoneHelp", "Click the microphone button next to title or description fields")}
            </p>
            <p>• {t("speech.speakClearlyHelp", "Speak clearly and pause when finished")}</p>
            <p>
              • {t("speech.languageMatchHelp", "Make sure your speech language matches the selected ticket language")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("common.loading") : t("tickets.createTicket", "Create Ticket")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  )
}
