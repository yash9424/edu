import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { CollegeForm } from "@/components/admin/college-form"

export default async function NewCollegePage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Add New College" subtitle="Register a new partner college or university" />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl">
          <CollegeForm />
        </div>
      </div>
    </div>
  )
}
