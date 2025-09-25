import { Button } from "@/components/ui/button"
import { Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface AgencyHeaderProps {
  agencyName?: string
}

export function AgencyHeader({ agencyName }: AgencyHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-card shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/agency" className="flex items-center gap-2">
              <div className="rounded-full bg-white p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L20 9V21H4V9L12 3Z" fill="var(--primary)" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V15C9 13.8954 9.89543 13 11 13H13C14.1046 13 15 13.8954 15 15V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Agency Portal</h1>
                <p className="text-sm text-muted-foreground font-medium">
                  {agencyName ? (
                    <>Welcome back, <span style={{color: '#16a34a'}} className="text-green-600 font-semibold">{agencyName}</span></>
                  ) : (
                    <>Student Application Management</>
                  )}
                </p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/agency/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
