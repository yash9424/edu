"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard } from "lucide-react"

export default function OfflinePaymentsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    beneficiary: "",
    paymentType: "",
    accountHolderName: "",
    transactionId: "",
    amount: "",
    txnDate: "",
    paySlipDocuments: null as File | null
  })

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/agency/payments/offline/list", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    }
  }

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/agency/applications/pending-payments", {
          credentials: "include"
        })
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
      }
    }
    fetchApplications()
    fetchPayments()
  }, [])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Validate required fields
    if (!formData.beneficiary || !formData.paymentType || !formData.accountHolderName || 
        !formData.transactionId || !formData.amount || !formData.txnDate || !formData.paySlipDocuments) {
      setMessage("Please fill in all required fields")
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('beneficiary', formData.beneficiary)
      formDataToSend.append('paymentType', formData.paymentType)
      formDataToSend.append('accountHolderName', formData.accountHolderName)
      formDataToSend.append('transactionId', formData.transactionId)
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('txnDate', formData.txnDate)
      
      if (formData.paySlipDocuments) {
        formDataToSend.append('receiptFile', formData.paySlipDocuments)
      }

      const response = await fetch("/api/agency/payments/offline", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("Payment record saved successfully!")
        setFormData({
          beneficiary: "",
          paymentType: "",
          accountHolderName: "",
          transactionId: "",
          amount: "",
          txnDate: "",
          paySlipDocuments: null
        })
        // Reset file input
        const fileInput = document.getElementById('paySlipDocuments') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        fetchPayments()
      } else {
        setMessage(result.error || "Failed to save payment record")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Offline Payments</h1>
        <p className="text-gray-600">Record offline payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Offline Payment Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="beneficiary">Beneficiary *</Label>
                <Input
                  id="beneficiary"
                  value={formData.beneficiary}
                  onChange={(e) => handleChange("beneficiary", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentType">Type of Payment *</Label>
                <Select value={formData.paymentType} onValueChange={(value) => handleChange("paymentType", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="paymentType" value={formData.paymentType} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => handleChange("accountHolderName", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) => handleChange("transactionId", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="txnDate">Txn. Date *</Label>
                <Input
                  id="txnDate"
                  type="date"
                  value={formData.txnDate}
                  onChange={(e) => handleChange("txnDate", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paySlipDocuments">Pay Slip Documents *</Label>
              <input
                id="paySlipDocuments"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setFormData(prev => ({ ...prev, paySlipDocuments: file }))
                }}
                className="w-full text-sm"
                title="Upload payment receipt document"
                required
              />
              {formData.paySlipDocuments && (
                <p className="text-xs text-green-600">✓ {formData.paySlipDocuments.name}</p>
              )}
            </div>
            
            {message && (
              <div className={`p-3 rounded ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Submit Payment Record"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Saved Offline Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500">No offline payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Beneficiary</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Payment Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Transaction ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Receipt</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="border border-gray-300 px-4 py-2">{payment.beneficiary}</td>
                      <td className="border border-gray-300 px-4 py-2">{payment.paymentType}</td>
                      <td className="border border-gray-300 px-4 py-2">₹{payment.amount}</td>
                      <td className="border border-gray-300 px-4 py-2">{payment.transactionId}</td>
                      <td className="border border-gray-300 px-4 py-2">{new Date(payment.txnDate).toLocaleDateString()}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {payment.receiptFile ? (
                          <a 
                            href={payment.receiptFile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                            title="View payment receipt document"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No file</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                          payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}