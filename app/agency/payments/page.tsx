import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import { AgencyHeader } from "@/components/agency/agency-header"
import { AgencyPaymentStats } from "@/components/agency/agency-payment-stats"
import { PaymentStatusTable } from "@/components/agency/payment-status-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function PaymentsPage() {
  const session = await getSession()

  if (!session || session.role !== "agency") {
    redirect("/login")
  }

  return (
    <div className="flex flex-col h-full">
      <AgencyHeader agencyName={session.name} />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-balance">Payment Management</h1>
            <p className="text-muted-foreground text-pretty">
              Track payment status, lead management, and document verification for your students
            </p>
          </div>
          <Button asChild>
            <a href="/agency/applications/new">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </a>
          </Button>
        </div>

        {/* Payment Statistics */}
        <div className="mb-6">
          <AgencyPaymentStats />
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by student name or ID..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="paid">Payment Received</SelectItem>
              <SelectItem value="verified">Admin Verified</SelectItem>
              <SelectItem value="approved">Payment Approved</SelectItem>
              <SelectItem value="rejected">Payment Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Lead Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New Lead</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="enrolled">Enrolled</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status Table */}
        <PaymentStatusTable />
      </div>
    </div>
  </div>
  )
}
