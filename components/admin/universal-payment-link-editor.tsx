"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Save, X } from "lucide-react"

export function UniversalPaymentLinkEditor() {
  const [paymentLink, setPaymentLink] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [tempLink, setTempLink] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/admin/payment-settings?' + Date.now(), {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const link = data.paymentSettings?.universalPaymentLink || "https://payments.example.com/pay"
        setPaymentLink(link)
        setTempLink(link)
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          universalPaymentLink: tempLink,
          isActive: true,
          enabled: true
        })
      })
      
      if (response.ok) {
        setPaymentLink(tempLink)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save payment link:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTempLink(paymentLink)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-4">
      <Input 
        value={isEditing ? tempLink : paymentLink}
        onChange={(e) => setTempLink(e.target.value)}
        readOnly={!isEditing}
        className="max-w-md" 
        placeholder="https://payments.example.com/pay"
      />
      {isEditing ? (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4" />
          Edit Link
        </Button>
      )}
    </div>
  )
}