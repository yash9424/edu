import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AgencyForm } from "@/components/admin/agency-form"
import { dataStore } from "@/lib/data-store"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface EditAgencyPageProps {
  params: {
    id: string
  }
}

// Separate component for loading agency data
async function AgencyFormWrapper({ id }: { id: string }) {
  // Validate ID format first to avoid unnecessary data fetching
  if (!id || id.trim() === '') {
    console.error('Invalid agency ID format:', id)
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
        <p>Invalid agency ID. Please check the URL and try again.</p>
        <a href="/admin/agencies" className="underline mt-2 inline-block">Return to agencies list</a>
      </div>
    )
  }

  // Get agency data with a timeout to prevent hanging
  const agencyPromise = Promise.race([
    await dataStore.getAgency(id),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Agency data fetch timeout')), 8000) // Increased timeout
    )
  ])
  
  try {
    const agency = await agencyPromise as any
    
    if (!agency) {
      console.error('Agency not found:', id)
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
          <p>Agency not found. The requested agency may have been deleted or does not exist.</p>
          <a href="/admin/agencies" className="underline mt-2 inline-block">Return to agencies list</a>
        </div>
      )
    }
    
    return <AgencyForm agency={agency} isEdit={true} />
  } catch (error) {
    console.error('Error loading agency:', error)
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
        <p>Error loading agency data. Please try again.</p>
        <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <a href="/admin/agencies" className="underline mt-2 inline-block">Return to agencies list</a>
      </div>
    )
  }
}

export default async function EditAgencyPage({ params }: EditAgencyPageProps) {
  const session = await getSession()
  const { id } = params

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Edit Agency" subtitle="Update agency information" />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl">
          <Suspense fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          }>
            <AgencyFormWrapper id={id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}