"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { CollegeForm } from "@/components/admin/college-form"
import { Card, CardContent } from "@/components/ui/card"

interface EditCollegePageProps {
  params: Promise<{ id: string }>
}

export default function EditCollegePage({ params }: EditCollegePageProps) {
  const router = useRouter()
  const [collegeId, setCollegeId] = useState<string | null>(null)
  const [college, setCollege] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setCollegeId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!collegeId) return

    const fetchCollege = async () => {
      try {
        const response = await fetch(`/api/admin/colleges/${collegeId}`)
        if (response.ok) {
          const collegeData = await response.json()
          setCollege(collegeData)
        } else if (response.status === 404) {
          setError("College not found")
        } else {
          setError("Failed to load college data")
        }
      } catch (err) {
        setError("An error occurred while loading college data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollege()
  }, [collegeId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader title="Edit College" subtitle="Update college information and details" />
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading college data...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader title="Edit College" subtitle="Update college information and details" />
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-red-600">{error || "College not found"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Edit College" subtitle="Update college information and details" />

      <div className="container mx-auto px-6 py-8">
        <CollegeForm college={college} isEdit={true} onSuccess={() => router.push(`/admin/colleges/${collegeId}`)} />
      </div>
    </div>
  )
}
