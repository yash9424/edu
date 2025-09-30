"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentDetailsProps {
  paymentId: string
}

export function PaymentDetails({ paymentId }: PaymentDetailsProps) {
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPaymentDetails()
  }, [paymentId])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPayment(data)
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading payment details...</div>
  }

  if (!payment) {
    return <div>Payment not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Payment ID</label>
              <p className="font-mono">PAY-{payment._id?.slice(-6)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <div>
                <Badge>{payment.paymentStatus}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <p>{payment.studentName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Agency</label>
              <p>{payment.agencyName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">College</label>
              <p>{payment.collegeName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <p className="font-medium">₹{payment.applicationFee}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {payment.documents && Object.keys(payment.documents).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(payment.documents).map(([type, doc]: [string, any]) => (
                <div key={type} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{type}</span>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}