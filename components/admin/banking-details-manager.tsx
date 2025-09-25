"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Edit, CreditCard } from "lucide-react"
import { BankingDetails } from "@/lib/data-store"
import { toast } from "sonner"

interface BankingDetailsManagerProps {
  initialData: BankingDetails | null
}

export default function BankingDetailsManager({ initialData }: BankingDetailsManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    bankName: initialData?.bankName || "",
    accountNumber: initialData?.accountNumber || "",
    ifscCode: initialData?.ifscCode || "",
    accountHolderName: initialData?.accountHolderName || "",
    branchName: initialData?.branchName || ""
  })

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/banking-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsEditing(false)
        toast.success('Banking details updated successfully')
      } else {
        toast.error('Failed to update banking details')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleCancel = () => {
    setFormData({
      bankName: initialData?.bankName || "",
      accountNumber: initialData?.accountNumber || "",
      ifscCode: initialData?.ifscCode || "",
      accountHolderName: initialData?.accountHolderName || "",
      branchName: initialData?.branchName || ""
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Bank account details that will be displayed to all agencies
        </p>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Information
          </CardTitle>
          <CardDescription>
            This information will be visible to all agencies for payment purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter bank name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter account holder name"
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter account number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={formData.ifscCode}
                onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                disabled={!isEditing}
                placeholder="Enter IFSC code"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              value={formData.branchName}
              onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
              disabled={!isEditing}
              placeholder="Enter branch name and address"
            />
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {initialData && (
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(initialData.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}