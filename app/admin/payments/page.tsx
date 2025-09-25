import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { PaymentStats } from "@/components/admin/payment-stats"
import { PaymentTable } from "@/components/admin/payment-table"
import { MigratePaymentsButton } from "@/components/admin/migrate-payments-button"
import { SyncPaymentsButton } from "@/components/admin/sync-payments-button"

export default async function PaymentsPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Payment Approval System" subtitle="Monitor payments and agency commissions" />

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Payment Statistics */}
          <PaymentStats />

          {/* Filters and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search payments..." className="pl-10 w-80" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SyncPaymentsButton />
              <MigratePaymentsButton />
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Payment Table */}
          <Suspense fallback={<div>Loading...</div>}>
            <PaymentTable />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
