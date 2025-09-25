"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Edit, Link, ExternalLink } from "lucide-react"
import { PaymentSettings } from "@/lib/data-store"
import { toast } from "sonner"

interface PaymentSettingsManagerProps {
  initialData: PaymentSettings | null
}

export default function PaymentSettingsManager({ initialData }: PaymentSettingsManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    universalPaymentLink: initialData?.universalPaymentLink || "https://payments.example.com/pay",
    isActive: initialData?.isActive ?? true
  })

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsEditing(false)
        toast.success('Payment settings updated successfully')
      } else {
        toast.error('Failed to update payment settings')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleCancel = () => {
    setFormData({
      universalPaymentLink: initialData?.universalPaymentLink || "",
      isActive: initialData?.isActive || false
    })
    setIsEditing(false)
  }

  const testPaymentLink = () => {
    if (formData.universalPaymentLink) {
      window.open(formData.universalPaymentLink, '_blank')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Configure universal payment link for all agency applications
        </p>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Settings
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Universal Payment Configuration
          </CardTitle>
          <CardDescription>
            Set up the payment link that will be used across all agency applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentLink">Payment Gateway URL</Label>
            <div className="flex gap-2">
              <Input
                id="paymentLink"
                value={formData.universalPaymentLink}
                onChange={(e) => setFormData(prev => ({ ...prev, universalPaymentLink: e.target.value }))}
                disabled={!isEditing}
                placeholder="https://payments.yourgateway.com/pay"
                className="flex-1"
              />
              {formData.universalPaymentLink && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={testPaymentLink}
                  disabled={isEditing}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This URL will be used for all "Pay Online" buttons in agency applications
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Enable Payment System</Label>
              <p className="text-sm text-muted-foreground">
                Toggle to enable/disable the universal payment system
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {initialData && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className={`inline-block w-2 h-2 rounded-full ${
              formData.isActive ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="text-muted-foreground">
              Payment system is currently {formData.isActive ? 'active' : 'inactive'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {initialData.updatedAt ? new Date(initialData.updatedAt).toLocaleString() : 'Never'}
          </div>
        </div>
      )}
    </div>
  )
}