"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Upload, CreditCard, Settings, LogOut, GraduationCap, ChevronRight, X } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/agency",
    icon: LayoutDashboard,
  },
  {
    name: "Applications",
    href: "/agency/applications",
    icon: FileText,
  },
  {
    name: "Documents",
    href: "/agency/documents",
    icon: Upload,
  },
  {
    name: "Payments",
    href: "/agency/payments",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/agency/settings",
    icon: Settings,
  },
]

export function AgencySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className={cn(
      "bg-white shadow-lg h-full transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "flex items-center h-16 bg-green-600 text-white border-b border-green-700",
          isCollapsed ? "px-3 py-4 justify-center" : "px-6 py-4"
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "space-x-0" : "space-x-3"
          )}>
            <div className={cn(
              "bg-green-700 rounded-lg flex items-center justify-center",
              isCollapsed ? "w-10 h-10" : "w-8 h-8"
            )}>
              <GraduationCap className={cn(
                "text-white",
                isCollapsed ? "w-6 h-6" : "w-5 h-5"
              )} />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-white">EduManage</h1>
                <p className="text-sm text-green-200">Agency Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - Positioned on middle right edge */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-10 p-0 h-8 w-8 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg border-2 border-white",
            isCollapsed ? "-right-4" : "-right-4"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium rounded-lg transition-colors group relative",
                  isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                  isActive
                    ? "bg-green-100 text-green-700 border-r-2 border-green-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isCollapsed ? "" : "mr-3"
                )} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn(
              "w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 group relative",
              isCollapsed ? "justify-center px-3 py-3" : "justify-start px-4 py-3"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn(
              "h-5 w-5 flex-shrink-0",
              isCollapsed ? "" : "mr-3"
            )} />
            {!isCollapsed && "Logout"}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
