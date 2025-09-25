"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock, FileText, CreditCard, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PDFViewer from "@/components/pdf-viewer"
import { UniversalPaymentLinkEditor } from "./universal-payment-link-editor"

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
    case "verified":
    case "paid":
      return "default"
    case "pending":
      return "secondary"
    case "pending_approval":
      return "outline"
    case "failed":
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
    case "verified":
    case "paid":
      return <CheckCircle className="h-3 w-3" />
    case "pending":
      return <Clock className="h-3 w-3" />
    case "failed":
    case "rejected":
      return <XCircle className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

export function PaymentTable() {
  const [payments, setPayments] = useState([])
  const [applications, setApplications] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    paymentAmount: '',
    leadStatus: '',
    notes: ''
  })
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  
  useEffect(() => {
    fetchPayments()
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
  
  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payments', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true)
      const [appsResponse, paymentsResponse] = await Promise.all([
        fetch('/api/admin/applications', { credentials: 'include' }),
        fetch('/api/admin/payments', { credentials: 'include' })
      ])
      
      if (appsResponse.ok && paymentsResponse.ok) {
        const appsData = await appsResponse.json()
        const paymentsData = await paymentsResponse.json()
        
        const allApps = appsData.applications || []
        const existingPayments = paymentsData.payments || []
        
        const appsWithoutPayments = allApps.filter(app => 
          app.status === 'approved' && 
          !existingPayments.some(payment => 
            payment.applicationId?._id === app.id || 
            payment.applicationId === app.id ||
            payment.applicationId?._id === app._id ||
            payment.applicationId === app._id
          )
        )
        setApplications(appsWithoutPayments)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setApplicationsLoading(false)
    }
  }

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentId, paymentStatus: newStatus })
      })
      
      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Failed to update payment status:', error)
    }
  }

  const handleAdminApproval = async (paymentId: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentId, paymentStatus: 'approved' })
      })
      
      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Failed to approve payment:', error)
    }
  }

  const handleCreatePaymentRecord = async (applicationId: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ applicationId })
      })
      
      if (response.ok) {
        await Promise.all([fetchPayments(), fetchApplications()])
      }
    } catch (error) {
      console.error('Failed to create payment record:', error)
    }
  }

  const handleDocumentRequest = async (paymentId: string, documentName: string) => {
    console.log(`Requesting document ${documentName} for payment ${paymentId}`)
  }

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment)
    setEditFormData({
      paymentAmount: payment.applicationFee?.toString() || '',
      leadStatus: payment.leadStatus || 'applied',
      notes: payment.notes || ''
    })
    setEditDialogOpen(true)
  }

  const handleSaveUpdate = async () => {
    if (!selectedPayment) return

    try {
      const updatedPayment = {
        ...selectedPayment,
        applicationFee: parseFloat(editFormData.paymentAmount) || selectedPayment.applicationFee,
        leadStatus: editFormData.leadStatus,
        notes: editFormData.notes
      }

      // Update local state immediately for better UX
      setPayments(prev => prev.map((p: any) => 
        p._id === selectedPayment._id ? updatedPayment : p
      ))

      console.log('Updating payment:', updatedPayment)
      setEditDialogOpen(false)

      // Make API call to update payment
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          paymentAmount: parseFloat(editFormData.paymentAmount),
          leadStatus: editFormData.leadStatus,
          notes: editFormData.notes
        })
      })

      if (response.ok) {
        console.log('Payment updated successfully')
        // Refresh the payments list
        fetchPayments()
      } else {
        console.error('Failed to update payment')
        // Revert local state if API call failed
        setPayments(prev => prev.map((p: any) => 
          p._id === selectedPayment._id ? selectedPayment : p
        ))
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      // Revert local state if error occurred
      setPayments(prev => prev.map((p: any) => 
        p._id === selectedPayment._id ? selectedPayment : p
      ))
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "uploaded":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
      case "missing":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="universal-payment-link">Universal Payment Link</Label>
              <p className="text-sm text-muted-foreground mb-2">
                This URL will be used automatically by all payment buttons across the application
              </p>
              <UniversalPaymentLinkEditor />
            </div>
          </div>
        </CardContent>
      </Card>


      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Payment Records ({payments.length})</TabsTrigger>
          <TabsTrigger value="applications">Pending Applications ({applications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const documents = Object.entries(payment.documents || {}).map(([type, doc]: [string, any]) => ({
                  id: type,
                  name: `${type}.pdf`,
                  status: doc.status
                }))
                
                return (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div className="font-mono text-sm">PAY-{payment._id.slice(-6)}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-balance">{payment.studentName}</div>
                        <div className="text-sm text-muted-foreground">{payment.applicationId?.applicationId || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-balance">{payment.agencyName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-balance">{payment.collegeName}</div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="font-medium cursor-pointer hover:text-blue-600 flex items-center gap-1"
                        onClick={() => handleEditPayment(payment)}
                      >
                        ₹{payment.applicationFee}
                        <Edit className="h-3 w-3 opacity-50" />
                      </div>
                      <div className="text-xs text-muted-foreground">{payment.paymentMethod || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getStatusColor(payment.paymentStatus)} className="gap-1">
                          {getStatusIcon(payment.paymentStatus)}
                          {payment.paymentStatus}
                        </Badge>
                        {payment.agencyApproved && (
                          <Badge variant="outline" className="gap-1">
                            Agency Approved
                          </Badge>
                        )}
                        {payment.verifiedAt && (
                          <Badge variant="default" className="gap-1">
                            Admin Approved
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {(() => {
                          const paymentDocs = documents.filter(doc => 
                            doc.applicationId === (payment.applicationId?.applicationId || payment.applicationId || payment._id)
                          )
                          return paymentDocs.length > 0 ? (
                            <div className="space-y-1">
                              {paymentDocs.slice(0, 3).map((doc) => (
                                <div key={doc.id} className="flex items-center gap-1">
                                  <Badge variant={getDocumentStatusColor(doc.status)} className="text-xs">
                                    {doc.status}
                                  </Badge>
                                  <span className="text-xs truncate max-w-[100px]">{doc.name}</span>
                                </div>
                              ))}
                              {paymentDocs.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{paymentDocs.length - 3} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleDocumentRequest(payment._id, "Required Documents")}>
                              Request Documents
                            </Button>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString('en-US')
                          : new Date(payment.createdAt).toLocaleDateString('en-US')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={`/admin/payments/${payment._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </a>
                          </DropdownMenuItem>
                          {payment.paymentStatus === 'pending_approval' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(payment._id, 'paid')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Payment
                            </DropdownMenuItem>
                          )}
                          {payment.paymentStatus === 'pending_approval' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(payment._id, 'rejected')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Payment
                            </DropdownMenuItem>
                          )}
                          {/* Admin can verify when marked paid but not verified/approved */}
                          {payment.paymentStatus === 'paid' && !payment.verifiedAt && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(payment._id, 'verified')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verify Payment
                            </DropdownMenuItem>
                          )}
                          {payment.paymentStatus === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(payment._id, "paid")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(payment._id, "failed")}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Mark as Failed
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Documents
                          </DropdownMenuItem>
                          <PDFViewer
                            applicationId={payment.applicationId?._id || payment.applicationId}
                            studentName={payment.studentName}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate PDF
                              </DropdownMenuItem>
                            }
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Approved Applications Awaiting Payment Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No approved applications awaiting payment setup
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="font-mono text-sm">{application.applicationId || application.id.slice(-6)}</div>
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
                          <div className="text-sm">{application.collegeName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{application.courseName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₹{application.fees?.toLocaleString() || '0'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => handleCreatePaymentRecord(application.id)}
                            className="gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Setup Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentAmount" className="text-right">
                Amount
              </Label>
              <Input
                id="paymentAmount"
                type="number"
                value={editFormData.paymentAmount}
                onChange={(e) => setEditFormData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                className="col-span-3"
                placeholder="Enter payment amount"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leadStatus" className="text-right">
                Status
              </Label>
              <Select
                value={editFormData.leadStatus}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, leadStatus: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="col-span-3"
                placeholder="Add notes..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUpdate}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}