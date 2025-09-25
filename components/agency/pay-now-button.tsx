"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

interface PayNowButtonProps {
  student: any
  disabled?: boolean
}

export function PayNowButton({ student, disabled }: PayNowButtonProps) {
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/agency/payment-settings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPaymentSettings(data.paymentSettings)
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = () => {
    if (!paymentSettings?.universalPaymentLink || !paymentSettings?.enabled) {
      console.error('Payment system is not configured or disabled')
      return
    }
    
    // Open the universal payment link exactly as configured, without appending query parameters
    console.log('Opening payment URL:', paymentSettings.universalPaymentLink)
    window.open(paymentSettings.universalPaymentLink, '_blank')
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
      disabled={disabled || loading || !paymentSettings?.universalPaymentLink || !paymentSettings?.enabled}
      onClick={handlePayNow}
    >
      <DollarSign className="h-3 w-3" />
      {loading ? 'Loading...' : 'Pay Now'}
    </Button>
  )
}