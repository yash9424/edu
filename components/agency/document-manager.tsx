"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, Trash2, Upload, File, Edit, FileText, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  status: string
  applicationId: string
  fileData?: string
}

interface Application {
  id: string
  applicationId: string
  studentName: string
  status: string
}

interface RequestedDocument {
  _id: string
  applicationId: string
  studentName: string
  collegeName: string
  courseName: string
  pendingDocuments: string[]
  status: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "default"
    case "pending":
      return "secondary"
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    applicationId: '',
    file: null as File | null
  })
  const [requestedDocsForApp, setRequestedDocsForApp] = useState<string[]>([])
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const [requestedDocuments, setRequestedDocuments] = useState<RequestedDocument[]>([])
  const [showRequestedDocs, setShowRequestedDocs] = useState(false)

  useEffect(() => {
    fetchDocuments()
    fetchApplications()
    const interval = setInterval(fetchDocuments, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/agency/documents', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/agency/applications', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    }
  }

  const fetchRequestedDocuments = async () => {
    try {
      const response = await fetch('/api/agency/requested-documents', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRequestedDocuments(data)
      }
    } catch (error) {
      console.error('Failed to fetch requested documents:', error)
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.type || !uploadForm.applicationId) {
      alert('Please fill all fields')
      return
    }

    setUploading(true)
    try {
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(uploadForm.file!)
      })

      const response = await fetch('/api/agency/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: uploadForm.file.name,
          type: uploadForm.type,
          size: Math.round(uploadForm.file.size / 1024 / 1024 * 100) / 100,
          applicationId: uploadForm.applicationId,
          fileData: fileData
        })
      })

      if (response.ok) {
        await fetchDocuments()
        setShowUpload(false)
        setUploadForm({ name: '', type: '', applicationId: '', file: null })
        setRequestedDocsForApp([])
        toast.success('Document uploaded successfully!')
        fetchRequestedDocuments()
        setShowRequestedDocs(true)
      }
    } catch (error) {
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure?')) return
    
    try {
      const response = await fetch(`/api/agency/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        await fetchDocuments()
        alert('Document deleted successfully!')
      }
    } catch (error) {
      alert('Failed to delete document')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                fetchRequestedDocuments()
                setShowRequestedDocs(true)
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Requested Documents
              </Button>
              <Button onClick={() => {
                setRequestedDocsForApp([])
                setShowUpload(true)
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Application ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No documents uploaded yet</TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.type}</Badge>
                    </TableCell>
                    <TableCell>{doc.size} MB</TableCell>
                    <TableCell className="font-mono">{doc.applicationId}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(doc.status)}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewingDocument(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showUpload} onOpenChange={() => {
        if (!uploading) {
          setShowUpload(false)
          setRequestedDocsForApp([])
        }
      }}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select disabled={uploading} value={uploadForm.type} onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestedDocsForApp.length > 0 ? (
                      requestedDocsForApp.map((doc) => (
                        <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Passport Size Photo">Passport Size Photo</SelectItem>
                        <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                        <SelectItem value="Signature">Signature</SelectItem>
                        <SelectItem value="ABC ID / APAAR ID">ABC ID / APAAR ID</SelectItem>
                        <SelectItem value="DEB ID">DEB ID</SelectItem>
                        <SelectItem value="Fee Receipt">Fee Receipt</SelectItem>
                        <SelectItem value="Any Other Documents">Any Other Documents</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Application ID</Label>
                <Select disabled={uploading} value={uploadForm.applicationId} onValueChange={(value) => setUploadForm(prev => ({ ...prev, applicationId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.applicationId}>
                        {app.applicationId} - {app.studentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select File</Label>
              <Input
                disabled={uploading}
                type="file"
                onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <Button 
                variant="outline" 
                disabled={uploading}
                onClick={() => {
                  setShowUpload(false)
                  setRequestedDocsForApp([])
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="min-w-[140px]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {showRequestedDocs && (
        <Dialog open={showRequestedDocs} onOpenChange={() => setShowRequestedDocs(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Requested Documents by Admin</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto p-2">
              {requestedDocuments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No document requests found</p>
              ) : (
                <div className="space-y-4">
                  {requestedDocuments.map((req) => (
                    <Card key={req._id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Application ID</Label>
                          <p className="font-mono text-sm">{req.applicationId}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Student Name</Label>
                          <p className="font-medium">{req.studentName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">College</Label>
                          <p className="text-sm">{req.collegeName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Course</Label>
                          <p className="text-sm">{req.courseName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <Badge variant={getStatusColor(req.status)} className="text-xs">{req.status}</Badge>
                        </div>
                        <div className="md:col-span-1">
                          <Label className="text-xs text-muted-foreground">Requested Documents</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {req.pendingDocuments.map((doc, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setUploadForm(prev => ({ 
                              ...prev, 
                              applicationId: req.applicationId,
                              type: req.pendingDocuments[0] || ''
                            }))
                            setRequestedDocsForApp(req.pendingDocuments)
                            setShowUpload(true)
                            setShowRequestedDocs(false)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}