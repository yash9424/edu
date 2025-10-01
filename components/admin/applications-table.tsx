"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock, Search, Filter, Edit, FileText, AlertCircle, Download } from "lucide-react"
import { Application } from "@/lib/data-store"
import PDFViewer from "@/components/pdf-viewer"
import { toast } from "sonner"

interface EditApplicationDialogProps {
  application: Application
  onSave: (updatedApplication: Application) => void
  onClose: () => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

function DocumentsDownloadDialog({ application, documents, onClose }: { application: Application, documents: any[], onClose: () => void }) {
  const appId = application.applicationId || application._id || application.id
  const filteredDocs = documents.filter(doc => {
    const docAppId = doc.applicationId
    return docAppId === appId || docAppId === String(appId)
  })
  
  // Separate academic and other documents
  const academicDocs = filteredDocs.filter(doc => doc.type?.includes('Marksheet')).slice(0, 4)
  const otherDocs = filteredDocs.filter(doc => !doc.type?.includes('Marksheet'))
    .filter((doc, index, self) => index === self.findIndex(d => d.type === doc.type))
    .slice(0, 7)
  
  const appDocs = [...academicDocs, ...otherDocs]

  const downloadDocument = async (doc: any) => {
    try {
      if (doc.fileData) {
        let blob: Blob
        
        if (doc.fileData.startsWith('data:')) {
          const response = await fetch(doc.fileData)
          blob = await response.blob()
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
        const response = await fetch(`/api/admin/documents/${doc.id}`, {
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
        <DialogDescription>
          Download individual documents for this application
        </DialogDescription>
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
            <Label>Agency</Label>
            <p>{application.agencyName}</p>
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
        </div>
        
        {application.studentDetails && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Student Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date of Birth</Label>
                <p>{application.studentDetails.dateOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <Label>Nationality</Label>
                <p>{application.studentDetails.nationality || 'Not provided'}</p>
              </div>
              <div>
                <Label>Father's Name</Label>
                <p>{application.studentDetails.fatherName || 'Not provided'}</p>
              </div>
              <div>
                <Label>Mother's Name</Label>
                <p>{application.studentDetails.motherName || 'Not provided'}</p>
              </div>
              <div>
                <Label>Religion</Label>
                <p>{application.studentDetails.religion || 'Not provided'}</p>
              </div>
              <div>
                <Label>Caste</Label>
                <p>{application.studentDetails.caste || 'Not provided'}</p>
              </div>
              <div>
                <Label>Marital Status</Label>
                <p>{application.studentDetails.maritalStatus || 'Not provided'}</p>
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <p>{application.studentDetails.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}
        
        {application.documents && application.documents.length > 0 && (
          <div>
            <Label>Documents ({application.documents.length})</Label>
            <div className="mt-2 space-y-1">
              {application.documents.map((doc, index) => (
                <p key={index} className="text-sm">{doc}</p>
              ))}
            </div>
          </div>
        )}
        
        {application.pendingDocuments && application.pendingDocuments.length > 0 && (
          <div>
            <Label>Pending Documents ({application.pendingDocuments.length})</Label>
            <div className="mt-2 space-y-1">
              {application.pendingDocuments.map((doc, index) => (
                <p key={index} className="text-sm text-orange-600">{doc}</p>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  )
}

function EditApplicationDialog({ application, onSave, onClose }: EditApplicationDialogProps) {
  const [formData, setFormData] = useState({
    studentName: application.studentName,
    email: application.email,
    phone: application.phone,
    status: application.status,
    abcId: application.abcId || '',
    debId: application.debId || '',
    applicationId: application.applicationId || '',
    aadharPassportNumber: application.studentDetails?.aadharPassportNumber || '',
    fatherName: application.studentDetails?.fatherName || '',
    motherName: application.studentDetails?.motherName || '',
    religion: application.studentDetails?.religion || '',
    caste: application.studentDetails?.caste || '',
    maritalStatus: application.studentDetails?.maritalStatus || '',
    dateOfBirth: application.studentDetails?.dateOfBirth || '',
    nationality: application.studentDetails?.nationality || '',
    address: application.studentDetails?.address || '',
    personalStatement: application.studentDetails?.personalStatement || '',
    workExperience: application.studentDetails?.workExperience || '',
    studentDetails: {
      dateOfBirth: application.studentDetails?.dateOfBirth || '',
      nationality: application.studentDetails?.nationality || '',
      address: application.studentDetails?.address || '',
      personalStatement: application.studentDetails?.personalStatement || '',
      workExperience: application.studentDetails?.workExperience || ''
    },
    academicRecords: application.academicRecords || [
      { level: 'High School', board: '', year: '', obtainedMarks: '', percentage: '', marksheetUrl: '' },
      { level: 'Intermediate', board: '', year: '', obtainedMarks: '', percentage: '', marksheetUrl: '' },
      { level: 'Graduation', board: '', year: '', obtainedMarks: '', percentage: '', marksheetUrl: '' },
      { level: 'Other', board: '', year: '', obtainedMarks: '', percentage: '', marksheetUrl: '' }
    ]
  })
  const [pendingDocuments, setPendingDocuments] = useState<string[]>(application.pendingDocuments || [])
  const [newDocumentRequest, setNewDocumentRequest] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const documentTypes = [
    'Passport Size Photo',
    'Aadhaar Card',
    'Signature',
    'ABC ID / APAAR ID',
    'DEB ID',
    'Fee Receipt',
    'Any Other Documents'
  ]

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const appId = application._id || application.id
      console.log('Saving status:', formData.status)
      const response = await fetch(`/api/admin/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: formData.studentName,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          studentDetails: {
            ...formData.studentDetails,
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            religion: formData.religion,
            caste: formData.caste,
            maritalStatus: formData.maritalStatus,
            aadharPassportNumber: formData.aadharPassportNumber,
            dateOfBirth: formData.dateOfBirth,
            nationality: formData.nationality,
            address: formData.address,
            personalStatement: formData.personalStatement,
            workExperience: formData.workExperience
          },
          pendingDocuments: pendingDocuments,
          abcId: formData.abcId,
          debId: formData.debId,
          applicationId: formData.applicationId,
          academicRecords: formData.academicRecords
        })
      })

      if (response.ok) {
        const result = await response.json()
        onSave(result.application)
        toast.success('Application updated successfully')
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update application')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const addDocumentRequest = () => {
    if (newDocumentRequest && !pendingDocuments.includes(newDocumentRequest)) {
      setPendingDocuments([...pendingDocuments, newDocumentRequest])
      setNewDocumentRequest('')
    }
  }

  const removeDocumentRequest = (doc: string) => {
    setPendingDocuments(pendingDocuments.filter(d => d !== doc))
  }

  return (
    <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Application - {application.studentName}</DialogTitle>
        <DialogDescription>
          Update student details and manage document requests
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                value={formData.applicationId}
                onChange={(e) => setFormData(prev => ({ ...prev, applicationId: e.target.value }))}
                placeholder="Auto-generated if left empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadharPassportNumber">Aadhar/Passport Number</Label>
              <Input
                id="aadharPassportNumber"
                value={formData.aadharPassportNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, aadharPassportNumber: e.target.value }))}
                placeholder="Enter Aadhar or Passport number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                placeholder="Enter father's name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherName">Mother's Name</Label>
              <Input
                id="motherName"
                value={formData.motherName}
                onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                placeholder="Enter mother's name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="religion">Religion</Label>
              <Input
                id="religion"
                value={formData.religion}
                onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))}
                placeholder="Enter religion"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caste">Caste Category</Label>
              <Select value={formData.caste} onValueChange={(value) => setFormData(prev => ({ ...prev, caste: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select caste category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="EWS">EWS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select value={formData.maritalStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Student Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                  studentDetails: { ...prev.studentDetails, dateOfBirth: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nationality: e.target.value,
                  studentDetails: { ...prev.studentDetails, nationality: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abcId">ABC ID</Label>
              <Input
                id="abcId"
                value={formData.abcId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  abcId: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debId">DEB ID</Label>
              <Input
                id="debId"
                value={formData.debId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  debId: e.target.value
                }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: e.target.value,
                studentDetails: { ...prev.studentDetails, address: e.target.value }
              }))}
            />
          </div>
          <div className="space-y-4">
            <Label>Education History</Label>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[120px] font-semibold">Level</TableHead>
                    <TableHead className="w-[180px] font-semibold">Board/University</TableHead>
                    <TableHead className="w-[100px] font-semibold">Year</TableHead>
                    <TableHead className="w-[140px] font-semibold">Obtained Marks</TableHead>
                    <TableHead className="w-[120px] font-semibold">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.academicRecords.map((record, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="w-[120px] font-medium">{record.level}</TableCell>
                      <TableCell className="w-[180px]">
                        <Input
                          className="h-8 border-0 bg-transparent focus:bg-background focus:border focus:border-input"
                          value={record.board}
                          onChange={(e) => {
                            const updatedRecords = [...formData.academicRecords];
                            updatedRecords[index].board = e.target.value;
                            setFormData(prev => ({ ...prev, academicRecords: updatedRecords }));
                          }}
                        />
                      </TableCell>
                      <TableCell className="w-[100px]">
                        <Input
                          className="h-8 border-0 bg-transparent focus:bg-background focus:border focus:border-input"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={record.year}
                          onChange={(e) => {
                            const updatedRecords = [...formData.academicRecords];
                            updatedRecords[index].year = e.target.value;
                            setFormData(prev => ({ ...prev, academicRecords: updatedRecords }));
                          }}
                        />
                      </TableCell>
                      <TableCell className="w-[140px]">
                        <Input
                          className="h-8 border-0 bg-transparent focus:bg-background focus:border focus:border-input"
                          value={record.obtainedMarks}
                          onChange={(e) => {
                            const updatedRecords = [...formData.academicRecords];
                            updatedRecords[index].obtainedMarks = e.target.value;
                            setFormData(prev => ({ ...prev, academicRecords: updatedRecords }));
                          }}
                        />
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Input
                          className="h-8 border-0 bg-transparent focus:bg-background focus:border focus:border-input"
                          value={record.percentage}
                          onChange={(e) => {
                            const updatedRecords = [...formData.academicRecords];
                            updatedRecords[index].percentage = e.target.value;
                            setFormData(prev => ({ ...prev, academicRecords: updatedRecords }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalStatement">Personal Statement</Label>
              <Textarea
                id="personalStatement"
                value={formData.personalStatement}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  personalStatement: e.target.value,
                  studentDetails: { ...prev.studentDetails, personalStatement: e.target.value }
                }))}
                placeholder="Tell us about yourself and why you want to study this course..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience</Label>
              <Textarea
                id="workExperience"
                value={formData.workExperience}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  workExperience: e.target.value,
                  studentDetails: { ...prev.studentDetails, workExperience: e.target.value }
                }))}
                placeholder="Describe any relevant work experience..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Document Requests */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Document Requests</h3>
          <div className="space-y-2">
            <Label>Add Document Request</Label>
            <div className="flex gap-2">
              <Select value={newDocumentRequest} onValueChange={setNewDocumentRequest}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addDocumentRequest} disabled={!newDocumentRequest}>
                Add Request
              </Button>
            </div>
          </div>
          
          {pendingDocuments.length > 0 && (
            <div className="space-y-2">
              <Label>Pending Document Requests</Label>
              <div className="space-y-2">
                {pendingDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{doc}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDocumentRequest(doc)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [agencyFilter, setAgencyFilter] = useState('all')
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null)
  const [documentsDialogApplication, setDocumentsDialogApplication] = useState<Application | null>(null)

  useEffect(() => {
    fetchApplications()
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      // Use the correct port for the API request
      // Check if window is defined (client-side only)
      const baseUrl = typeof window !== 'undefined' 
        ? '' 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/admin/applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
        console.log('Loaded applications:', data.applications?.length || 0)
      } else {
        console.error('Failed to fetch applications:', response.status, response.statusText)
        setApplications([])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplications(prev => prev.map(app => 
      (app._id || app.id) === (updatedApplication._id || updatedApplication.id) ? updatedApplication : app
    ))
    setEditingApplication(null)
  }

  const updateApplicationStatus = async (applicationId: string, status: "pending" | "approved" | "rejected" | "processing") => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        const result = await response.json()
        setApplications(prev => prev.map(app => 
          (app._id || app.id) === applicationId ? { ...app, status } : app
        ))
        toast.success(`Application ${status} successfully`)
      } else {
        toast.error('Failed to update application status')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  // Removed automatic download function - now using individual download dialog

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.agencyName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesAgency = agencyFilter === 'all' || app.agencyName === agencyFilter
    return matchesSearch && matchesStatus && matchesAgency
  })

  // Get unique agencies for filter dropdown
  const uniqueAgencies = Array.from(new Set(applications.map(app => app.agencyName))).sort()

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
          <CardTitle>Applications Management</CardTitle>
          <CardDescription>
            Review and manage student applications from all agencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agencyFilter} onValueChange={setAgencyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {uniqueAgencies.map((agency) => (
                  <SelectItem key={agency} value={agency}>
                    {agency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applications Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application._id || application.id}>
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
                      <div className="font-medium">{application.agencyName}</div>
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
                      {new Date(application.submittedAt).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {(() => {
                          const currentAppId = application.applicationId || application._id || application.id
                          const filteredDocs = documents.filter(doc => {
                            const docAppId = doc.applicationId
                            return docAppId === currentAppId || docAppId === String(currentAppId)
                          })
                          // Separate academic and other documents
                          const academicDocs = filteredDocs.filter(doc => doc.type?.includes('Marksheet')).slice(0, 4)
                          const otherDocs = filteredDocs.filter(doc => !doc.type?.includes('Marksheet'))
                            .filter((doc, index, self) => index === self.findIndex(d => d.type === doc.type))
                            .slice(0, 7)
                          const appDocs = [...academicDocs, ...otherDocs]
                          return appDocs.length > 0 ? (
                            <div className="space-y-1">
                              {appDocs.slice(0, 3).map((doc: any, index: number) => (
                                <div key={index} className="flex items-center gap-1 text-xs">
                                  <FileText className="h-3 w-3 text-blue-500" />
                                  <span className="truncate max-w-[120px]" title={doc.name}>
                                    {doc.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    {doc.type}
                                  </Badge>
                                </div>
                              ))}
                              {appDocs.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{appDocs.length - 3} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-500">
                              <FileText className="h-3 w-3" />
                              <span className="text-xs">No documents</span>
                            </div>
                          )
                        })()}
                        {application.pendingDocuments && application.pendingDocuments.length > 0 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs">{application.pendingDocuments.length} pending</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingApplication(application)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <PDFViewer
                          applicationId={application._id || application.id}
                          studentName={application.studentName}
                          trigger={
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          }
                        />
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingApplication(application)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDocumentsDialogApplication(application)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download Documents
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateApplicationStatus(application._id || application.id, 'approved')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateApplicationStatus(application._id || application.id, 'rejected')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
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
            onSave={handleApplicationUpdate}
            onClose={() => setEditingApplication(null)}
          />
        </Dialog>
      )}

      {/* Documents Download Dialog */}
      {documentsDialogApplication && (
        <Dialog open={!!documentsDialogApplication} onOpenChange={() => setDocumentsDialogApplication(null)}>
          <DocumentsDownloadDialog
            application={documentsDialogApplication}
            documents={documents}
            onClose={() => setDocumentsDialogApplication(null)}
          />
        </Dialog>
      )}
    </>
  )
}
