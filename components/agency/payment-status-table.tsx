"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  DollarSign, 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  User,
  Pencil
} from "lucide-react"
import { PayNowButton } from "./pay-now-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"



interface DocumentInfo {
  status: string
  uploadedAt: string | null
  adminRequested: boolean
}

// Define interfaces for type safety
interface Student {
  id: string
  studentId: string
  studentName: string
  email: string
  phone: string
  college: string
  course: string
  applicationFee: number
  tuitionFee: number
  paymentAmount: number
  paymentDate: string | null
  paymentStatus: string
  adminVerifying?: boolean
  leadStatus: string
  submittedAt: string
  lastContact: string
  documents: Record<string, DocumentInfo>
  notes: string
  commissionAmount?: number
}



const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending", variant: "secondary" as const, icon: Clock }
      case "pending_approval":
        return { label: "Pending Approval", variant: "outline" as const, icon: AlertCircle }
      case "paid":
        return { label: "Paid", variant: "default" as const, icon: CheckCircle }
      case "verified":
        return { label: "Verified", variant: "default" as const, icon: CheckCircle }
      case "approved":
        return { label: "Approved", variant: "default" as const, icon: CheckCircle }
      case "rejected":
        return { label: "Rejected", variant: "destructive" as const, icon: XCircle }
      case "failed":
        return { label: "Failed", variant: "destructive" as const, icon: XCircle }
      default:
        return { label: status, variant: "secondary" as const, icon: Clock }
    }
  }

const getLeadStatusConfig = (status: string) => {
  switch (status) {
    case "new":
      return { label: "New Lead", variant: "secondary" as const }
    case "contacted":
      return { label: "Contacted", variant: "outline" as const }
    case "interested":
      return { label: "Interested", variant: "default" as const }
    case "applied":
      return { label: "Applied", variant: "default" as const }
    case "enrolled":
      return { label: "Enrolled", variant: "default" as const }
    case "dropped":
      return { label: "Dropped", variant: "destructive" as const }
    default:
      return { label: status, variant: "secondary" as const }
  }
}

const getDocumentStatusConfig = (status: string) => {
  switch (status) {
    case "uploaded":
      return { label: "Uploaded", variant: "default" as const, icon: CheckCircle }
    case "pending":
      return { label: "Pending", variant: "secondary" as const, icon: Clock }
    case "missing":
      return { label: "Missing", variant: "destructive" as const, icon: XCircle }
    default:
      return { label: status, variant: "secondary" as const, icon: AlertCircle }
  }
}

export function PaymentStatusTable() {
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [leadStatus, setLeadStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [updating, setUpdating] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch payment data from API
  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agency/payments', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPaymentData(data || [])
      } else {
        console.error('Failed to fetch payments')
        setPaymentData([])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPaymentData([])
    } finally {
      setLoading(false)
    }
  }
  


  const handleViewDetails = async (student: any) => {
    // Fetch the latest data for this student before showing details
    try {
      const response = await fetch(`/api/agency/payments/${student.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedStudent(data.payment || student)
      } else {
        setSelectedStudent(student)
      }
    } catch (error) {
      console.error('Error fetching student details:', error)
      setSelectedStudent(student)
    }
    
    setIsDetailsOpen(true)
  }

  const handleUpdatePayment = (student: any) => {
    setSelectedStudent(student)
    setPaymentAmount(student.applicationFee.toString())
    setLeadStatus(student.leadStatus)
    setNotes(student.notes)
    setIsUpdateOpen(true)
  }

  const handleSaveUpdate = async () => {
    if (!selectedStudent) return
    
    try {
      setUpdating(true)
      
      // Create updated payment object
      const updatedPayment = {
        ...selectedStudent,
        paymentAmount: parseFloat(paymentAmount),
        leadStatus,
        notes
      }
      
      // Update local state immediately for better UX
      setPaymentData(prev => prev.map(payment => 
        payment._id === selectedStudent._id 
          ? updatedPayment
          : payment
      ))
      
      setIsUpdateOpen(false)
    } catch (error) {
      console.error('Error updating payment:', error)
    } finally {
      setUpdating(false)
    }
  }

  // Add handler to mark payment success/failure from agency side
  const handleChangePaymentStatus = async (student: any, newStatus: 'paid' | 'failed') => {
    try {
      console.log('Marking payment as:', newStatus, 'for student:', student._id)
      
      const res = await fetch('/api/agency/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentId: student._id,
          paymentStatus: newStatus
        })
      })

      if (res.ok) {
        await fetchPayments()
      } else {
        console.error('Failed to update payment status')
      }
    } catch (err) {
      console.error('Error updating payment status:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Status & Lead Management ({paymentData.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading payments...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Student Details</TableHead>
                  <TableHead className="min-w-[180px]">College & Course</TableHead>
                  <TableHead className="min-w-[140px]">Payment Status</TableHead>
                  <TableHead className="min-w-[120px]">Lead Status</TableHead>
                  <TableHead className="min-w-[160px]">Amount</TableHead>
                  <TableHead className="min-w-[120px]">Documents</TableHead>
                  <TableHead className="min-w-[100px]">Last Contact</TableHead>
                  <TableHead className="min-w-[120px]">Pay Online</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {paymentData.map((student) => {
                const paymentConfig = getPaymentStatusConfig(student.paymentStatus)
                const leadConfig = getLeadStatusConfig(student.leadStatus)
                const PaymentIcon = paymentConfig.icon
                
                const documents = student.documents || {}
                const documentEntries = Object.entries(documents)
                const uploadedDocs = documentEntries.filter(([_, doc]: [string, any]) => doc.status === "uploaded").length
                const totalDocs = documentEntries.length || 4 // Default to 4 document types
                const requestedDocs = documentEntries.filter(([_, doc]: [string, any]) => doc.adminRequested).length

                return (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-balance">{student.studentName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-balance">{student.collegeName}</div>
                        <div className="text-sm text-muted-foreground">{student.courseName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusConfig(student.paymentStatus).variant} className="flex items-center gap-1 w-fit">
                        {React.createElement(getPaymentStatusConfig(student.paymentStatus).icon, { className: "h-3 w-3" })}
                        <span>{getPaymentStatusConfig(student.paymentStatus).label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={leadConfig.variant}>{leadConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{student.applicationFee || 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {uploadedDocs}/{totalDocs} uploaded
                        </div>
                        {requestedDocs > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {requestedDocs} requested
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {isClient ? new Date(student.lastContact).toLocaleDateString('en-US') : student.lastContact}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PayNowButton 
                        student={student}
                        disabled={student.paymentStatus === 'verified' || student.paymentStatus === 'approved'}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdatePayment(student)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Payment
                          </DropdownMenuItem>
                          {/* Add agency actions to mark success/failure */}
                          {student.paymentStatus === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleChangePaymentStatus(student, 'paid')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangePaymentStatus(student, 'failed')}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Mark as Failed
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem asChild>
                            <a href="#">
                              <FileText className="h-4 w-4 mr-2" />
                              View Documents
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href="#">
                              <User className="h-4 w-4 mr-2" />
                              Contact Student
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Student Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details - {selectedStudent?.studentName}</DialogTitle>
            <DialogDescription>
              Complete information and document status for this student
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="grid gap-6">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {selectedStudent.studentName}</div>
                    <div><strong>Email:</strong> {selectedStudent.email}</div>
                    <div><strong>Phone:</strong> {selectedStudent.phone}</div>
                    <div><strong>Student ID:</strong> {selectedStudent._id}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>College:</strong> {selectedStudent.collegeName}</div>
                    <div><strong>Course:</strong> {selectedStudent.courseName}</div>
                    <div><strong>Submitted:</strong> {isClient ? new Date(selectedStudent.submittedAt).toLocaleDateString('en-US') : selectedStudent.submittedAt}</div>
                    <div><strong>Last Contact:</strong> {isClient ? new Date(selectedStudent.lastContact).toLocaleDateString('en-US') : selectedStudent.lastContact}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Application Fee</div>
                    <div className="text-2xl font-bold">₹{selectedStudent.applicationFee}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tuition Fee</div>
                    <div className="text-2xl font-bold">₹{selectedStudent.tuitionFee}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Amount</div>
                    <div className="text-2xl font-bold">₹{selectedStudent.paymentAmount > 0 ? selectedStudent.paymentAmount : 0}</div>
                    {selectedStudent.paymentDate && (
                      <div className="text-sm text-muted-foreground">Paid on: {isClient ? new Date(selectedStudent.paymentDate).toLocaleDateString('en-US') : selectedStudent.paymentDate}</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Document Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStudent.documents && Object.keys(selectedStudent.documents).length > 0 ? (
                      Object.entries(selectedStudent.documents).map(([docType, docInfo]: [string, any]) => {
                        const docConfig = getDocumentStatusConfig(docInfo.status)
                        const DocIcon = docConfig.icon
                        
                        return (
                          <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium capitalize">{docType.replace('_', ' ')}</div>
                                {docInfo.uploadedAt && (
                                  <div className="text-sm text-muted-foreground">
                                    Uploaded: {isClient ? new Date(docInfo.uploadedAt).toLocaleDateString('en-US') : docInfo.uploadedAt}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {docInfo.adminRequested && (
                                <Badge variant="outline" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Requested
                                </Badge>
                              )}
                              <Badge variant={docConfig.variant} className="flex items-center gap-1">
                                <DocIcon className="h-3 w-3" />
                                {docConfig.label}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      ['passport', 'transcript', 'sop', 'ielts'].map((docType) => {
                        const docConfig = getDocumentStatusConfig('missing')
                        const DocIcon = docConfig.icon
                        
                        return (
                          <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium capitalize">{docType.replace('_', ' ')}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={docConfig.variant} className="flex items-center gap-1">
                                <DocIcon className="h-3 w-3" />
                                {docConfig.label}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedStudent.notes}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Payment Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update payment amount and lead status for {selectedStudent?.studentName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lead-status">Lead Status</Label>
              <Select value={leadStatus} onValueChange={setLeadStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this student..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUpdate} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}