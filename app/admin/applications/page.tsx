import { Suspense } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { ApplicationsTable } from "@/components/admin/applications-table"
import { ApplicationStats } from "@/components/admin/application-stats"

export default function AdminApplicationsPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Applications Management"
        description="Review and manage student applications from all agencies"
      />

      <ApplicationStats />

      <Suspense fallback={<div>Loading applications...</div>}>
        <ApplicationsTable />
      </Suspense>
    </div>
  )
}
