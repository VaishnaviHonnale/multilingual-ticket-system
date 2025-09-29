"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { AIChatbot } from "./ai-chatbot"

interface ChatWidgetProps {
  ticketId?: string
}

export function ChatWidget({ ticketId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
    } else {
      setIsOpen(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      {!isOpen && (
        <Button onClick={toggleChat} className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50" size="sm">
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
      {isOpen && <AIChatbot ticketId={ticketId} isMinimized={isMinimized} onToggleMinimize={toggleMinimize} />}
    </>
  )
}
