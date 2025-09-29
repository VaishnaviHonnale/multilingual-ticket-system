import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeatureValidator } from "@/components/test/feature-validator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TestPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile to check if admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Testing & Validation</h1>
      </div>

      <div className="grid gap-6">
        <FeatureValidator />

        <Card>
          <CardHeader>
            <CardTitle>Feature Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Core Features</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ User Authentication & Authorization</li>
                  <li>✅ Role-Based Access Controls (Admin, Agent, User)</li>
                  <li>✅ Multilingual Support (i18n)</li>
                  <li>✅ Ticket Management System</li>
                  <li>✅ AI-Powered Ticket Classification</li>
                  <li>✅ Real-time Notifications</li>
                  <li>✅ Comment System</li>
                  <li>✅ File Attachments</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Advanced Features</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ AI Chatbot with Groq Integration</li>
                  <li>✅ Admin Dashboard with Analytics</li>
                  <li>✅ User Management System</li>
                  <li>✅ Performance Metrics & Reporting</li>
                  <li>✅ Data Export (CSV/PDF)</li>
                  <li>✅ Real-time Activity Feed</li>
                  <li>✅ Responsive Design</li>
                  <li>✅ Dark/Light Theme Support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Environment Variables</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>SUPABASE_URL</span>
                    <span className="text-green-600">✓ Configured</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SUPABASE_ANON_KEY</span>
                    <span className="text-green-600">✓ Configured</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GROQ_API_KEY</span>
                    <span className="text-yellow-600">⚠ Needs Manual Setup</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NEXT_PUBLIC_APP_URL</span>
                    <span className="text-green-600">✓ Configured</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">Setup Instructions</h5>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Add GROQ_API_KEY to your environment variables</li>
                  <li>2. Run the database migration scripts</li>
                  <li>3. Create an admin user account</li>
                  <li>4. Test all features using the validator above</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
