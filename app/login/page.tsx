"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GraduationCap, Mail, Lock, AlertTriangle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDeactivatedDialog, setShowDeactivatedDialog] = useState(false)
  const [deactivatedMessage, setDeactivatedMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for auto-logout query parameters
    const deactivated = searchParams.get('deactivated')
    const agencyDeactivated = searchParams.get('agency_deactivated')
    
    if (deactivated === 'true') {
      setShowDeactivatedDialog(true)
      setDeactivatedMessage('Your account has been deactivated. Please contact your administrator for assistance.')
    } else if (agencyDeactivated === 'true') {
      setShowDeactivatedDialog(true)
      setDeactivatedMessage('Your agency has been deactivated. Please contact your administrator for assistance.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect based on user role
        const redirectPath = data.user.role === "admin" ? "/admin" : "/agency"
        router.push(redirectPath)
      } else {
        // Check if it's a deactivated user error (403 status)
        if (response.status === 403 && (data.error.includes("inactive") || data.error.includes("deactivated"))) {
          setDeactivatedMessage(data.error)
          setShowDeactivatedDialog(true)
        } else {
          setError(data.error || "Login failed")
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600 text-sm">
            Simplify your workflow and boost your productivity
          </p>
        </div>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300 rounded-full px-4 focus:border-gray-400 focus:ring-0"
                  required
                />
              </div>

              <div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-gray-300 rounded-full px-4 focus:border-gray-400 focus:ring-0"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-full font-medium transition-colors" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Deactivated User Dialog */}
      <Dialog open={showDeactivatedDialog} onOpenChange={setShowDeactivatedDialog}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <DialogTitle className="text-gray-900">Account Deactivated</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-gray-600">
              {deactivatedMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeactivatedDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowDeactivatedDialog(false)
                // Clear form
                setEmail("")
                setPassword("")
                setError("")
              }}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
