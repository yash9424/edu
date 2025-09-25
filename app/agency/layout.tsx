import type React from "react"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AgencySidebar } from "@/components/agency/agency-sidebar"

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.role !== "agency") {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-50 agency-portal">
      <AgencySidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}
