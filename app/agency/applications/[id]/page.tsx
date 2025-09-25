import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DataStore } from "@/lib/data-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileText, User, GraduationCap, Calendar, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { AgencyHeader } from "@/components/agency/agency-header"

interface ApplicationDetailsPageProps {
  params: {
    id: string
  }
}

export default async function ApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
  const session = await getSession()
  
  if (!session || session.role !== "agency") {
    return notFound()
  }

  const dataStore = new DataStore()
  const applications = dataStore.getApplications()
  
  // Debug log to check the application IDs and the requested ID
  console.log('Requested ID:', params.id)
  console.log('Available application IDs:', applications.map(app => ({ id: app.id, type: typeof app.id })))
  
  // For demo purposes, allow viewing any application when logged in as agency
  const application = applications.find(app => app.id == params.id)

  if (!application) {
    console.log('Application not found for ID:', params.id)
    return notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AgencyHeader agencyName={session.name} />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/agency/applications">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Application Details</h1>
              <p className="text-muted-foreground">Application ID: {application.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{application.studentName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    {application.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-4 w-4" />
                    {application.phone}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Program Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Program Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{application.collegeName}</p>
                  <p className="text-sm text-muted-foreground">{application.courseName}</p>
                  <p className="text-sm font-medium mt-2">Fees: ${application.fees.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic Records */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Records
              </CardTitle>
              <CardDescription>
                Educational background and academic achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.academicRecords && application.academicRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Education Level</th>
                        <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Board/University</th>
                        <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Year</th>
                        <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Obtained Marks</th>
                        <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.academicRecords.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 font-medium">{record.level}</td>
                          <td className="border border-gray-200 px-4 py-2">{record.board || 'Not provided'}</td>
                          <td className="border border-gray-200 px-4 py-2">{record.year || 'Not provided'}</td>
                          <td className="border border-gray-200 px-4 py-2">{record.obtainedMarks || 'Not provided'}</td>
                          <td className="border border-gray-200 px-4 py-2">{record.percentage || 'Not provided'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No academic records available</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(application.studentDetails?.personalStatement || application.studentDetails?.workExperience) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.studentDetails?.personalStatement && (
                  <div>
                    <h4 className="font-semibold mb-2">Personal Statement</h4>
                    <p className="text-sm text-muted-foreground">{application.studentDetails.personalStatement}</p>
                  </div>
                )}
                {application.studentDetails?.workExperience && (
                  <div>
                    <h4 className="font-semibold mb-2">Work Experience</h4>
                    <p className="text-sm text-muted-foreground">{application.studentDetails.workExperience}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>
                Documents submitted with this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">No documents uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}