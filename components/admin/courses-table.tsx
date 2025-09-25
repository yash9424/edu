"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, MoreHorizontal, Clock, DollarSign, GraduationCap, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Course {
  id: string
  name: string
  duration: string
  fee: number
  currency: string
  level: string
  requirements: string
  sessions: string[]
  status: string
}

interface CoursesTableProps {
  collegeId: string
}

export function CoursesTable({ collegeId }: CoursesTableProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/admin/colleges/${collegeId}/courses`)
        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }
        const data = await response.json()
        setCourses(data)
        setLoading(false)
      } catch (err: unknown) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please try again.')
        setLoading(false)
      }
    }
    
    fetchCourses()
  }, [collegeId])
  
  // Subscribe to real-time updates
  useRealTimeUpdates({
    types: ['course'],
    onUpdate: (event) => {
      if (event.data?.collegeId === collegeId) {
        const updatedCourse = event.data as Course;
        setCourses(prevCourses => {
          const index = prevCourses.findIndex(course => course.id === updatedCourse.id)
          if (index >= 0) {
            // Update existing course
            const newCourses = [...prevCourses]
            newCourses[index] = updatedCourse
            return newCourses
          } else {
            // Add new course
            return [...prevCourses, updatedCourse]
          }
        })
      }
    }
  })

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/colleges/${collegeId}/courses/${courseId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete course')
      }
      
      // Remove course from state
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId))
    } catch (err: unknown) {
      console.error('Error deleting course:', err)
      setError('Failed to delete course. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Bachelor":
        return "default"
      case "Master":
        return "secondary"
      case "Doctorate":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading courses...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>
  }

  if (courses.length === 0) {
    return <div className="text-center py-4">No courses found. Add a new course to get started.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Sessions</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell>
              <div className="font-medium">{course.name}</div>
            </TableCell>
            <TableCell>
              <Badge variant={getLevelColor(course.level)}>{course.level}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{course.duration}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span>
                  {course.fee.toLocaleString()} {course.currency}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {course.sessions.map((session, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {session}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(course.status)}>{course.status}</Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href={`/admin/colleges/${collegeId}/courses/${course.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Course
                    </a>
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                        <span className="text-destructive">Delete Course</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the course. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCourse(course.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}