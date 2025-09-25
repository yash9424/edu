"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Download, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PDFViewerProps {
  applicationId: string
  studentName: string
  trigger?: React.ReactNode
}

export default function PDFViewer({ applicationId, studentName, trigger }: PDFViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [filename, setFilename] = useState<string>('')

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ applicationId }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPdfData(url)
        setFilename(`admission-form-${applicationId}.pdf`)
        toast.success('PDF generated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to generate PDF')
      }
    } catch (error) {
      toast.error('An error occurred while generating PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = () => {
    if (pdfData) {
      const link = document.createElement('a')
      link.href = pdfData
      link.download = filename || `admission-form-${applicationId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('PDF downloaded successfully')
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (!pdfData) {
      generatePDF()
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      View PDF
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Admission Form - {studentName}
          </DialogTitle>
          <DialogDescription>
            Dynamic PDF admission form for application #{applicationId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[500px] border rounded-lg overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Generating PDF...</p>
              </div>
            </div>
          ) : pdfData ? (
            <iframe
              src={pdfData}
              className="w-full h-full min-h-[500px]"
              title="Admission Form PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Click "Generate PDF" to create the admission form</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {!pdfData && (
              <Button onClick={generatePDF} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Generate PDF
              </Button>
            )}
            {pdfData && (
              <Button onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Quick PDF generation button component
export function PDFGenerateButton({ applicationId, studentName }: { applicationId: string, studentName: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAndDownload = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ applicationId }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Auto-download the PDF
        const link = document.createElement('a')
        link.href = result.pdfData
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('PDF generated and downloaded successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to generate PDF')
      }
    } catch (error) {
      toast.error('An error occurred while generating PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generateAndDownload}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  )
}