"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { CollegeTable } from "@/components/admin/college-table"
import { CollegeForm } from "@/components/admin/college-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function CollegesPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCollegeCreated = () => {
    setIsDialogOpen(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="College Management" subtitle="Manage partner colleges and universities" />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search colleges..." className="pl-10 w-80" />
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New College
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-none w-[99vw] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New College</DialogTitle>
              </DialogHeader>
              <CollegeForm onSuccess={handleCollegeCreated} />
            </DialogContent>
          </Dialog>
        </div>

        <Suspense fallback={<div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>}>
          <CollegeTable />
        </Suspense>
      </div>
    </div>
  )
}
