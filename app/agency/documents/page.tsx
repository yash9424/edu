import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AgencyHeader } from "@/components/agency/agency-header"
import { DocumentManager } from "@/components/agency/document-manager"

export default async function DocumentsPage() {
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
          <h1 className="text-2xl font-bold text-balance">Document Management</h1>
          <p className="text-muted-foreground text-pretty">Upload and manage student documents</p>
        </div>

        <DocumentManager />
      </div>
    </div>
  </div>
  )
}
