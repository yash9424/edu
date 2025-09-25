import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AgencyHeader } from "@/components/agency/agency-header"
import { AgencySettingsForm } from "@/components/agency/agency-settings-form"

export default async function AgencySettingsPage() {
  const session = await getSession()

  if (!session || (session.role !== "agency" && session.role !== "admin")) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col h-full">
      <AgencyHeader agencyName={session.name} />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-balance">Agency Settings</h1>
          <p className="text-muted-foreground text-pretty">Manage your agency profile and account settings</p>
        </div>

        <div className="max-w-2xl">
          <AgencySettingsForm session={session} />
        </div>
      </div>
    </div>
  </div>
  )
}