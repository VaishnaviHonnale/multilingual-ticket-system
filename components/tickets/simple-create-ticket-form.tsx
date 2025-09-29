"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

interface SimpleCreateTicketFormProps {
  onSuccess?: (ticket: any) => void
  className?: string
}

export function SimpleCreateTicketForm({ onSuccess, className }: SimpleCreateTicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
    language: "en"
  })
  
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in both title and description")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Please sign in to create a ticket")
        router.push("/auth/login")
        return
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create ticket")
      }

      const ticket = await response.json()
      toast.success("Ticket created successfully!")
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "general",
        language: "en"
      })
      
      if (onSuccess) {
        onSuccess(ticket)
      } else {
        router.push(`/dashboard/simple`)
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Create New Ticket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="Brief description of your issue"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              placeholder="Detailed description of your issue"
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Create Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}