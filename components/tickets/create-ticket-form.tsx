"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { SpeechToText } from "@/components/speech/speech-to-text"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent", "critical"]),
  category: z.enum(["technical", "billing", "general", "feature", "bug", "support", "other"]).optional(),
  language: z.string().default("en")
})

type TicketFormData = z.infer<typeof ticketSchema>

interface CreateTicketFormProps {
  onSuccess?: (ticket: any) => void
  className?: string
}

export function CreateTicketForm({ onSuccess, className }: CreateTicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClassifying, setIsClassifying] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      language: i18n.language || "en"
    }
  })

  const handleVoiceTranscript = (text: string, field: "title" | "description") => {
    const currentValue = form.getValues(field)
    const newValue = currentValue ? `${currentValue} ${text}` : text
    form.setValue(field, newValue)
    
    // Auto-classify if we have both title and description
    if (form.getValues("title") && form.getValues("description")) {
      classifyTicket()
    }
  }

  const classifyTicket = async () => {
    const title = form.getValues("title")
    const description = form.getValues("description")
    
    if (!title || !description) return

    setIsClassifying(true)
    try {
      const response = await fetch("/api/tickets/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          language: form.getValues("language")
        })
      })

      if (response.ok) {
        const classification = await response.json()
        setAiSuggestions(classification)
        
        // Auto-fill suggested values
        if (classification.priority) {
          form.setValue("priority", classification.priority)
        }
        if (classification.category) {
          form.setValue("category", classification.category)
        }
        
        toast.success(t("tickets.classified", "Ticket classified by AI"))
      }
    } catch (error) {
      console.error("Classification error:", error)
    } finally {
      setIsClassifying(false)
    }
  }

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error(t("auth.required", "Please sign in to create a ticket"))
        router.push("/auth/login")
        return
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error("Failed to create ticket")
      }

      const ticket = await response.json()
      toast.success(t("tickets.created", "Ticket created successfully"))
      
      form.reset()
      setAiSuggestions(null)
      
      if (onSuccess) {
        onSuccess(ticket)
      } else {
        router.push(`/tickets/${ticket.id}`)
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast.error(t("tickets.createError", "Failed to create ticket"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          {t("tickets.createNew", "Create New Ticket")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Language Selection */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tickets.language", "Language")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("tickets.selectLanguage", "Select language")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Field with Voice Input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tickets.title", "Title")}</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder={t("tickets.titlePlaceholder", "Brief description of your issue")}
                        {...field}
                      />
                      <SpeechToText
                        onTranscript={(text) => handleVoiceTranscript(text, "title")}
                        language={form.getValues("language")}
                        placeholder={t("speech.titleHint", "Click to add title via voice")}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field with Voice Input */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tickets.description", "Description")}</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea
                        placeholder={t("tickets.descriptionPlaceholder", "Detailed description of your issue")}
                        className="min-h-[100px]"
                        {...field}
                      />
                      <SpeechToText
                        onTranscript={(text) => handleVoiceTranscript(text, "description")}
                        language={form.getValues("language")}
                        placeholder={t("speech.descriptionHint", "Click to add description via voice")}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI Classification Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={classifyTicket}
                disabled={isClassifying || !form.getValues("title") || !form.getValues("description")}
                className="flex items-center gap-2"
              >
                {isClassifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t("tickets.classify", "AI Classify")}
              </Button>
              
              {aiSuggestions && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {t("ai.confidence", "Confidence")}: {Math.round((aiSuggestions.confidence || 0) * 100)}%
                  </Badge>
                  {aiSuggestions.suggested_tags && (
                    <div className="flex gap-1">
                      {aiSuggestions.suggested_tags.slice(0, 2).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Priority Selection */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tickets.priority", "Priority")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("tickets.selectPriority", "Select priority")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">{t("priority.low", "Low")}</SelectItem>
                      <SelectItem value="medium">{t("priority.medium", "Medium")}</SelectItem>
                      <SelectItem value="high">{t("priority.high", "High")}</SelectItem>
                      <SelectItem value="urgent">{t("priority.urgent", "Urgent")}</SelectItem>
                      <SelectItem value="critical">{t("priority.critical", "Critical")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tickets.category", "Category")} ({t("optional", "Optional")})</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("tickets.selectCategory", "Select category")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical">{t("category.technical", "Technical")}</SelectItem>
                      <SelectItem value="billing">{t("category.billing", "Billing")}</SelectItem>
                      <SelectItem value="general">{t("category.general", "General")}</SelectItem>
                      <SelectItem value="feature">{t("category.feature", "Feature Request")}</SelectItem>
                      <SelectItem value="bug">{t("category.bug", "Bug Report")}</SelectItem>
                      <SelectItem value="support">{t("category.support", "Support")}</SelectItem>
                      <SelectItem value="other">{t("category.other", "Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI Suggestions Display */}
            {aiSuggestions && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t("ai.suggestions", "AI Suggestions")}
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>{t("ai.reasoning", "Reasoning")}:</strong> {aiSuggestions.reasoning}</p>
                  <p><strong>{t("ai.sentiment", "Sentiment")}:</strong> {aiSuggestions.sentiment}</p>
                  <p><strong>{t("ai.urgencyScore", "Urgency Score")}:</strong> {aiSuggestions.urgency_score}/10</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("tickets.creating", "Creating...")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("tickets.create", "Create Ticket")}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}