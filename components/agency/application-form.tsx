"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { User } from "lucide-react"
// Types defined inline
interface College {
  id: string
  name: string
  location?: string
  type?: string
  ranking?: number
}

interface Course {
  id: string
  name: string
  courseType: string
  streams?: string[]
  sessions?: string[]
  fees: number
}

export function ApplicationForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentTab, setCurrentTab] = useState("personal")
  const [colleges, setColleges] = useState<College[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [courseTypes, setCourseTypes] = useState<string[]>([])
  const [streams, setStreams] = useState<string[]>([])
  
  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        // First ensure data exists
        await fetch('/api/test-seed')
        
        const response = await fetch('/api/agency/colleges', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched colleges from admin:', data)
          setColleges(data)
        } else {
          console.error('Failed to fetch colleges:', response.status)
        }
      } catch (error: any) {
        console.error('Error fetching colleges:', error)
      }
    }
    
    fetchColleges()
  }, [])
  
  // Define formData state at the top level before it's used in useEffect hooks
  const [formData, setFormData] = useState({
    // Personal Information
    studentName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    aadharPassportNumber: "",
    address: "",
    abcId: "",
    debId: "",
    applicationId: "",
    fatherName: "",
    motherName: "",
    religion: "",
    caste: "",
    maritalStatus: "",

    // Course Selection
    collegeId: "",
    courseId: "",
    session: "",
    courseType: "",
    stream: "",

    // Additional Information
    personalStatement: "",
    workExperience: "",
  })

  // Fetch courses when college selection changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.collegeId) {
        setCourses([])
        setCourseTypes([])
        setStreams([])
        // Reset course-related form fields
        setFormData(prev => ({
          ...prev,
          courseId: "",
          courseType: "",
          stream: "",
          session: ""
        }))
        return
      }
      
      try {
        console.log('Fetching courses for college:', formData.collegeId)
        const response = await fetch(`/api/agency/colleges/${formData.collegeId}/courses`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched courses from database:', data)
          console.log('Course sessions:', data.map(c => ({ name: c.name, sessions: c.sessions })))
          setCourses(data)
          
          // Extract unique course types
          const types = [...new Set(data.map((course: Course) => course.courseType).filter(Boolean))] as string[]
          console.log('Available course types:', types)
          setCourseTypes(types)
        } else {
          console.error('Failed to fetch courses:', response.status, response.statusText)
          setCourses([])
          setCourseTypes([])
        }
      } catch (error: any) {
        console.error('Error fetching courses:', error)
        setCourses([])
        setCourseTypes([])
      }
    }
    
    fetchCourses()
  }, [formData.collegeId])
  
  // Update streams when course type changes
  useEffect(() => {
    if (!formData.courseType || !courses.length) {
      setStreams([])
      // Reset stream-related form fields
      setFormData(prev => ({
        ...prev,
        stream: "",
        courseId: "",
        session: ""
      }))
      return
    }
    
    // Find courses that match the selected course type
    const matchingCourses = courses.filter((course) => course.courseType === formData.courseType)
    console.log('Matching courses for type', formData.courseType, ':', matchingCourses)
    
    // Extract unique streams from matching courses
    const availableStreams: string[] = []
    matchingCourses.forEach((course) => {
      if (course.streams && Array.isArray(course.streams)) {
        course.streams.forEach((stream) => {
          if (stream && !availableStreams.includes(stream)) {
            availableStreams.push(stream)
          }
        })
      }
    })
    
    console.log('Available streams:', availableStreams)
    
    setStreams(availableStreams)
  }, [formData.courseType, courses])

  // Academic Information
  interface AcademicRecord {
    level: string
    boardUniversity: string
    year: string
    obtainedMarks: string
    percentage: string
    marksheet: File | null
  }
  
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([
    {
      level: "High School",
      boardUniversity: "",
      year: "",
      obtainedMarks: "",
      percentage: "",
      marksheet: null as File | null
    },
    {
      level: "Intermediate",
      boardUniversity: "",
      year: "",
      obtainedMarks: "",
      percentage: "",
      marksheet: null as File | null
    },
    {
      level: "Graduation",
      boardUniversity: "",
      year: "",
      obtainedMarks: "",
      percentage: "",
      marksheet: null as File | null
    },
    {
      level: "Other",
      boardUniversity: "",
      year: "",
      obtainedMarks: "",
      percentage: "",
      marksheet: null as File | null
    }
  ])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Create FormData for file uploads
      const submitData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value as string)
      })
      
      // Add academic records
      submitData.append('academicRecords', JSON.stringify(academicRecords.map(record => ({
        level: record.level,
        boardUniversity: record.boardUniversity,
        year: record.year,
        obtainedMarks: record.obtainedMarks,
        percentage: record.percentage
      }))))


      
      // Add academic marksheets
      academicRecords.forEach((record, index) => {
        if (record.marksheet) {
          submitData.append(`academicRecords.${index}.marksheet`, record.marksheet)
        }
      })

      console.log('Submitting application data...')
      
      const selectedCollege = colleges.find(c => c.id === formData.collegeId)
      const selectedCourse = courses.find(c => c.id === formData.courseId)
      
      // Get fees from selected course
      const calculatedFees = selectedCourse?.fees || 0
      
      const applicationData = {
        studentName: formData.studentName,
        email: formData.email,
        phone: formData.phone,
        collegeId: formData.collegeId,
        collegeName: selectedCollege?.name || 'Default College',
        courseId: formData.courseId,
        courseName: selectedCourse?.name || 'Default Course',
        courseType: formData.courseType,
        stream: formData.stream,
        fees: calculatedFees,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        address: formData.address,
        abcId: formData.abcId,
        debId: formData.debId,
        applicationId: formData.applicationId,
        personalStatement: formData.personalStatement,
        workExperience: formData.workExperience,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        religion: formData.religion,
        caste: formData.caste,
        maritalStatus: formData.maritalStatus,
        academicRecords: academicRecords.map(record => ({
          level: record.level,
          board: record.boardUniversity,
          year: record.year,
          obtainedMarks: record.obtainedMarks,
          percentage: record.percentage
        }))
      }
      
      console.log('Application data:', applicationData)
      
      const response = await fetch("/api/agency/applications", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(applicationData),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        try {
          const result = await response.json()
          console.log('Application created successfully:', result)
          alert('Application submitted successfully!')
          // Force refresh of applications list
          window.location.href = "/agency/applications"
        } catch (e) {
          console.log('Success but no JSON response')
          alert('Application submitted successfully!')
          // Force refresh of applications list
          window.location.href = "/agency/applications"
        }
      } else {
        try {
          const errorData = await response.json()
          console.error('Application submission failed:', errorData)
          setError(errorData.error || "Failed to submit application")
        } catch (e) {
          console.error('Error parsing response:', e)
          setError("Failed to submit application")
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error)
      setError(error.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    // Reset dependent fields when parent field changes
    if (field === 'collegeId') {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        courseId: '',
        courseType: '',
        stream: '',
        session: ''
      }))
    } else if (field === 'courseType') {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        stream: ''
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }
  
  const handleAcademicRecordChange = (index: number, field: string, value: string | File | null) => {
    setAcademicRecords(prev => {
      const newRecords = [...prev]
      newRecords[index] = { ...newRecords[index], [field]: value }
      return newRecords
    })
  }



  const nextTab = () => {
    const tabs = ["personal", "academic", "course", "additional"]
    const currentIndex = tabs.indexOf(currentTab)
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1])
    }
  }

  const prevTab = () => {
    const tabs = ["personal", "academic", "course", "additional"]
    const currentIndex = tabs.indexOf(currentTab)
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1])
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Student Application Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="course">Course</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <Input
                    id="applicationId"
                    value={formData.applicationId}
                    onChange={(e) => handleChange("applicationId", e.target.value)}
                    placeholder="Auto-generated if left empty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleChange("studentName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadharPassportNumber">Aadhar/Passport Number *</Label>
                  <Input
                    id="aadharPassportNumber"
                    value={formData.aadharPassportNumber}
                    onChange={(e) => handleChange("aadharPassportNumber", e.target.value)}
                    placeholder="Enter Aadhar or Passport number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abcId">ABC ID</Label>
                  <Input
                    id="abcId"
                    value={formData.abcId}
                    onChange={(e) => handleChange("abcId", e.target.value)}
                    placeholder="Enter ABC ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debId">DEB ID</Label>
                  <Input
                    id="debId"
                    value={formData.debId}
                    onChange={(e) => handleChange("debId", e.target.value)}
                    placeholder="Enter DEB ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                    placeholder="Enter father's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => handleChange("motherName", e.target.value)}
                    placeholder="Enter mother's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => handleChange("religion", e.target.value)}
                    placeholder="Enter religion"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caste">Caste Category</Label>
                  <Select value={formData.caste} onValueChange={(value) => handleChange("caste", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select caste category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="EWS">EWS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => handleChange("maritalStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6 mt-6">
              <div className="space-y-6">
                <h3 className="text-base font-medium">Academic Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Education Level</th>
                        <th className="text-left py-2 px-3">Board/University</th>
                        <th className="text-left py-2 px-3">Year</th>
                        <th className="text-left py-2 px-3">Obtained Marks</th>
                        <th className="text-left py-2 px-3">Percentage</th>
                        <th className="text-left py-2 px-3">Upload Marksheet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academicRecords.map((record, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-3">{record.level}</td>
                          <td className="py-2 px-3">
                            <Input
                              value={record.boardUniversity}
                              onChange={(e) => handleAcademicRecordChange(index, "boardUniversity", e.target.value)}
                              placeholder="Enter board/university"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              value={record.year}
                              onChange={(e) => handleAcademicRecordChange(index, "year", e.target.value)}
                              placeholder="2020"
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              value={record.obtainedMarks}
                              onChange={(e) => handleAcademicRecordChange(index, "obtainedMarks", e.target.value)}
                              placeholder="Marks"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              value={record.percentage}
                              onChange={(e) => handleAcademicRecordChange(index, "percentage", e.target.value)}
                              placeholder="Percentage"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                handleAcademicRecordChange(index, "marksheet", file)
                              }}
                              className="text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="course" className="space-y-6 mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="collegeId">College/University</Label>
                  <Select value={formData.collegeId} onValueChange={(value) => handleChange("collegeId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.collegeId && (
                  <div className="space-y-2">
                    <Label htmlFor="courseType">Course Type</Label>
                    <Select value={formData.courseType} onValueChange={(value) => handleChange("courseType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.courseType && streams && streams.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="stream">Stream</Label>
                    <Select value={formData.stream} onValueChange={(value) => handleChange("stream", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {streams.map((stream) => (
                          <SelectItem key={stream} value={stream}>
                            {stream}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.collegeId && (
                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course</Label>
                    <Select value={formData.courseId} onValueChange={(value) => handleChange("courseId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .filter(course => 
                            (!formData.courseType || course.courseType === formData.courseType) &&
                            (!formData.stream || (course.streams && Array.isArray(course.streams) && course.streams.includes(formData.stream)))
                          )
                          .map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.courseId && (() => {
                  const selectedCourse = courses.find(course => course.id === formData.courseId)
                  const courseSessions = selectedCourse?.sessions || []
                  
                  console.log('Course ID:', formData.courseId)
                  console.log('Selected Course:', selectedCourse)
                  console.log('Course Sessions from DB:', courseSessions)
                  
                  return courseSessions.length > 0 ? (
                    <div className="space-y-2">
                      <Label htmlFor="session">Intake Session</Label>
                      <Select value={formData.session} onValueChange={(value) => handleChange("session", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseSessions.map((session) => (
                            <SelectItem key={session} value={session}>
                              {session}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="session">Intake Session</Label>
                      <p className="text-sm text-muted-foreground">No sessions available for this course</p>
                    </div>
                  )
                })()}

              </div>
            </TabsContent>



            <TabsContent value="additional" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personalStatement">Personal Statement</Label>
                  <Textarea
                    id="personalStatement"
                    value={formData.personalStatement}
                    onChange={(e) => handleChange("personalStatement", e.target.value)}
                    placeholder="Tell us about yourself and why you want to study this course..."
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workExperience">Work Experience</Label>
                  <Textarea
                    id="workExperience"
                    value={formData.workExperience}
                    onChange={(e) => handleChange("workExperience", e.target.value)}
                    placeholder="Describe any relevant work experience..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={prevTab} disabled={currentTab === "personal"}>
              Previous
            </Button>

            {currentTab === "additional" ? (
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            ) : (
              <Button type="button" onClick={nextTab}>
                Next
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
