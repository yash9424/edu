import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { dataStore } from "@/lib/data-store"
import { CourseForm } from "@/components/admin/course-form"

interface NewCoursePageProps {
  params: Promise<{ id: string }>
}

export default async function NewCoursePage({ params }: NewCoursePageProps) {
  const session = await getSession()
  const { id } = await params

  if (!session || session.role.toLowerCase() !== "admin") {
    redirect("/login")
  }

  // Fetch college data to verify it exists
  const college = await dataStore.getCollege(id)
  
  if (!college) {
    redirect("/admin/colleges")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title={`Add New Course to ${college.name}`} 
        subtitle="Create a new course for this college" 
        backLink={`/admin/colleges/${id}/courses`}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl">
          <CourseForm 
            collegeId={id} 
            onCancel={() => redirect(`/admin/colleges/${id}/courses`)} 
            onSuccess={() => redirect(`/admin/colleges/${id}/courses`)}
          />
        </div>
      </div>
    </div>
  )
}