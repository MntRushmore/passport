"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const router = useRouter()
  const { signInWithEmail, signUpWithEmail, authError, clearAuthError } = useAuth()
  const { toast } = useToast()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    clearAuthError()

    try {
      await signInWithEmail(email, password)
      toast({
        title: "Signed in successfully",
      })
      // The auth provider will handle the redirect
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    clearAuthError()

    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await signUpWithEmail(email, password, name)
      setSignUpSuccess(true)
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account",
      })
    } catch (error) {
      console.error("Sign up error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-gold-500 bg-cream">
      <CardHeader>
        <CardTitle className="text-center font-serif text-navy-700">Welcome to Hack Club</CardTitle>
        <CardDescription className="text-center font-mono text-sm">
          Sign in or create an account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {signUpSuccess ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-navy-700 mb-2">Check Your Email</h3>
            <p className="text-sm font-mono text-stone-600 mb-4">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to
              verify your account.
            </p>
            <Button
              onClick={() => {
                setSignUpSuccess(false)
                setActiveTab("signin")
              }}
              className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs defaultValue="signin" value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-serif text-navy-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-gold-500 bg-white font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password" className="font-serif text-navy-700">
                        Password
                      </Label>
                      <a href="#" className="text-xs font-mono text-navy-700 hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gold-500 bg-white font-mono text-sm"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-serif text-navy-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gold-500 bg-white font-mono text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-serif text-navy-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-gold-500 bg-white font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-serif text-navy-700">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gold-500 bg-white font-mono text-sm"
                      required
                      minLength={6}
                    />
                    <p className="text-xs font-mono text-stone-500">Password must be at least 6 characters</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs font-mono text-stone-500 text-center">
          By signing in, you agree to the{" "}
          <a href="#" className="text-navy-700 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-navy-700 hover:underline">
            Privacy Policy
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
