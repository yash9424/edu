"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, TrendingUp, GraduationCap, DollarSign, Download, Clock, Eye, BarChart3, ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface ReportTemplate {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  format: string
  estimatedTime: string
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "monthly-summary",
    title: "Monthly Summary",
    description: "Comprehensive overview of monthly activities, applications, and revenue",
    icon: FileText,
    format: "json",
    estimatedTime: "2-3 minutes"
  },
  {
    id: "agency-performance",
    title: "Agency Performance",
    description: "Detailed analysis of agency performance metrics and KPIs",
    icon: TrendingUp,
    format: "json",
    estimatedTime: "3-4 minutes"
  },
  {
    id: "college-applications",
    title: "College Applications",
    description: "Complete report on college applications across all agencies",
    icon: GraduationCap,
    format: "json",
    estimatedTime: "2-3 minutes"
  },
  {
    id: "financial-summary",
    title: "Financial Summary",
    description: "Revenue, commissions, and financial performance analysis",
    icon: DollarSign,
    format: "json",
    estimatedTime: "1-2 minutes"
  }
]

export function ReportTemplates() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [viewingReport, setViewingReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const generateReport = async (templateId: string) => {
    setIsGenerating(templateId)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch(`/api/admin/reports/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      setReportData(data)
      setViewingReport(templateId)
      setSuccessMessage('Report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(null)
    }
  }

  const exportReport = (templateId: string) => {
    if (!reportData) return
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `${templateId}_report.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const renderReportData = (templateId: string, data: any) => {
    switch (templateId) {
      case 'monthly-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{data.summary.totalApplications}</div>
                  <div className="text-sm text-muted-foreground">Total Applications</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${data.summary.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{data.summary.activeAgencies}</div>
                  <div className="text-sm text-muted-foreground">Active Agencies</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{Object.keys(data.summary.statusBreakdown).length}</div>
                  <div className="text-sm text-muted-foreground">Status Types</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Status Breakdown</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.summary.statusBreakdown).map(([status, count]) => (
                  <Badge key={status} variant="outline">
                    {status}: {count as number}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'agency-performance':
        return (
          <div className="space-y-4">
            {data.agencies.map((agency: any) => (
              <Card key={agency.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{agency.name}</span>
                    <Badge variant={agency.status === 'active' ? 'default' : 'secondary'}>
                      {agency.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-lg font-semibold">{agency.metrics.totalApplications}</div>
                      <div className="text-sm text-muted-foreground">Applications</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{agency.metrics.approvalRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Approval Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">${agency.metrics.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{agency.commissionRate}%</div>
                      <div className="text-sm text-muted-foreground">Commission</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      
      case 'financial-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${data.summary.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{data.summary.totalApplications}</div>
                  <div className="text-sm text-muted-foreground">Applications</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${data.summary.averageRevenuePerApplication.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Avg Revenue/App</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{data.summary.activeAgencies}</div>
                  <div className="text-sm text-muted-foreground">Active Agencies</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Top Performing Agencies</h4>
              <div className="space-y-2">
                {data.agencyRevenue.slice(0, 5).map((agency: any) => (
                  <div key={agency.agencyId} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{agency.agencyName}</div>
                      <div className="text-sm text-muted-foreground">{agency.applicationCount} applications</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${agency.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{agency.commissionRate}% commission</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        )
    }
  }

  if (viewingReport && reportData) {
    const template = reportTemplates.find(t => t.id === viewingReport)
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{reportData.reportType}</h2>
            <p className="text-muted-foreground">
              Generated at {new Date(reportData.generatedAt || Date.now()).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport(viewingReport)}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => {
              setViewingReport(null)
              setReportData(null)
              setError(null)
              setSuccessMessage(null)
            }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <ScrollArea className="h-[600px]">
          {renderReportData(viewingReport, reportData)}
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Report Templates</h2>
        <p className="text-muted-foreground">
          Generate comprehensive reports with live data from your education management system
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {reportTemplates.map((template) => {
          const Icon = template.icon
          const isCurrentlyGenerating = isGenerating === template.id
          const hasData = reportData && viewingReport === template.id
          
          return (
            <Card key={template.id} className="relative">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>{template.format.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{template.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {hasData && (
                      <Button 
                        variant="outline"
                        onClick={() => setViewingReport(template.id)}
                        size="sm"
                        disabled={isGenerating !== null}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    )}
                    <Button 
                      onClick={() => generateReport(template.id)}
                      disabled={isGenerating !== null}
                      size="sm"
                    >
                      {isCurrentlyGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
