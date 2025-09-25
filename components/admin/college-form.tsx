"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { College, Course } from "@/lib/data-store"

interface CollegeFormProps {
  college?: College
  isEdit?: boolean
  onSuccess?: () => void
}

export function CollegeForm({ college, isEdit = false, onSuccess }: CollegeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: college?.name || "",
    location: college?.location || "",
    type: college?.type || "University",
    description: college?.description || "",
    establishedYear: college?.establishedYear || new Date().getFullYear(),
    ranking: college?.ranking || 1,
    status: college?.status || "active",
    email: college?.email || "",
    phone: college?.phone || "",
    facilities: college?.facilities || [],
    courses: college?.courses || [],
  })
  
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id' | 'collegeId'>>({
    name: "",
    level: "Undergraduate",
    duration: "",
    fee: 0,
    currency: "USD",
    requirements: "",
    sessions: [],
    courseType: "",
    streams: [],
    status: "active"
  })
  
  const [newSession, setNewSession] = useState("")
  const [newStream, setNewStream] = useState("")
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/admin/colleges/${college?.id}` : "/api/admin/colleges"
      const method = isEdit ? "PUT" : "POST"

      console.log('Submitting college data:', formData)
      console.log('Courses being sent:', formData.courses)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/admin/colleges")
        }
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save college")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number | any[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  
  const handleCourseChange = (field: string, value: string | number | string[]) => {
    setNewCourse((prev) => ({ ...prev, [field]: value }))
  }
  
  const addSession = () => {
    if (newSession && !newCourse.sessions.includes(newSession)) {
      handleCourseChange("sessions", [...newCourse.sessions, newSession])
      setNewSession("")
    }
  }
  
  const removeSession = (session: string) => {
    handleCourseChange("sessions", newCourse.sessions.filter(s => s !== session))
  }
  
  const addStream = () => {
    if (newStream && !newCourse.streams?.includes(newStream)) {
      handleCourseChange("streams", [...(newCourse.streams || []), newStream])
      setNewStream("")
    }
  }
  
  const removeStream = (stream: string) => {
    handleCourseChange("streams", newCourse.streams?.filter(s => s !== stream) || [])
  }
  
  const addCourse = () => {
    if (newCourse.name && newCourse.level && newCourse.duration) {
      // Check if we're editing an existing course
      const editingCourse = formData.courses.find(c => c.isEditing)
      
      const courseWithId = {
        ...newCourse,
        id: editingCourse ? editingCourse.id : `temp_${Date.now()}`,
        collegeId: college?.id || "new"
      }
      
      // Remove the editing course and add the updated one
      const otherCourses = formData.courses.filter(c => !c.isEditing)
      handleChange("courses", [...otherCourses, courseWithId])
      
      setNewCourse({
        name: "",
        level: "Undergraduate",
        duration: "",
        fee: 0,
        currency: "USD",
        requirements: "",
        sessions: [],
        courseType: "",
        streams: [],
        status: "active"
      })
    }
  }
  
  const removeCourse = (courseId: string) => {
    handleChange("courses", formData.courses.filter(course => course.id !== courseId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit College" : "Add New College"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">College Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter college name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="City, State, Country"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Institution Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Institute">Institute</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <div className="space-y-2">
              <Label htmlFor="establishedYear">Established Year</Label>
              <Input
                id="establishedYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.establishedYear}
                onChange={(e) => handleChange("establishedYear", Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ranking">World Ranking</Label>
              <Input
                id="ranking"
                type="number"
                min="1"
                value={formData.ranking}
                onChange={(e) => handleChange("ranking", Number(e.target.value))}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@college.edu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter college description and highlights"
              rows={4}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6 mt-6">
            <h3 className="text-lg font-medium">Courses</h3>
            <div className="border rounded-md p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    value={newCourse.name}
                    onChange={(e) => handleCourseChange("name", e.target.value)}
                    placeholder="Enter course name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseLevel">Level</Label>
                  <Select value={newCourse.level} onValueChange={(value) => handleCourseChange("level", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseDuration">Duration *</Label>
                  <Input
                    id="courseDuration"
                    value={newCourse.duration}
                    onChange={(e) => handleCourseChange("duration", e.target.value)}
                    placeholder="e.g., 3 years, 4 semesters"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseFee">Fee</Label>
                  <div className="flex gap-2">
                    <Input
                      id="courseFee"
                      type="number"
                      value={newCourse.fee}
                      onChange={(e) => handleCourseChange("fee", Number(e.target.value))}
                      placeholder="0"
                    />
                    <Select 
                      value={newCourse.currency} 
                      onValueChange={(value) => handleCourseChange("currency", value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseType">Course Type *</Label>
                  <Input
                    id="courseType"
                    value={newCourse.courseType}
                    onChange={(e) => handleCourseChange("courseType", e.target.value)}
                    placeholder="e.g., Full-time, Part-time, Online"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseStatus">Status</Label>
                  <Select value={newCourse.status} onValueChange={(value) => handleCourseChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessions">Sessions</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sessions"
                      value={newSession}
                      onChange={(e) => setNewSession(e.target.value)}
                      placeholder="e.g., Fall 2024, Spring 2025"
                    />
                    <Button type="button" onClick={addSession} className="shrink-0">
                      Add
                    </Button>
                  </div>
                  {newCourse.sessions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newCourse.sessions.map((session) => (
                        <div key={session} className="bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                          <span>{session}</span>
                          <button
                            type="button"
                            onClick={() => removeSession(session)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="streams">Streams</Label>
                  <div className="flex gap-2">
                    <Input
                      id="streams"
                      value={newStream}
                      onChange={(e) => setNewStream(e.target.value)}
                      placeholder="e.g., Computer Science, Business"
                    />
                    <Button type="button" onClick={addStream} className="shrink-0">
                      Add
                    </Button>
                  </div>
                  {(newCourse.streams?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(newCourse.streams || []).map((stream) => (
                        <div key={stream} className="bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                          <span>{stream}</span>
                          <button
                            type="button"
                            onClick={() => removeStream(stream)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseRequirements">Requirements</Label>
                  <Textarea
                    id="courseRequirements"
                    value={newCourse.requirements}
                    onChange={(e) => handleCourseChange("requirements", e.target.value)}
                    placeholder="Enter course requirements"
                    rows={3}
                  />
                </div>
              </div>
              
              <Button type="button" onClick={addCourse} className="mt-4">
                Add Course
              </Button>
            </div>
            
            {formData.courses.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Added Courses</h4>
                <div className="space-y-3">
                  {formData.courses.map((course) => (
                    <div key={course.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{course.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {course.level} • {course.duration} • {course.courseType}
                          </p>
                          {(course.streams?.length || 0) > 0 && (
                            <p className="text-sm mt-1">
                              <span className="font-medium">Streams:</span> {(course.streams || []).join(", ")}
                            </p>
                          )}
                          {course.sessions.length > 0 && (
                            <p className="text-sm mt-1">
                              <span className="font-medium">Sessions:</span> {course.sessions.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Store the original course ID for editing
                              const courseToEdit = {
                                ...course,
                                originalId: course.id // Preserve original ID
                              }
                              setNewCourse({
                                name: course.name,
                                level: course.level,
                                duration: course.duration,
                                fee: course.fee,
                                currency: course.currency,
                                requirements: course.requirements,
                                sessions: course.sessions,
                                courseType: course.courseType,
                                streams: course.streams || [],
                                status: course.status
                              })
                              // Remove from display but keep ID for update
                              const updatedCourses = formData.courses.map(c => 
                                c.id === course.id ? { ...c, isEditing: true } : c
                              ).filter(c => !c.isEditing)
                              handleChange("courses", updatedCourses)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCourse(course.id)}
                            className="text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update College" : "Create College"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
