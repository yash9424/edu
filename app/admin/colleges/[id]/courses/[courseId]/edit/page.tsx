import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { dataStore } from "@/lib/data-store"
import { CourseForm } from "@/components/admin/course-form"

interface EditCoursePageProps {
  params: Promise<{ id: string, courseId: string }>
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const session = await getSession()
  const { id, courseId } = await params

  if (!session || session.role.toLowerCase() !== "admin") {
    redirect("/login")
  }

  // Fetch college data to verify it exists
  const college = dataStore.getCollege(id)
  
  if (!college) {
    redirect("/admin/colleges")
  }

  // Fetch course data
  const course = dataStore.getCourse(courseId)

  if (!course || course.collegeId !== id) {
    redirect(`/admin/colleges/${id}/courses`)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title={`Edit Course - ${course.name}`} 
        subtitle="Update course information" 
        backLink={`/admin/colleges/${id}/courses`}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl">
          <CourseForm 
            collegeId={id} 
            course={course}
            isEdit={true}
            onCancel={() => redirect(`/admin/colleges/${id}/courses`)} 
            onSuccess={() => redirect(`/admin/colleges/${id}/courses`)}
          />
        </div>
      </div>
    </div>
  )
}