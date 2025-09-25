"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, Trash2, Upload, File, Edit } from "lucide-react"
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
  const [showUpload, setShowUpload] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    applicationId: '',
    file: null as File | null
  })
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments()
    fetchApplications()
    // Auto-refresh every 2 seconds
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

  const handleUpload = async () => {
    if (!uploadForm.file) {
      alert('Please select a file')
      return
    }
    if (!uploadForm.type) {
      alert('Please select document type')
      return
    }
    if (!uploadForm.applicationId) {
      alert('Please enter Application ID')
      return
    }

    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          console.log('File converted to base64, length:', (reader.result as string).length)
          resolve(reader.result as string)
        }
        reader.readAsDataURL(uploadForm.file!)
      })
      
      console.log('Uploading file with data length:', fileData.length)

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
        const result = await response.json()
        console.log('Upload response:', result)
        await fetchDocuments()
        setShowUpload(false)
        setUploadForm({ name: '', type: '', applicationId: '', file: null })
        alert('Document uploaded successfully!')
      } else {
        const error = await response.text()
        console.error('Upload failed:', error)
      }
    } catch (error) {
      alert('Failed to upload document')
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
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

  const handleEdit = async () => {
    if (!editingDocument) return
    
    try {
      const response = await fetch(`/api/agency/documents/${editingDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: editingDocument.type,
          applicationId: editingDocument.applicationId
        })
      })
      
      if (response.ok) {
        await fetchDocuments()
        setEditingDocument(null)
        alert('Document updated successfully!')
      }
    } catch (error) {
      alert('Failed to update document')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Management</CardTitle>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
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
                <TableHead className="w-[100px]">Actions</TableHead>
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
                        <Button variant="ghost" size="sm" onClick={() => {
                          const link = document.createElement('a')
                          link.href = `data:text/plain;charset=utf-8,Document: ${doc.name}`
                          link.download = doc.name
                          link.click()
                        }}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingDocument(doc)}>
                          <Edit className="h-4 w-4" />
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

      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select value={uploadForm.type} onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhar">Aadhar Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="transcript">Transcript</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Application ID</Label>
                <Select value={uploadForm.applicationId} onValueChange={(value) => setUploadForm(prev => ({ ...prev, applicationId: value }))}>
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
            <div>
              <Label>Select File</Label>
              <Input
                type="file"
                onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleUpload}>
                Upload Document
              </Button>
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* View Document Dialog */}
      {viewingDocument && (
        <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Document Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Document Name</Label>
                  <p>{viewingDocument.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Type</Label>
                  <p className="capitalize">{viewingDocument.type}</p>
                </div>
                <div>
                  <Label className="font-semibold">Size</Label>
                  <p>{viewingDocument.size} MB</p>
                </div>
                <div>
                  <Label className="font-semibold">Application ID</Label>
                  <p className="font-mono">{viewingDocument.applicationId}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge variant={getStatusColor(viewingDocument.status)}>{viewingDocument.status}</Badge>
                </div>
                <div>
                  <Label className="font-semibold">Uploaded Date</Label>
                  <p>{new Date(viewingDocument.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Document Preview */}
              <div className="mt-6">
                <Label className="font-semibold">Document Preview</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 min-h-[300px] flex items-center justify-center">
                  {viewingDocument.fileData && viewingDocument.fileData.startsWith('data:') ? (
                    <img 
                      src={viewingDocument.fileData} 
                      alt={viewingDocument.name}
                      className="max-w-full max-h-[250px] object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <File className="h-16 w-16 mx-auto mb-2" />
                      <p>Upload a new document to see preview</p>
                      <p className="text-xs mt-2">Current document may not have preview data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Document Dialog */}
      {editingDocument && (
        <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Document Type</Label>
                <Select value={editingDocument.type} onValueChange={(value) => setEditingDocument(prev => prev ? { ...prev, type: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhar">Aadhar Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="transcript">Transcript</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Application ID</Label>
                <Select value={editingDocument.applicationId} onValueChange={(value) => setEditingDocument(prev => prev ? { ...prev, applicationId: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="flex gap-3">
                <Button onClick={handleEdit}>
                  Update Document
                </Button>
                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
