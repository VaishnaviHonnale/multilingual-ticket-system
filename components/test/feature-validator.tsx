"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"

interface TestResult {
  name: string
  status: "pending" | "success" | "error" | "warning"
  message: string
  details?: string
}

export function FeatureValidator() {
  const { t } = useTranslation()
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = []

    // Test 1: Database Connection
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      testResults.push({
        name: "Database Connection",
        status: error ? "error" : "success",
        message: error ? "Database connection failed" : "Database connected successfully",
        details: error?.message,
      })
    } catch (err) {
      testResults.push({
        name: "Database Connection",
        status: "error",
        message: "Database connection failed",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 2: Authentication System
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      testResults.push({
        name: "Authentication System",
        status: data.user ? "success" : "warning",
        message: data.user ? "User authenticated" : "No user session (expected for test)",
      })
    } catch (err) {
      testResults.push({
        name: "Authentication System",
        status: "error",
        message: "Authentication system error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 3: AI Chatbot API
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test" }),
      })
      testResults.push({
        name: "AI Chatbot API",
        status: response.ok ? "success" : "error",
        message: response.ok ? "AI chatbot API working" : "AI chatbot API failed",
        details: response.ok ? undefined : `Status: ${response.status}`,
      })
    } catch (err) {
      testResults.push({
        name: "AI Chatbot API",
        status: "error",
        message: "AI chatbot API error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 4: Ticket System
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("tickets").select("id").limit(1)
      testResults.push({
        name: "Ticket System",
        status: error ? "error" : "success",
        message: error ? "Ticket system failed" : "Ticket system working",
        details: error?.message,
      })
    } catch (err) {
      testResults.push({
        name: "Ticket System",
        status: "error",
        message: "Ticket system error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 5: Notification System
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("notifications").select("id").limit(1)
      testResults.push({
        name: "Notification System",
        status: error ? "error" : "success",
        message: error ? "Notification system failed" : "Notification system working",
        details: error?.message,
      })
    } catch (err) {
      testResults.push({
        name: "Notification System",
        status: "error",
        message: "Notification system error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 6: User Management API
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      testResults.push({
        name: "User Management API",
        status: response.status === 401 ? "success" : response.ok ? "success" : "error",
        message:
          response.status === 401
            ? "User management API protected (expected)"
            : response.ok
              ? "User management API working"
              : "User management API failed",
        details: response.ok ? undefined : `Status: ${response.status}`,
      })
    } catch (err) {
      testResults.push({
        name: "User Management API",
        status: "error",
        message: "User management API error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 7: Internationalization
    try {
      const hasTranslations = t("common.loading") !== "common.loading"
      testResults.push({
        name: "Internationalization",
        status: hasTranslations ? "success" : "warning",
        message: hasTranslations ? "i18n working" : "i18n may not be fully loaded",
      })
    } catch (err) {
      testResults.push({
        name: "Internationalization",
        status: "error",
        message: "i18n system error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 8: Role-Based Access Controls
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()
        testResults.push({
          name: "Role-Based Access Controls",
          status: profile ? "success" : "warning",
          message: profile ? `RBAC working (role: ${profile.role})` : "No user profile found",
        })
      } else {
        testResults.push({
          name: "Role-Based Access Controls",
          status: "warning",
          message: "RBAC test skipped (no user session)",
        })
      }
    } catch (err) {
      testResults.push({
        name: "Role-Based Access Controls",
        status: "error",
        message: "RBAC system error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    setTests(testResults)
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Warning
          </Badge>
        )
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Feature Validation</CardTitle>
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Tests"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Click "Run Tests" to validate all system features</p>
        ) : (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">{test.message}</p>
                    {test.details && <p className="text-xs text-red-500 mt-1">{test.details}</p>}
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Test Summary</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✓ {tests.filter((t) => t.status === "success").length} Passed</span>
                <span className="text-yellow-600">⚠ {tests.filter((t) => t.status === "warning").length} Warnings</span>
                <span className="text-red-600">✗ {tests.filter((t) => t.status === "error").length} Failed</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
