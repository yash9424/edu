"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CourseFormProps {
  collegeId: string
  course?: {
    id: string
    name: string
    level: string
    duration: string
    fee: number
    currency: string
    requirements: string
    sessions: string[]
    status: string
  }
  isEdit?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

export function CourseForm({ collegeId, course, isEdit = false, onCancel, onSuccess }: CourseFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    level: "Bachelor",
    duration: "",
    fee: 0,
    currency: "USD",
    requirements: "",
    sessions: [] as string[],
    status: "active"
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with course data if editing
  useEffect(() => {
    if (course && isEdit) {
      setFormData({
        name: course.name,
        level: course.level,
        duration: course.duration,
        fee: course.fee,
        currency: course.currency,
        requirements: course.requirements,
        sessions: course.sessions,
        status: course.status
      })
    }
  }, [course, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEdit
        ? `/api/admin/colleges/${collegeId}/courses/${course?.id}`
        : `/api/admin/colleges/${collegeId}/courses`
      
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save course")
      }

      // Reset form if adding new course
      if (!isEdit) {
        setFormData({
          name: "",
          level: "Bachelor",
          duration: "",
          fee: 0,
          currency: "USD",
          requirements: "",
          sessions: [],
          status: "active"
        })
      }

      // Refresh the page or redirect
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
        router.push(`/admin/colleges/${collegeId}/courses`)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the course")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: any }) => {
    const { name, value } = 'target' in e ? e.target : e
    
    // Handle fee as a number when it comes from the input field
    if (name === 'fee' && typeof value === 'string') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const sessionOptions = [
    { label: "Spring 2024", value: "Spring 2024" },
    { label: "Summer 2024", value: "Summer 2024" },
    { label: "Fall 2024", value: "Fall 2024" },
    { label: "Winter 2024", value: "Winter 2024" },
    { label: "Spring 2025", value: "Spring 2025" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Course Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter course name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            name="level"
            value={formData.level}
            onValueChange={(value) => handleChange({ name: "level", value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bachelor">Bachelor</SelectItem>
              <SelectItem value="Master">Master</SelectItem>
              <SelectItem value="Doctorate">Doctorate</SelectItem>
              <SelectItem value="Certificate">Certificate</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g. 4 years, 2 semesters"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee">Fee</Label>
          <div className="flex space-x-2">
            <Input
              id="fee"
              name="fee"
              type="number"
              value={formData.fee}
              onChange={handleChange}
              placeholder="Enter fee amount"
              required
            />
            <Select
              name="currency"
              value={formData.currency}
              onValueChange={(value) => handleChange({ name: "currency", value })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Enter admission requirements"
            rows={3}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sessions">Available Sessions</Label>
          <MultiSelect
            options={sessionOptions}
            selected={formData.sessions}
            onChange={(selected: string[]) => handleChange({ name: "sessions", value: selected })}
            placeholder="Select available sessions"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value) => handleChange({ name: "status", value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="coming_soon">Coming Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Course" : "Add Course"}
        </Button>
      </div>
    </form>
  )
}
