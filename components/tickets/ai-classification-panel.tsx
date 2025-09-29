"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Loader2, RefreshCw, Copy, Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/hooks/use-toast"
import type { TicketClassification } from "@/lib/ai/ticket-classifier"

interface AIClassificationPanelProps {
  ticketId: string
  currentClassification?: any
  onClassificationUpdate?: (classification: TicketClassification) => void
}

export function AIClassificationPanel({
  ticketId,
  currentClassification,
  onClassificationUpdate,
}: AIClassificationPanelProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isClassifying, setIsClassifying] = useState(false)
  const [classification, setClassification] = useState<TicketClassification | null>(currentClassification || null)
  const [suggestedResponse, setSuggestedResponse] = useState<string>("")
  const [copiedResponse, setCopiedResponse] = useState(false)

  const handleClassify = async () => {
    setIsClassifying(true)

    try {
      const response = await fetch("/api/tickets/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId }),
      })

      if (!response.ok) {
        throw new Error("Failed to classify ticket")
      }

      const data = await response.json()
      setClassification(data.classification)
      setSuggestedResponse(data.suggestedResponse)

      if (onClassificationUpdate) {
        onClassificationUpdate(data.classification)
      }

      toast({
        title: t("common.success"),
        description: t("ai.classificationComplete", "AI classification completed successfully"),
      })
    } catch (error) {
      console.error("Error classifying ticket:", error)
      toast({
        title: t("common.error"),
        description: t("ai.classificationError", "Failed to classify ticket"),
        variant: "destructive",
      })
    } finally {
      setIsClassifying(false)
    }
  }

  const copyResponse = async () => {
    if (suggestedResponse) {
      await navigator.clipboard.writeText(suggestedResponse)
      setCopiedResponse(true)
      setTimeout(() => setCopiedResponse(false), 2000)

      toast({
        title: t("common.success"),
        description: t("ai.responseCopied", "Response copied to clipboard"),
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "urgent":
        return "bg-orange-500"
      case "high":
        return "bg-yellow-500"
      case "medium":
        return "bg-blue-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      case "neutral":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("ai.classification", "AI Classification")}
          </CardTitle>
          <Button onClick={handleClassify} disabled={isClassifying} size="sm" variant="outline">
            {isClassifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isClassifying ? t("ai.classifying", "Classifying...") : t("ai.classify", "Classify")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {classification ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("tickets.category")}</label>
                <Badge variant="secondary" className="mt-1">
                  {t(`categories.${classification.category}`)}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("tickets.priority")}</label>
                <Badge className={`mt-1 text-white ${getPriorityColor(classification.priority)}`}>
                  {t(`priority.${classification.priority}`)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("ai.sentiment", "Sentiment")}</label>
                <Badge className={`mt-1 text-white ${getSentimentColor(classification.sentiment)}`}>
                  {t(`ai.${classification.sentiment}`, classification.sentiment)}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("ai.urgencyScore", "Urgency Score")}
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{classification.urgency_score}/10</Badge>
                </div>
              </div>
            </div>

            {classification.suggested_tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("ai.suggestedTags", "Suggested Tags")}
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {classification.suggested_tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("ai.confidence", "Confidence")}</label>
              <div className="mt-1">
                <Badge variant="outline">{Math.round(classification.confidence * 100)}%</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("ai.reasoning", "AI Reasoning")}</label>
              <p className="text-sm mt-1 text-muted-foreground">{classification.reasoning}</p>
            </div>

            {suggestedResponse && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("ai.suggestedResponse", "Suggested Response")}
                    </label>
                    <Button onClick={copyResponse} size="sm" variant="ghost" className="h-8 px-2">
                      {copiedResponse ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md text-sm">{suggestedResponse}</div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("ai.noClassification", "No AI classification available")}</p>
            <p className="text-xs mt-1">{t("ai.clickToClassify", 'Click "Classify" to analyze this ticket')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
