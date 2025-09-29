"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Minimize2, Maximize2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface AIChatbotProps {
  ticketId?: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

export function AIChatbot({ ticketId, isMinimized = false, onToggleMinimize }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you with your support tickets today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          ticketId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer"
          onClick={onToggleMinimize}
        >
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {t("chat.aiAssistant", "AI Assistant")}
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          {t("chat.aiAssistant", "AI Assistant")}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onToggleMinimize}>
          <Minimize2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder={t("chat.typeMessage", "Type your message...")}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
