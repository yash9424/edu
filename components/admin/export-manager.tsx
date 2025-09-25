"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, Calendar, Filter, Loader2, CheckCircle, AlertCircle } from "lucide-react"

const exportTypes = [
  { value: "applications", label: "Applications" },
  { value: "payments", label: "Payments" },
  { value: "agencies", label: "Agencies" },
  { value: "colleges", label: "Colleges" },
  { value: "users", label: "Users" },
]

const exportFormats = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "excel", label: "Excel" },
]

const defaultFields = {
  applications: ["id", "studentName", "college", "course", "status", "submissionDate", "tuitionFee", "agencyId"],
  payments: ["id", "applicationId", "amount", "status", "paymentDate", "method"],
  agencies: ["id", "name", "contactPerson", "email", "phone", "commissionRate", "status"],
  colleges: ["id", "name", "location", "type", "establishedYear", "ranking"],
  users: ["id", "name", "email", "role", "status", "createdAt"],
}

export function ExportManager() {
  const [exportOptions, setExportOptions] = useState({
    dataType: "",
    format: "csv",
    dateRange: {
      from: "",
      to: "",
    },
    includeFields: [] as string[],
    filters: {
      status: "",
      agency: "",
    },
  })

  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')

  const handleExport = async () => {
    if (!exportOptions.dataType) {
      setExportStatus('error')
      setStatusMessage('Please select a data type to export')
      return
    }

    setIsExporting(true)
    setExportStatus('idle')
    setStatusMessage('')

    try {
      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...exportOptions,
          includeFields: exportOptions.includeFields.length > 0 ? exportOptions.includeFields : availableFields
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Handle different response types
      const contentType = response.headers.get('content-type')
      let blob: Blob
      let filename: string
      
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        filename = `${exportOptions.dataType}_export.json`
      } else if (contentType?.includes('text/csv')) {
        const text = await response.text()
        blob = new Blob([text], { type: 'text/csv' })
        filename = `${exportOptions.dataType}_export.csv`
      } else {
        blob = await response.blob()
        filename = `${exportOptions.dataType}_export.${exportOptions.format}`
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setExportStatus('success')
      setStatusMessage(`Successfully exported ${exportOptions.dataType} data`)
    } catch (error) {
      console.error("Export failed:", error)
      setExportStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const toggleField = (field: string) => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(field)
        ? prev.includeFields.filter(f => f !== field)
        : [...prev.includeFields, field]
    }))
  }

  const selectAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: availableFields
    }))
  }

  const clearAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: []
    }))
  }

  const availableFields = exportOptions.dataType ? defaultFields[exportOptions.dataType as keyof typeof defaultFields] || [] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Export your data in various formats with customizable options and live data fetching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Type Selection */}
        <div className="space-y-2">
          <Label>Data Type</Label>
          <Select
            value={exportOptions.dataType}
            onValueChange={(value) => setExportOptions(prev => ({ ...prev, dataType: value, includeFields: [] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data type to export" />
            </SelectTrigger>
            <SelectContent>
              {exportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select
            value={exportOptions.format}
            onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {exportFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="from-date" className="text-sm text-muted-foreground">From</Label>
              <Input
                id="from-date"
                type="date"
                value={exportOptions.dateRange.from}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, from: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="to-date" className="text-sm text-muted-foreground">To</Label>
              <Input
                id="to-date"
                type="date"
                value={exportOptions.dateRange.to}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, to: e.target.value }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Field Selection */}
        {availableFields.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Include Fields</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllFields}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllFields}>
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {availableFields.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={exportOptions.includeFields.includes(field)}
                    onCheckedChange={() => toggleField(field)}
                  />
                  <Label htmlFor={field} className="text-sm font-normal capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {exportOptions.includeFields.length === 0 ? 'All fields will be included' : `${exportOptions.includeFields.length} fields selected`}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="status-filter" className="text-sm text-muted-foreground">Status</Label>
              <Input
                id="status-filter"
                placeholder="e.g., active, pending"
                value={exportOptions.filters.status}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  filters: { ...prev.filters, status: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="agency-filter" className="text-sm text-muted-foreground">Agency</Label>
              <Input
                id="agency-filter"
                placeholder="Agency name"
                value={exportOptions.filters.agency}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  filters: { ...prev.filters, agency: e.target.value }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {exportStatus === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}
        
        {exportStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting || !exportOptions.dataType}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
