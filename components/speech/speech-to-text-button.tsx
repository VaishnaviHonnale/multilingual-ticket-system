"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { cn } from "@/lib/utils"

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void
  language?: string
  className?: string
  disabled?: boolean
}

export function SpeechToTextButton({
  onTranscript,
  language = "en-US",
  className,
  disabled = false,
}: SpeechToTextButtonProps) {
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)

  const { isListening, transcript, error, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition({
      language,
      continuous: false,
      interimResults: true,
      onResult: (result) => {
        if (result.isFinal && result.transcript.trim()) {
          setIsProcessing(true)
          onTranscript(result.transcript.trim())
          setTimeout(() => {
            setIsProcessing(false)
            resetTranscript()
          }, 500)
        }
      },
      onError: (error) => {
        console.error("Speech recognition error:", error)
        setIsProcessing(false)
      },
    })

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  if (!isSupported) {
    return null
  }

  const buttonState = isProcessing ? "processing" : isListening ? "listening" : "idle"

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggleListening}
        disabled={disabled || isProcessing}
        className={cn("transition-all duration-200", isListening && "animate-pulse", className)}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="ml-2">
          {buttonState === "processing" && t("speech.processing")}
          {buttonState === "listening" && t("speech.stopRecording")}
          {buttonState === "idle" && t("speech.startRecording")}
        </span>
      </Button>

      {isListening && (
        <div className="text-xs text-muted-foreground text-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {t("speech.recording")}
          </div>
          {transcript && <div className="mt-1 max-w-xs truncate">"{transcript}"</div>}
        </div>
      )}

      {error && <div className="text-xs text-destructive text-center max-w-xs">{error}</div>}
    </div>
  )
}
