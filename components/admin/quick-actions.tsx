import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, FileText, CreditCard, Download, UserPlus } from "lucide-react"
import Link from "next/link"

const quickActions = [
  {
    title: "Manage Agencies",
    description: "View and manage agency partners",
    icon: Users,
    href: "/admin/agencies",
    action: "View All",
  },
  {
    title: "College Management",
    description: "Add and manage college profiles",
    icon: Building2,
    href: "/admin/colleges",
    action: "Manage",
  },
  {
    title: "Applications",
    description: "Review student applications",
    icon: FileText,
    href: "/admin/applications",
    action: "Review",
  },
  {
    title: "Payment Tracking",
    description: "Monitor payments and commissions",
    icon: CreditCard,
    href: "/admin/payments",
    action: "Track",
  },
  {
    title: "Add New Agency",
    description: "Register a new agency partner",
    icon: UserPlus,
    href: "/admin/agencies/new",
    action: "Add",
    variant: "default" as const,
  },
  {
    title: "Generate Reports",
    description: "Export analytics and reports",
    icon: Download,
    href: "/admin/reports",
    action: "Export",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used administrative functions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <div
                key={action.title}
                className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-balance">{action.title}</h3>
                    <p className="text-xs text-muted-foreground text-pretty">{action.description}</p>
                  </div>
                </div>
                <Button variant={action.variant || "outline"} size="sm" className="ml-4" asChild>
                  <Link href={action.href}>{action.action}</Link>
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
