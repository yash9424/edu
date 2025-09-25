"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Save, Eye, EyeOff, User, Mail, Phone, MapPin, Building, Key } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useCentralizedAgencyData } from "@/hooks/use-centralized-agency-data"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

interface Session {
  id: string
  name: string
  email: string
  role: string
  agencyName?: string
  agencyId?: string
}

interface AgencySettingsFormProps {
  session: Session
}

export function AgencySettingsForm({ session }: AgencySettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Use centralized agency data store
  const { 
    agencies, 
    loading: dataLoading, 
    error: dataError, 
    updateAgency, 
    refreshData 
  } = useCentralizedAgencyData({
    role: session.role as 'admin' | 'agency',
    agencyId: session.agencyId
  })

  // Subscribe to real-time updates for agency data
  useRealTimeUpdates({
    types: ['agency'],
    onUpdate: (event) => {
      // Refresh data when agency updates are received
      refreshData()
    },
    enabled: true
  })

  // Get current agency data
  const currentAgency = agencies.find((agency: any) => agency.id === session.agencyId)

  const [formData, setFormData] = useState({
    name: session.name || "",
    email: session.email || "",
    phone: "",
    address: "",
    description: "",
    contactPerson: "",
    website: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Update form data when agency data changes
  useEffect(() => {
    if (currentAgency) {
      setFormData(prev => ({
        ...prev,
        name: currentAgency.name || "",
        contactPerson: currentAgency.contactPerson || "",
        description: currentAgency.description || "",
        email: currentAgency.email || "",
        phone: currentAgency.phone || "",
        address: currentAgency.address || "",
        website: currentAgency.website || ""
      }))
    }
  }, [currentAgency])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!session.agencyId) {
      setError("Agency ID not found")
      setLoading(false)
      return
    }

    // Validate password fields if changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError("Current password is required to change password")
        setLoading(false)
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match")
        setLoading(false)
        return
      }
      if (formData.newPassword.length < 6) {
        setError("New password must be at least 6 characters long")
        setLoading(false)
        return
      }
    }

    try {
      // Prepare update data (excluding password fields for agency data)
      const agencyUpdateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        description: formData.description.trim(),
        contactPerson: formData.contactPerson.trim(),
        website: formData.website.trim()
      }

      // Update agency data through centralized store
      const result = await updateAgency(session.agencyId, agencyUpdateData)
      const success = result.success

      if (success) {
        setSuccess("Settings updated successfully")
        toast.success("Settings updated successfully")

        // Handle password change separately if needed
        if (formData.newPassword) {
          try {
            const passwordResponse = await fetch("/api/agency/change-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
              })
            })

            if (passwordResponse.ok) {
              toast.success("Password changed successfully! Please log in again.")
              // Force logout after password change
              setTimeout(() => {
                window.location.href = "/login"
              }, 2000)
            } else {
              const errorData = await passwordResponse.json()
              setError(errorData.error || "Failed to change password")
            }
          } catch (passwordError) {
            console.error("Error changing password:", passwordError)
            setError("Failed to change password")
          }
        }
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
      } else {
        setError("Failed to update agency settings")
        toast.error("Failed to update agency settings")
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      setError("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
            {session.role === "admin" && (
              <Badge variant="outline" className="ml-auto">
                Admin Access
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Agency Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter agency name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
                placeholder="Enter contact person name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of your agency"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://your-website.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter complete address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                placeholder="Enter current password to change password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}