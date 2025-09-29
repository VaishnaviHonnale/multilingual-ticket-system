"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatbotWidgetProps {
  className?: string
}

export function ChatbotWidget({ className }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. How can I help you with your support tickets today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }



  // Floating button when closed
  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-12 w-12 md:h-14 md:w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 md:-top-2 md:-right-2 h-5 w-5 md:h-6 md:w-6 rounded-full p-0 flex items-center justify-center animate-pulse text-xs"
        >
          AI
        </Badge>
      </div>
    )
  }

  // Chat interface (responsive)
  return (
    <>
      {/* Mobile Full Screen View */}
      <div className={cn("fixed inset-0 z-50 md:hidden", className, !isOpen && "hidden")}>
        <div className="bg-white h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <h2 className="font-medium">AI Assistant</h2>
              <Badge variant="secondary" className="text-xs bg-blue-500 text-white border-blue-400">
                Online
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-2",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.sender === 'user'
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ask me about creating tickets, checking status, or system features
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Card View */}
      <div className={cn("fixed bottom-4 right-4 z-50 hidden md:block", className, !isOpen && "hidden")}>
        <Card className={cn(
          "w-80 lg:w-96 shadow-2xl transition-all duration-300",
          isMinimized ? "h-14" : "h-96 lg:h-[500px]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs bg-blue-500 text-white border-blue-400">
                Online
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-blue-700"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 lg:max-h-96">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-2",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === 'bot' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                        message.sender === 'user'
                          ? "bg-blue-600 text-white ml-auto"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1 opacity-70",
                        message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                      )}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.sender === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ask me about creating tickets, checking status, or system features
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  )
}