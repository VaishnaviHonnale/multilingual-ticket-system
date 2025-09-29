"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  languagePreference: z.string().default("en")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      languagePreference: i18n.language || "en"
    }
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            language_preference: data.languagePreference
          }
        }
      })

      if (signUpError) {
        toast.error(signUpError.message)
        return
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: "user", // Default role
            language_preference: data.languagePreference
          })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          // Don't block registration if profile creation fails
        }

        toast.success(t("auth.registrationSuccess", "Account created successfully! Please check your email to verify your account."))
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(t("auth.registrationError", "Failed to create account"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back", "Back")}
              </Link>
            </Button>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold">{t("auth.signUp", "Sign Up")}</h1>
          <p className="text-muted-foreground">
            {t("auth.signUpDescription", "Create your account to get started")}
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t("auth.createAccount", "Create Account")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.fullName", "Full Name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("auth.fullNamePlaceholder", "Enter your full name")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email", "Email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("auth.emailPlaceholder", "Enter your email")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languagePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.languagePreference", "Language Preference")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("auth.selectLanguage", "Select language")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                          <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                          <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                          <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.password", "Password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("auth.passwordPlaceholder", "Enter your password")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.confirmPassword", "Confirm Password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("auth.confirmPasswordPlaceholder", "Confirm your password")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.creatingAccount", "Creating account...")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t("auth.createAccount", "Create Account")}
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("auth.haveAccount", "Already have an account?")}{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  {t("auth.signIn", "Sign in")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}