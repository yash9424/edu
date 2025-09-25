"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, MapPin, Calendar, Trophy, Plus, DollarSign, Clock, GraduationCap } from "lucide-react"
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates'

interface College {
  id: string
  name: string
  location: string
  type: string
  description: string
  establishedYear: number
  ranking: number
  status: string
  totalCourses?: number
  totalApplications?: number
}

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

interface CollegeDetailsProps {
  collegeId: string
}

export function CollegeDetails({ collegeId }: CollegeDetailsProps) {
  const [college, setCollege] = useState<College | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch college details
  useEffect(() => {
    fetch(`/api/admin/colleges/${collegeId}`)
      .then(res => res.json())
      .then(data => {
        setCollege(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching college details:', error)
        setIsLoading(false)
      })
      
    // Fetch courses for this college
    fetch(`/api/admin/colleges/${collegeId}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching college courses:', error))
  }, [collegeId])
  
  // Listen for real-time updates
  useRealTimeUpdates({
    types: ['college', 'course'],
    onUpdate: (event) => {
      if (event.type === 'college' && event.data?.id === collegeId) {
        // Refresh college data
        fetch(`/api/admin/colleges/${collegeId}`)
          .then(res => res.json())
          .then(data => setCollege(data))
          .catch(error => console.error('Error refreshing college details:', error))
      }
      
      if (event.type === 'course' && event.data?.collegeId === collegeId) {
        // Refresh courses data
        fetch(`/api/admin/colleges/${collegeId}/courses`)
          .then(res => res.json())
          .then(data => setCourses(data))
          .catch(error => console.error('Error refreshing college courses:', error))
      }
    }
  })

  if (isLoading || !college) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading college details...</p>
        </CardContent>
      </Card>
    )
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

  return (
    <div className="space-y-6" data-space="college-details">
      {/* College Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-balance">{college.name}</CardTitle>
              <p className="text-muted-foreground mt-1 text-pretty">{college.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={college.status === "active" ? "default" : "secondary"}>{college.status}</Badge>
              <Button asChild>
                <a href={`/admin/colleges/${college.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit College
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses ({college.totalCourses || 0})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({college.totalApplications || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* College Information */}
            <Card>
              <CardHeader>
                <CardTitle>College Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{college.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Established</p>
                    <p className="text-sm text-muted-foreground">{college.establishedYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Ranking</p>
                    <p className="text-sm text-muted-foreground">#{college.ranking}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* College Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Total Courses</p>
                    <p className="text-sm text-muted-foreground">{college.totalCourses || 0} courses offered</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Applications</p>
                    <p className="text-sm text-muted-foreground">{college.totalApplications || 0} student applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Courses</CardTitle>
              <Button asChild>
                <a href={`/admin/colleges/${college.id}/courses`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Courses
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No courses found. Add courses to this college.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.slice(0, 5).map((course) => (
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
                          <Badge variant={getStatusColor(course.status)}>{course.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {courses.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <a href={`/admin/colleges/${college.id}/courses`}>View All Courses</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-4 text-muted-foreground">
                Applications management will be implemented in a future update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
