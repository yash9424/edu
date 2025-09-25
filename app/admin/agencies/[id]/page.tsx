import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AgencyDetails } from "@/components/admin/agency-details"

interface AgencyPageProps {
  params: { id: string }
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const session = await getSession()
  const { id } = params

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Agency Details" subtitle="View and manage agency information" />

      <div className="container mx-auto px-6 py-8">
        <AgencyDetails agencyId={id} />
      </div>
    </div>
  )
}
