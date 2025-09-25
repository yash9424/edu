import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const applications = await Application.find({})
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Applications Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>Applications Report</h1>
      <p>Generated on: ${new Date().toLocaleDateString('en-US')}</p>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Agency</th>
            <th>College</th>
            <th>Course</th>
            <th>Status</th>
            <th>Fees</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          ${applications.map(app => `
            <tr>
              <td>${app.studentName}</td>
              <td>${app.email}</td>
              <td>${app.agencyName}</td>
              <td>${app.collegeName}</td>
              <td>${app.courseName}</td>
              <td>${app.status}</td>
              <td>$${app.fees}</td>
              <td>${new Date(app.createdAt).toLocaleDateString('en-US')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
    `

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="applications-report.html"'
      }
    })
  } catch (error) {
    console.error('Applications report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}