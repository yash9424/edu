"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart as FileBarChart,
  TrendingUp,
  ShieldCheck as Shield
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Agencies",
    href: "/admin/agencies",
    icon: Building2,
  },
  {
    name: "Colleges",
    href: "/admin/colleges",
    icon: GraduationCap,
  },
  {
    name: "Applications",
    href: "/admin/applications",
    icon: FileText,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },

  {
    name: "Reports",
    href: "/admin/reports",
    icon: FileBarChart,
  },
  {
    name: "Role Management",
    href: "/admin/roles",
    icon: Shield,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Set hydrated state and load localStorage value after mount
    setIsHydrated(true)
    try {
      const storedValue = localStorage.getItem("admin-sidebar-collapsed")
      if (storedValue === "true") {
        setCollapsed(true)
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }, [])

  const toggleSidebar = useCallback(() => {
    setCollapsed(prevState => {
      const newState = !prevState
      // Store the state in localStorage for persistence
      if (isHydrated) {
        try {
          localStorage.setItem("admin-sidebar-collapsed", String(newState))
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
      }
      return newState
    })
  }, [isHydrated])

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-gray-200 flex items-center", 
        collapsed ? "p-4 justify-center" : "p-6"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "space-x-0" : "space-x-2"
        )}>
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">EduManage</h1>
              <p className="text-sm text-gray-500">Admin Portal</p>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "p-0 h-8 w-8 rounded-full", 
            collapsed ? "ml-2" : "ml-auto"
          )} 
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1", 
        collapsed ? "p-2 space-y-2" : "p-4 space-y-2"
      )}>
        {useMemo(() => {
           return navigation.map((item) => {
             const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

             return (
               <Link
                 key={item.name}
                 href={item.href}
                 prefetch={true}
                 className={cn(
                   "flex items-center rounded-lg text-sm font-medium transition-colors",
                   collapsed ? "flex-col py-3 px-0 space-y-1" : "space-x-3 px-3 py-2",
                   isActive
                     ? "bg-green-50 text-green-700 border border-green-200"
                     : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                 )}
                 title={collapsed ? item.name : ""}
               >
                 <item.icon className="w-5 h-5" />
                 {!collapsed && <span>{item.name}</span>}
               </Link>
             )
           })
         }, [pathname, collapsed])}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-gray-200",
        collapsed ? "p-2" : "p-4"
      )}>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            collapsed ? "w-full p-2" : "w-full justify-start"
          )}
          title="Logout"
        >
          <LogOut className={cn("w-5 h-5", collapsed ? "" : "mr-3")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}
