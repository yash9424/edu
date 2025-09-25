import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AgencyForm } from "@/components/admin/agency-form"

export default async function NewAgencyPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Add New Agency" subtitle="Register a new agency partner" />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl">
          <AgencyForm />
        </div>
      </div>
    </div>
  )
}
