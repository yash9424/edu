import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Clock, CheckCircle, Users, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgencyHeader } from "@/components/agency/agency-header"
import { ApplicationStats } from "@/components/agency/application-stats"
import { RecentApplications } from "@/components/agency/recent-applications"
import { RecentActivity } from "@/components/agency/recent-activity"
import { EscalationMatrixDisplay } from "@/components/agency/escalation-matrix-display"
import { BankingDetailsDisplay } from "@/components/agency/banking-details-display"

export default async function AgencyDashboard() {
  const session = await getSession()

  if (!session || session.role !== "agency") {
    redirect("/login")
  }

  return (
    <div className="flex flex-col h-full">
      <AgencyHeader agencyName={session.name} />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Welcome Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-balance">
                    <span style={{ color: "white" }}>Welcome back, </span>
                    <div style={{ display: "inline-block" }}>{session.name}</div>
                  </CardTitle>
                  <p className="text-muted-foreground text-pretty">
                    <span style={{ color: "white" }}>Manage your student applications and track their progress</span>
                  </p>
                </div>
                <Button asChild size="lg">
                  <a href="/agency/applications/new">
                    <Plus className="h-4 w-4 mr-2" />
                    <span style={{ color: "white" }}>New Application</span>
                  </a>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Application Statistics */}
          <ApplicationStats />

          {/* Recent Applications */}
          <RecentApplications />

          {/* Recent Activity */}
          <RecentActivity />

          {/* Support & Banking Information */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Escalation Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span style={{ color: "white" }}>Escalation Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EscalationMatrixDisplay />
              </CardContent>
            </Card>

            {/* Banking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span style={{ color: "white" }}>Account Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BankingDetailsDisplay />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle><span style={{ color: "white" }}>Quick Actions</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
                  <a href="/agency/applications/new">
                    <Plus className="h-6 w-6" />
                    <span style={{ color: "white" }}>Submit New Application</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
                  <a href="/agency/applications">
                    <FileText className="h-6 w-6" />
                    <span style={{ color: "white" }}>View All Applications</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
                  <a href="/agency/applications?status=pending">
                    <Clock className="h-6 w-6" />
                    <span style={{ color: "white" }}>Pending Applications</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
                  <a href="/agency/applications?status=approved">
                    <CheckCircle className="h-6 w-6" />
                    <span style={{ color: "white" }}>Approved Applications</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
  )
}
