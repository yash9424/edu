import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { dataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CoursesTable } from "@/components/admin/courses-table"

interface CollegeCoursesPageProps {
  params: Promise<{ id: string }>
}

export default async function CollegeCoursesPage({ params }: CollegeCoursesPageProps) {
  const session = await getSession()
  const { id } = await params

  if (!session || session.role.toLowerCase() !== "admin") {
    redirect("/login")
  }

  // Fetch college data from the data store
  const college = await dataStore.getCollege(id)
  
  if (!college) {
    redirect("/admin/colleges")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title={`${college.name} - Courses`} 
        subtitle="Manage courses offered by this college" 
        backLink={`/admin/colleges/${id}`}
      />

      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Courses</CardTitle>
            <Button asChild>
              <a href={`/admin/colleges/${id}/courses/new`}>Add New Course</a>
            </Button>
          </CardHeader>
          <CardContent>
            <CoursesTable collegeId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}