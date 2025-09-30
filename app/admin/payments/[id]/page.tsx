import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { PaymentDetails } from "@/components/admin/payment-details"

export default async function PaymentDetailsPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Payment Details"
        description="View detailed payment information"
      />
      
      <PaymentDetails paymentId={params.id} />
    </div>
  )
}