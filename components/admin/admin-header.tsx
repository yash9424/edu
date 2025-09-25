import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"

interface AdminHeaderProps {
  title: string
  subtitle: string
  showBack?: boolean
  backLink?: string
}

export function AdminHeader({ title, subtitle, showBack = true, backLink = "/admin" }: AdminHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {showBack && (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <a href={backLink} className="flex items-center justify-center">
                  <ArrowLeft className="h-4 w-4" />
                </a>
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-balance">{title}</h1>
              <p className="text-sm text-muted-foreground text-pretty">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <a href="/admin/settings" className="flex items-center justify-center">
                <Settings className="h-4 w-4" />
              </a>
            </Button>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="sm" type="submit" className="h-8 px-3">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
