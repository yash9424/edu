"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, Edit, MoreHorizontal, Download, FileText, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import PDFViewer, { PDFGenerateButton } from "@/components/pdf-viewer"
import { Application } from "@/lib/data-store"
import Link from "next/link"

interface ApplicationTableProps {
  searchQuery?: string
  statusFilter?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "processing":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

const generatePDF = async (application: Application) => {
  // Fetch documents for this application - use exact applicationId only
  let documents: any[] = []
  try {
    const response = await fetch(`/api/agency/documents?applicationId=${application.applicationId}`, {
      credentials: 'include'
    })
    if (response.ok) {
      documents = await response.json()
      console.log('Fetched documents for PDF:', documents.length, 'for applicationId:', application.applicationId)
    }
  } catch (error) {
    console.error('Failed to fetch documents for PDF:', error)
  }
  const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Application - ${application.studentName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .section { margin-bottom: 25px; }
    .section h3 { background-color: #f5f5f5; padding: 10px; margin: 0 0 15px 0; }
    .field { margin-bottom: 10px; }
    .label { font-weight: bold; display: inline-block; width: 150px; }
    .value { display: inline-block; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Student Application Form</h1>
    <h2>${application.studentName}</h2>
    <p>Application ID: ${application.applicationId || application._id || application.id}</p>
  </div>
  
  <div class="section">
    <h3>Personal Information</h3>
    <div class="field"><span class="label">Full Name:</span><span class="value">${application.studentName}</span></div>
    <div class="field"><span class="label">Email:</span><span class="value">${application.email}</span></div>
    <div class="field"><span class="label">Phone:</span><span class="value">${application.phone}</span></div>
    <div class="field"><span class="label">Date of Birth:</span><span class="value">${application.studentDetails?.dateOfBirth || 'Not provided'}</span></div>
    <div class="field"><span class="label">Nationality:</span><span class="value">${application.studentDetails?.nationality || 'Not provided'}</span></div>
    <div class="field"><span class="label">Address:</span><span class="value">${application.studentDetails?.address || 'Not provided'}</span></div>
    <div class="field"><span class="label">ABC ID:</span><span class="value">${application.abcId || 'Not provided'}</span></div>
    <div class="field"><span class="label">DEB ID:</span><span class="value">${application.debId || 'Not provided'}</span></div>
  </div>
  
  <div class="section">
    <h3>Program Details</h3>
    <div class="field"><span class="label">College:</span><span class="value">${application.collegeName}</span></div>
    <div class="field"><span class="label">Course:</span><span class="value">${application.courseName}</span></div>
    <div class="field"><span class="label">Fees:</span><span class="value">$${application.fees?.toLocaleString() || '0'}</span></div>
    <div class="field"><span class="label">Status:</span><span class="value">${application.status.toUpperCase()}</span></div>
  </div>
  
  <div class="section">
    <h3>Academic Records</h3>
    <table>
      <thead>
        <tr>
          <th>Education Level</th>
          <th>Board/University</th>
          <th>Year</th>
          <th>Obtained Marks</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${application.academicRecords && application.academicRecords.length > 0 
          ? application.academicRecords.map(record => `
            <tr>
              <td>${record.level || 'Not provided'}</td>
              <td>${record.board || 'Not provided'}</td>
              <td>${record.year || 'Not provided'}</td>
              <td>${record.obtainedMarks || 'Not provided'}</td>
              <td>${record.percentage || 'Not provided'}</td>
            </tr>
          `).join('')
          : '<tr><td colspan="5" style="text-align: center; font-style: italic;">No academic records available</td></tr>'
        }
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h3>Additional Information</h3>
    <div class="field"><span class="label">Personal Statement:</span></div>
    <div style="margin-left: 20px; margin-top: 10px;">${application.studentDetails?.personalStatement || 'Not provided'}</div>
    <div class="field" style="margin-top: 15px;"><span class="label">Work Experience:</span></div>
    <div style="margin-left: 20px; margin-top: 10px;">${application.studentDetails?.workExperience || 'Not provided'}</div>
  </div>
  
  <div class="section">
    <h3>Uploaded Documents</h3>
    ${documents.length > 0 ? documents.map(doc => `
      <div style="margin-bottom: 30px; page-break-inside: avoid;">
        <h4 style="background-color: #f8f9fa; padding: 10px; margin: 0 0 15px 0; border-left: 4px solid #007bff;">
          ${doc.type || 'Document'} - ${doc.name || 'Unknown'}
        </h4>
        <div style="margin-bottom: 10px; font-size: 0.9em; color: #666;">
          <strong>Upload Date:</strong> ${new Date(doc.uploadedAt).toLocaleDateString()} | 
          <strong>Size:</strong> ${doc.size ? `${Math.round(doc.size / 1024)}KB` : 'Unknown'} | 
          <strong>Status:</strong> <span style="color: ${doc.status === 'approved' ? '#28a745' : doc.status === 'rejected' ? '#dc3545' : '#ffc107'}">${doc.status || 'pending'}</span>
        </div>
        ${doc.fileData ? `
          <div style="text-align: center; border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9;">
            <img src="${doc.fileData}" style="max-width: 100%; max-height: 400px; border: 1px solid #ccc;" alt="${doc.name}" />
          </div>
        ` : '<p style="font-style: italic; color: #999; text-align: center; padding: 20px; border: 1px dashed #ccc;">Document content not available</p>'}
      </div>
    `).join('') : '<p style="font-style: italic; text-align: center; color: #666;">No documents uploaded yet</p>'}
  </div>
  
  ${application.pendingDocuments && application.pendingDocuments.length > 0 ? `
  <div class="section">
    <h3>Pending Documents</h3>
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #856404;">The following documents are still required:</p>
      <ul style="margin: 0; padding-left: 20px; color: #856404;">
        ${application.pendingDocuments.map(doc => `<li>${doc}</li>`).join('')}
      </ul>
    </div>
  </div>
  ` : ''}
  
  <div class="section">
    <h3>Submission Details</h3>
    <div class="field"><span class="label">Submitted Date:</span><span class="value">${new Date(application.submittedAt).toLocaleDateString()}</span></div>
    <div class="field"><span class="label">Submitted Time:</span><span class="value">${new Date(application.submittedAt).toLocaleTimeString()}</span></div>
    <div class="field"><span class="label">Total Documents:</span><span class="value">${documents.length}</span></div>
    <div class="field"><span class="label">Application Status:</span><span class="value" style="color: ${application.status === 'approved' ? '#28a745' : application.status === 'rejected' ? '#dc3545' : '#ffc107'}; font-weight: bold;">${application.status.toUpperCase()}</span></div>
  </div>
  
  <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
    <p style="text-align: center; color: #666; font-size: 0.9em;">This document was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    <p style="text-align: center; color: #666; font-size: 0.9em;">For any queries, please contact the admissions office.</p>
  </div>
</body>
</html>
  `
  
  // Open in new window for printing as PDF
  const printWindow = window.open('', '_blank')
  printWindow.document.write(pdfContent)
  printWindow.document.close()
  printWindow.focus()
  
  // Auto print dialog
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

// Removed automatic download function - now using individual download dialog



function DocumentsDialog({ application, appDocs, onClose }: { application: Application, appDocs: any[], onClose: () => void }) {
  const downloadDocument = async (doc: any) => {
    try {
      if (doc.fileData) {
        let blob: Blob
        if (doc.fileData.startsWith('data:')) {
          const base64Data = doc.fileData.split(',')[1] || doc.fileData
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          blob = new Blob([byteArray], { type: 'application/pdf' })
        } else {
          const base64Data = doc.fileData.split(',')[1] || doc.fileData
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          blob = new Blob([byteArray], { type: 'application/pdf' })
        }
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = doc.name || `document_${doc.type}.pdf`
        link.click()
        URL.revokeObjectURL(url)
        toast.success(`Downloaded ${doc.name}`)
      } else {
        const response = await fetch(`/api/agency/documents/${doc.id}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const docData = await response.json()
          if (docData.fileData) {
            const base64Data = docData.fileData.split(',')[1] || docData.fileData
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/pdf' })
            
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = doc.name || `document_${doc.type}.pdf`
            link.click()
            URL.revokeObjectURL(url)
            toast.success(`Downloaded ${doc.name}`)
          }
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error(`Failed to download ${doc.name}`)
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Documents - {application.studentName}</DialogTitle>
      </DialogHeader>
      
      <div className="py-4">
        {appDocs.length > 0 ? (
          <div className="space-y-3">
            {appDocs.map((doc: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-gray-500">
                      Type: {doc.type} • Size: {doc.size ? `${Math.round(doc.size / 1024)}KB` : 'Unknown'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(doc)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents available for this application</p>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  )
}

function ViewApplicationDialog({ application, onClose }: { application: Application, onClose: () => void }) {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Application Details - {application.studentName}</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Student Name</Label>
            <p className="font-medium">{application.studentName}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p>{application.email}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p>{application.phone}</p>
          </div>
          <div>
            <Label>Application ID</Label>
            <p className="font-mono font-medium">{application.applicationId || application._id || application.id}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(application.status)}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
          <div>
            <Label>College</Label>
            <p>{application.collegeName}</p>
          </div>
          <div>
            <Label>Course</Label>
            <p>{application.courseName}</p>
          </div>
          <div>
            <Label>Fees</Label>
            <p>${application.fees}</p>
          </div>
          <div>
            <Label>Submitted</Label>
            <p>{new Date(application.submittedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  )
}

function EditApplicationDialog({ application, onSave, onClose }: { application: Application, onSave: (app: Application) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    studentName: application.studentName,
    email: application.email,
    phone: application.phone,
    dateOfBirth: application.studentDetails?.dateOfBirth || '',
    nationality: application.studentDetails?.nationality || '',
    address: application.studentDetails?.address || '',
    abcId: application.abcId || '',
    debId: application.debId || '',
    personalStatement: application.studentDetails?.personalStatement || '',
    workExperience: application.studentDetails?.workExperience || '',
    collegeId: application.collegeId || '',
    courseId: application.courseId || '',
    fees: application.fees || 0
  })
  
  const colleges = [
    { id: '1', name: 'University of Oxford', courses: [{ id: '1', name: 'Computer Science', fee: 25000 }, { id: '2', name: 'Engineering', fee: 30000 }] },
    { id: '2', name: 'Stanford University', courses: [{ id: '3', name: 'MBA', fee: 45000 }, { id: '4', name: 'Medicine', fee: 50000 }] }
  ]
  
  const selectedCollege = colleges.find(c => c.id === formData.collegeId)
  const availableCourses = selectedCollege ? selectedCollege.courses : []
  
  const [academicRecords, setAcademicRecords] = useState([
    { level: 'High School', board: '', year: '', obtainedMarks: '', percentage: '' },
    { level: 'Intermediate', board: '', year: '', obtainedMarks: '', percentage: '' },
    { level: 'Graduation', board: '', year: '', obtainedMarks: '', percentage: '' },
    { level: 'Other', board: '', year: '', obtainedMarks: '', percentage: '' }
  ])

  const handleSave = async () => {
    try {
      const response = await fetch('/api/agency/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: application.id,
          ...formData,
          academicRecords,
          studentDetails: {
            dateOfBirth: formData.dateOfBirth,
            nationality: formData.nationality,
            address: formData.address,
            personalStatement: formData.personalStatement,
            workExperience: formData.workExperience
          }
        })
      })

      if (response.ok) {
        const updatedApp = { ...application, ...formData, academicRecords }
        onSave(updatedApp)
        alert('Application updated successfully!')
        onClose()
      } else {
        alert('Failed to update application')
      }
    } catch (error) {
      alert('Error updating application')
    }
  }

  return (
    <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Application - {application.studentName}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>ABC ID</Label>
              <Input
                value={formData.abcId}
                onChange={(e) => setFormData(prev => ({ ...prev, abcId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>DEB ID</Label>
              <Input
                value={formData.debId}
                onChange={(e) => setFormData(prev => ({ ...prev, debId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Application ID</Label>
              <Input
                value={application.applicationId || ''}
                readOnly
                className="bg-gray-100"
                placeholder="Auto-generated"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>College/University</Label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.collegeId}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, collegeId: e.target.value, courseId: '', fees: 0 }))
                }}
              >
                <option value="">Select College</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>{college.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.courseId}
                onChange={(e) => {
                  const course = availableCourses.find(c => c.id === e.target.value)
                  setFormData(prev => ({ ...prev, courseId: e.target.value, fees: course ? course.fee : 0 }))
                }}
              >
                <option value="">Select Course</option>
                {availableCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Fees</Label>
              <Input
                value={`$${formData.fees.toLocaleString()}`}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        {/* Education History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Education History</h3>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left font-semibold w-[100px]">Level</th>
                  <th className="p-2 text-left font-semibold w-[150px]">Board/University</th>
                  <th className="p-2 text-left font-semibold w-[80px]">Year</th>
                  <th className="p-2 text-left font-semibold w-[120px]">Obtained Marks</th>
                  <th className="p-2 text-left font-semibold w-[100px]">Percentage</th>
                  <th className="p-2 text-left font-semibold w-[150px]">Upload Marksheet</th>
                </tr>
              </thead>
              <tbody>
                {academicRecords.map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 font-medium">{record.level}</td>
                    <td className="p-2">
                      <Input
                        className="h-8 border"
                        value={record.board}
                        onChange={(e) => {
                          const updated = [...academicRecords]
                          updated[index].board = e.target.value
                          setAcademicRecords(updated)
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        className="h-8 border w-full"
                        value={record.year}
                        onChange={(e) => {
                          const updated = [...academicRecords]
                          updated[index].year = e.target.value
                          setAcademicRecords(updated)
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        className="h-8 border"
                        value={record.obtainedMarks}
                        onChange={(e) => {
                          const updated = [...academicRecords]
                          updated[index].obtainedMarks = e.target.value
                          setAcademicRecords(updated)
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        className="h-8 border"
                        value={record.percentage}
                        onChange={(e) => {
                          const updated = [...academicRecords]
                          updated[index].percentage = e.target.value
                          setAcademicRecords(updated)
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="text-sm w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Personal Statement and Work Experience */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Personal Statement</Label>
            <Textarea
              value={formData.personalStatement}
              onChange={(e) => setFormData(prev => ({ ...prev, personalStatement: e.target.value }))}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Work Experience</Label>
            <Textarea
              value={formData.workExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, workExperience: e.target.value }))}
              rows={4}
            />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function ApplicationTable({ searchQuery = "", statusFilter = "all" }: ApplicationTableProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [viewingDocuments, setViewingDocuments] = useState<Application | null>(null)
  const [appDocuments, setAppDocuments] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetchApplications()
    fetchPaymentSettings()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/agency/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh applications every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/agency/payment-settings')
      if (response.ok) {
        const data = await response.json()
        setPaymentSettings(data.paymentSettings)
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const handlePayOnline = (applicationId: string) => {
    if (paymentSettings?.universalPaymentLink && paymentSettings?.isActive) {
      const paymentUrl = `${paymentSettings.universalPaymentLink}?applicationId=${applicationId}`
      window.open(paymentUrl, '_blank')
    }
  }

  const handleViewDocuments = async (application: Application) => {
    try {
      const response = await fetch(`/api/agency/documents?applicationId=${application.applicationId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const docs = await response.json()
        console.log('Fetched documents for view:', docs.length, 'for applicationId:', application.applicationId)
        setAppDocuments(docs)
        setViewingDocuments(application)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast.error('Failed to load documents')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading applications...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Student Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>College & Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-mono text-sm font-medium">{application.applicationId || application._id || application.id}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.studentName}</div>
                      <div className="text-sm text-muted-foreground">{application.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.collegeName}</div>
                      <div className="text-sm text-muted-foreground">{application.courseName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isClient ? new Date(application.submittedAt).toLocaleDateString() : application.submittedAt}
                  </TableCell>
                  <TableCell>
                    ${application.fees.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingApplication(application)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => generatePDF(application)}>
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => handleViewDocuments(application)}>
                        <Download className="h-4 w-4 mr-1" />
                        Documents
                      </Button>
                      

                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingApplication(application)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Application
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDocuments(application)}>
                            <Download className="h-4 w-4 mr-2" />
                            View Documents
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No applications found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* View Application Dialog */}
    {viewingApplication && (
      <Dialog open={!!viewingApplication} onOpenChange={() => setViewingApplication(null)}>
        <ViewApplicationDialog
          application={viewingApplication}
          onClose={() => setViewingApplication(null)}
        />
      </Dialog>
    )}
    
    {/* Edit Application Dialog */}
    {editingApplication && (
      <Dialog open={!!editingApplication} onOpenChange={() => setEditingApplication(null)}>
        <EditApplicationDialog
          application={editingApplication}
          onSave={(updatedApp) => {
            setApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app))
            setEditingApplication(null)
          }}
          onClose={() => setEditingApplication(null)}
        />
      </Dialog>
    )}
    
    {/* View Documents Dialog */}
    {viewingDocuments && (
      <Dialog open={!!viewingDocuments} onOpenChange={() => setViewingDocuments(null)}>
        <DocumentsDialog
          application={viewingDocuments}
          appDocs={appDocuments}
          onClose={() => setViewingDocuments(null)}
        />
      </Dialog>
    )}
  </>
  )
}
