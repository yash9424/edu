"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, User, Bell, Shield, Database, Plus, Edit, Trash2, CreditCard, Users, Settings } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { EscalationMatrix, BankingDetails, PaymentSettings } from "@/lib/data-store"
import EscalationMatrixManager from "@/components/admin/escalation-matrix-manager"
import BankingDetailsManager from "@/components/admin/banking-details-manager"
import PaymentSettingsManager from "@/components/admin/payment-settings-manager"

export default function AdminSettings() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [escalationMatrix, setEscalationMatrix] = useState<EscalationMatrix[]>([])
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [systemSettings, setSystemSettings] = useState({
    systemName: 'Education Management System',
    adminEmail: 'admin@education.com',
    emailNotifications: true,
    autoBackup: true,
    maintenanceMode: false
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const sessionData = await response.json()
          if (!sessionData || sessionData.role !== 'admin') {
            router.push('/login')
            return
          }
          setSession(sessionData)
          
          // Fetch data via API
          const [escalationRes, bankingRes, paymentRes, settingsRes] = await Promise.all([
            fetch('/api/admin/escalation-matrix'),
            fetch('/api/admin/banking-details'),
            fetch('/api/admin/payment-settings'),
            fetch('/api/admin/settings')
          ])
          
          if (escalationRes.ok) {
            const escalationData = await escalationRes.json()
            setEscalationMatrix(escalationData.escalationMatrix || [])
          }
          
          if (bankingRes.ok) {
            const bankingData = await bankingRes.json()
            setBankingDetails(bankingData.bankingDetails || null)
          }
          
          if (paymentRes.ok) {
            const paymentData = await paymentRes.json()
            setPaymentSettings(paymentData.paymentSettings || null)
          }
          
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json()
            const settings = settingsData.settings
            setSystemSettings({
              systemName: settings.systemName || 'Education Management System',
              adminEmail: settings.adminEmail || 'admin@education.com',
              emailNotifications: settings.emailNotifications ?? true,
              autoBackup: settings.autoBackup ?? true,
              maintenanceMode: settings.maintenanceMode ?? false
            })
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const saveSystemSettings = async () => {
    try {
      setSaving(true)
      console.log('Saving settings:', systemSettings)
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(systemSettings)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Settings saved successfully:', result)
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        console.error('Failed to save settings:', error)
        alert('Failed to save settings: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title="Admin Settings"
        subtitle="Manage system configuration and settings"
      />
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Escalation Matrix Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Escalation Matrix</CardTitle>
              </div>
              <CardDescription>
                Manage support escalation contacts that will be displayed to all agencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EscalationMatrixManager initialData={escalationMatrix} />
            </CardContent>
          </Card>

          {/* Banking Details Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Banking Details</CardTitle>
              </div>
              <CardDescription>
                Configure banking information that will be displayed to all agencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BankingDetailsManager initialData={bankingDetails} />
            </CardContent>
          </Card>

          {/* Payment Settings Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>Payment Settings</CardTitle>
              </div>
              <CardDescription>
                Configure payment gateway and online payment options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentSettingsManager initialData={paymentSettings} />
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}
