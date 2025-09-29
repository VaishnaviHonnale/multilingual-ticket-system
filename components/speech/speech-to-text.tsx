"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Square } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface SpeechToTextProps {
  onTranscript: (text: string, language?: string) => void
  language?: string
  placeholder?: string
  className?: string
}

export function SpeechToText({ onTranscript, language = "en", placeholder, className }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { t, i18n } = useTranslation()

  // Language mapping for speech recognition
  const languageMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN", 
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN"
  }

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = languageMap[language] || languageMap[i18n.language] || "en-US"

        recognition.onstart = () => {
          setIsListening(true)
          toast.success(t("speech.listening", "Listening..."))
        }

        recognition.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
              setConfidence(result[0].confidence)
            } else {
              interimTranscript += result[0].transcript
            }
          }

          const fullTranscript = finalTranscript || interimTranscript
          setTranscript(fullTranscript)

          if (finalTranscript) {
            onTranscript(finalTranscript, language)
            toast.success(t("speech.transcribed", "Speech transcribed successfully"))
          }
        }

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
          
          let errorMessage = t("speech.error", "Speech recognition error")
          switch (event.error) {
            case "no-speech":
              errorMessage = t("speech.noSpeech", "No speech detected")
              break
            case "audio-capture":
              errorMessage = t("speech.audioCapture", "Microphone not accessible")
              break
            case "not-allowed":
              errorMessage = t("speech.notAllowed", "Microphone permission denied")
              break
            case "network":
              errorMessage = t("speech.network", "Network error")
              break
          }
          
          toast.error(errorMessage)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, i18n.language, onTranscript, t])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setConfidence(0)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  if (!isSupported) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {t("speech.notSupported", "Speech recognition not supported in this browser")}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={toggleListening}
          className="flex items-center gap-2"
        >
          {isListening ? (
            <>
              <Square className="h-4 w-4" />
              {t("speech.stop", "Stop")}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              {t("speech.start", "Voice Input")}
            </>
          )}
        </Button>

        {isListening && (
          <Badge variant="secondary" className="animate-pulse">
            {t("speech.listening", "Listening...")}
          </Badge>
        )}

        {confidence > 0 && (
          <Badge variant="outline">
            {t("speech.confidence", "Confidence")}: {Math.round(confidence * 100)}%
          </Badge>
        )}
      </div>

      {transcript && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-1">{t("speech.transcript", "Transcript")}:</p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      {placeholder && !transcript && !isListening && (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      )}
    </div>
  )
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}