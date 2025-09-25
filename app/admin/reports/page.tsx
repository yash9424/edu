"use client"

import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Users, Building2, CreditCard } from "lucide-react"

export default function ReportsPage() {
  const handleExportApplications = () => {
    // Export applications data
    window.open('/api/admin/reports/applications', '_blank')
  }

  const handleExportAgencies = () => {
    // Export agencies data
    window.open('/api/admin/reports/agencies', '_blank')
  }

  const handleExportColleges = () => {
    // Export colleges data
    window.open('/api/admin/reports/colleges', '_blank')
  }

  const handleExportUsers = () => {
    // Export users data
    window.open('/api/admin/reports/users', '_blank')
  }

  const handleExportPayments = () => {
    // Export payments data
    window.open('/api/admin/reports/payments', '_blank')
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Reports & Analytics"
        subtitle="Generate and export system reports"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Applications Report
            </CardTitle>
            <CardDescription>
              Export all student applications with status and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportApplications} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Applications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agencies Report
            </CardTitle>
            <CardDescription>
              Export agency partners and their performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportAgencies} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Agencies
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Colleges Report
            </CardTitle>
            <CardDescription>
              Export college partners and course information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportColleges} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Colleges
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users Report
            </CardTitle>
            <CardDescription>
              Export user accounts and role information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportUsers} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payments Report
            </CardTitle>
            <CardDescription>
              Export payment transactions and commission data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportPayments} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Payments
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}