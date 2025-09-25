import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AgencyHeader } from "@/components/agency/agency-header"
import ApplicationTable from "@/components/agency/application-table"

export default async function ApplicationsPage() {
  const session = await getSession()

  if (!session || (session.role !== "agency" && session.role !== "admin")) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col h-full">
      <AgencyHeader agencyName={session.name} />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-balance">Student Applications</h1>
            <p className="text-muted-foreground text-pretty">Manage and track all your student applications</p>
          </div>
          <Button asChild>
            <a href="/agency/applications/new">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applications..." className="pl-10 w-80" />
          </div>
        </div>

        <ApplicationTable />
      </div>
    </div>
  </div>
  )
}
