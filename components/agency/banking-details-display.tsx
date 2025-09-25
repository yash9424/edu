"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Building, CreditCard, Hash, User, MapPin, CheckCircle } from "lucide-react"
import { BankingDetails } from "@/lib/data-store"
import { toast } from "sonner"

export function BankingDetailsDisplay() {
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetchBankingDetails()
  }, [])

  const fetchBankingDetails = async () => {
    try {
      const response = await fetch('/api/agency/banking-details')
      if (response.ok) {
        const data = await response.json()
        setBankingDetails(data.bankingDetails)
      }
    } catch (error) {
      console.error('Failed to fetch banking details:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast.success(`${fieldName} copied to clipboard`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!bankingDetails) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No banking details available</p>
      </div>
    )
  }

  const bankingFields = [
    {
      label: "Bank Name",
      value: bankingDetails.bankName,
      icon: Building,
      copyKey: "Bank Name"
    },
    {
      label: "Account Holder",
      value: bankingDetails.accountHolderName,
      icon: User,
      copyKey: "Account Holder Name"
    },
    {
      label: "Account Number",
      value: bankingDetails.accountNumber,
      icon: Hash,
      copyKey: "Account Number"
    },
    {
      label: "IFSC Code",
      value: bankingDetails.ifscCode,
      icon: CreditCard,
      copyKey: "IFSC Code"
    },
    {
      label: "Branch",
      value: bankingDetails.branchName,
      icon: MapPin,
      copyKey: "Branch Name"
    }
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Use these details for payments and transactions
      </p>
      
      {bankingFields.map((field) => {
        const Icon = field.icon
        const isCopied = copiedField === field.copyKey
        
        return (
          <Card key={field.label} className="border-l-4 border-l-green-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{field.label}</div>
                    <div className="font-medium text-sm">{field.value}</div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(field.value, field.copyKey)}
                  className="h-8 w-8 p-0"
                >
                  {isCopied ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      <div className="text-xs text-muted-foreground mt-4">
        Last updated: {isClient ? new Date(bankingDetails.updatedAt).toLocaleDateString() : bankingDetails.updatedAt}
      </div>
    </div>
  )
}