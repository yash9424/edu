"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Download } from "lucide-react"

export default function AdminOfflinePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments/offline", {
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

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/payments/offline", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ paymentId, status }),
      })

      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error("Error updating payment:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = (receiptFile: string, paymentId: string) => {
    const a = document.createElement('a')
    a.href = receiptFile
    a.download = `receipt-${paymentId}${receiptFile.substring(receiptFile.lastIndexOf('.'))}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Offline Payments Management</h1>
        <p className="text-gray-600">Review and approve offline payment submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Offline Payment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500">No offline payments submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Agency Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Beneficiary</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Payment Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Transaction ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Receipt</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="border border-gray-300 px-4 py-2">{payment.agencyEmail}</td>
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
                          >
                            View
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
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updatePaymentStatus(payment._id, 'approved')}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updatePaymentStatus(payment._id, 'rejected')}
                                disabled={loading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {payment.receiptFile && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadReceipt(payment.receiptFile, payment._id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
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