"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import type SpeechRecognition from "speech-recognition"

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  confidence: number
  error: string | null
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const { t } = useTranslation()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  const { continuous = true, interimResults = true, language = "en-US", onResult, onError } = options

  // Check if speech recognition is supported
  const isSupported =
    typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    recognitionInstance.continuous = continuous
    recognitionInstance.interimResults = interimResults
    recognitionInstance.lang = language

    recognitionInstance.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognitionInstance.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcriptPart = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcriptPart
        } else {
          interimTranscript += transcriptPart
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      const currentConfidence = event.results[event.results.length - 1]?.[0]?.confidence || 0

      setTranscript(currentTranscript)
      setConfidence(currentConfidence)

      if (onResult) {
        onResult({
          transcript: currentTranscript,
          confidence: currentConfidence,
          isFinal: !!finalTranscript,
        })
      }
    }

    recognitionInstance.onerror = (event) => {
      let errorMessage = t("speech.speechRecognitionError")

      switch (event.error) {
        case "no-speech":
          errorMessage = t("speech.noSpeechDetected")
          break
        case "audio-capture":
          errorMessage = t("speech.microphoneNotSupported")
          break
        case "not-allowed":
          errorMessage = t("speech.microphonePermissionDenied")
          break
        default:
          errorMessage = t("speech.speechRecognitionError")
      }

      setError(errorMessage)
      setIsListening(false)

      if (onError) {
        onError(errorMessage)
      }
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
    }

    setRecognition(recognitionInstance)

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop()
      }
    }
  }, [isSupported, continuous, interimResults, language, onResult, onError, t])

  const startListening = useCallback(() => {
    if (!recognition || isListening) return

    try {
      recognition.start()
    } catch (error) {
      setError(t("speech.speechRecognitionError"))
    }
  }, [recognition, isListening, t])

  const stopListening = useCallback(() => {
    if (!recognition || !isListening) return

    recognition.stop()
  }, [recognition, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setConfidence(0)
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
