"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, DollarSign } from "lucide-react"

// Mock commission history for the agency
const commissionHistory = [
  {
    id: "COM-001",
    studentName: "John Smith",
    college: "Harvard University",
    applicationFee: 500,
    commissionAmount: 75,
    status: "paid",
    paidAt: "2024-01-15",
    applicationDate: "2024-01-10",
  },
  {
    id: "COM-002",
    studentName: "Sarah Johnson",
    college: "Stanford University",
    applicationFee: 750,
    commissionAmount: 112.5,
    status: "paid",
    paidAt: "2024-01-12",
    applicationDate: "2024-01-08",
  },
  {
    id: "COM-003",
    studentName: "Michael Brown",
    college: "MIT",
    applicationFee: 600,
    commissionAmount: 90,
    status: "pending",
    paidAt: null,
    applicationDate: "2024-01-14",
  },
  {
    id: "COM-004",
    studentName: "Emily Davis",
    college: "Oxford University",
    applicationFee: 800,
    commissionAmount: 120,
    status: "pending",
    paidAt: null,
    applicationDate: "2024-01-16",
  },
]

const getStatusColor = (status: string) => {
  return status === "paid" ? "default" : "secondary"
}

const getStatusIcon = (status: string) => {
  return status === "paid" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />
}

export function AgencyCommissionHistory() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const totalCommission = commissionHistory.reduce((sum, commission) => sum + commission.commissionAmount, 0)
  const paidCommission = commissionHistory
    .filter(commission => commission.status === 'paid')
    .reduce((sum, commission) => sum + commission.commissionAmount, 0)
  const pendingCommission = totalCommission - paidCommission

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Commission History ({commissionHistory.length})</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Paid: ₹{paidCommission.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Pending: ₹{pendingCommission.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commission ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Application Fee</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissionHistory.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell>
                  <div className="font-mono text-sm">{commission.id}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-balance">{commission.studentName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-balance">{commission.college}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">₹{commission.applicationFee}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-primary" />
                    <span className="font-medium text-primary">₹{commission.commissionAmount}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(commission.status)} className="gap-1">
                    {getStatusIcon(commission.status)}
                    {commission.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {commission.paidAt
                      ? (isClient ? new Date(commission.paidAt).toLocaleDateString() : commission.paidAt)
                      : (isClient ? new Date(commission.applicationDate).toLocaleDateString() : commission.applicationDate)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
