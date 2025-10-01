"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

export function ExportReportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/payments', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const payments = data.payments || []
        
        const exportData = payments.map((payment: any) => ({
          'Payment ID': `PAY-${payment._id.slice(-6)}`,
          'Student': payment.studentName,
          'Agency': payment.agencyName,
          'College': payment.collegeName,
          'Amount': payment.applicationFee,
          'Status': payment.paymentStatus,
          'Date': payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString()
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments Report')
        
        const fileName = `payments-report-${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(workbook, fileName)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={exportToExcel} disabled={isExporting}>
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exporting...' : 'Export Report'}
    </Button>
  )
}