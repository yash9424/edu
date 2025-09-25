import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AgencyTable } from "@/components/admin/agency-table"
import { AdminHeader } from "@/components/admin/admin-header"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Loading skeleton for the agency table
function AgencyTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default async function AgenciesPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Agency Management" subtitle="Manage your agency partners" />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search agencies..." className="pl-10 w-80" />
            </div>
          </div>
        </div>

        <Suspense fallback={<AgencyTableSkeleton />}>
          <AgencyTable />
        </Suspense>
      </div>
    </div>
  )
}
