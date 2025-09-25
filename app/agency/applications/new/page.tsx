import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AgencyHeader } from "@/components/agency/agency-header"
import { ApplicationForm } from "@/components/agency/application-form"

export default async function NewApplicationPage() {
  const session = await getSession()

  if (!session || session.role !== "agency") {
    redirect("/login")
  }

  return (
    <div className="flex flex-col h-full">
      <AgencyHeader agencyName={session.name} />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-balance">Submit New Application</h1>
          <p className="text-muted-foreground text-pretty">Fill out the student application form</p>
        </div>

        <ApplicationForm />
      </div>
    </div>
  </div>
  )
}
