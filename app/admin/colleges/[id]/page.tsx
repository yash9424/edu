import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { CollegeDetails } from "@/components/admin/college-details"

interface CollegePageProps {
  params: Promise<{ id: string }>
}

export default async function CollegePage({ params }: CollegePageProps) {
  const session = await getSession()
  const { id } = await params

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="College Details" subtitle="View and manage college information" />

      <div className="container mx-auto px-6 py-8">
        <CollegeDetails collegeId={id} />
      </div>
    </div>
  )
}
