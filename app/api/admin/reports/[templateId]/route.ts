import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"

interface RouteParams {
  params: Promise<{ templateId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { templateId } = await params

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate report with live data
    const reportData = await generateReportData(templateId)
    
    const headers = new Headers()
    headers.set("Content-Type", "application/json")
    
    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 })
  }
}

async function generateReportData(templateId: string) {
  const agencies = await dataStore.getAgencies()
  const applications = await dataStore.getApplications()
  const colleges = await dataStore.getColleges()
  const users = await dataStore.getUsers()
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  switch (templateId) {
    case 'monthly-summary':
      return generateMonthlySummary(agencies, applications, currentMonth, currentYear)
    
    case 'agency-performance':
      return generateAgencyPerformance(agencies, applications, users)
    
    case 'college-applications':
      return generateCollegeApplicationsReport(colleges, applications, agencies)
    
    case 'financial-summary':
      return generateFinancialSummary(agencies, applications)
    
    default:
      throw new Error(`Unknown report template: ${templateId}`)
  }
}

function generateMonthlySummary(agencies: any[], applications: any[], month: number, year: number) {
  const monthlyApps = applications.filter(app => {
    const appDate = new Date(app.submissionDate)
    return appDate.getMonth() === month && appDate.getFullYear() === year
  })
  
  const totalRevenue = monthlyApps.reduce((sum, app) => {
    const agency = agencies.find(a => a.id === app.agencyId)
    return sum + (app.tuitionFee * (agency?.commissionRate || 0) / 100)
  }, 0)
  
  const statusCounts = monthlyApps.reduce((counts, app) => {
    counts[app.status] = (counts[app.status] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  return {
    reportType: 'Monthly Summary',
    period: `${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    summary: {
      totalApplications: monthlyApps.length,
      totalRevenue: totalRevenue,
      activeAgencies: agencies.filter(a => a.status === 'active').length,
      statusBreakdown: statusCounts
    },
    applications: monthlyApps,
    agencies: agencies.map(agency => ({
      ...agency,
      monthlyApplications: monthlyApps.filter(app => app.agencyId === agency.id).length,
      monthlyRevenue: monthlyApps
        .filter(app => app.agencyId === agency.id)
        .reduce((sum, app) => sum + (app.tuitionFee * (agency.commissionRate || 0) / 100), 0)
    }))
  }
}

function generateAgencyPerformance(agencies: any[], applications: any[], users: any[]) {
  return {
    reportType: 'Agency Performance',
    generatedAt: new Date().toISOString(),
    agencies: agencies.map(agency => {
      const agencyApps = applications.filter(app => app.agencyId === agency.id)
      const approvedApps = agencyApps.filter(app => app.status === 'approved')
      const totalRevenue = agencyApps.reduce((sum, app) => 
        sum + (app.tuitionFee * (agency.commissionRate || 0) / 100), 0)
      
      return {
        ...agency,
        metrics: {
          totalApplications: agencyApps.length,
          approvedApplications: approvedApps.length,
          approvalRate: agencyApps.length > 0 ? (approvedApps.length / agencyApps.length * 100) : 0,
          totalRevenue: totalRevenue,
          averageApplicationValue: agencyApps.length > 0 ? 
            agencyApps.reduce((sum, app) => sum + app.tuitionFee, 0) / agencyApps.length : 0
        },
        recentApplications: agencyApps.slice(-5)
      }
    })
  }
}

function generateCollegeApplicationsReport(colleges: any[], applications: any[], agencies: any[]) {
  return {
    reportType: 'College Applications Report',
    generatedAt: new Date().toISOString(),
    colleges: colleges.map(college => {
      const collegeApps = applications.filter(app => app.collegeId === college.id)
      const agencyBreakdown = collegeApps.reduce((breakdown, app) => {
        const agency = agencies.find(a => a.id === app.agencyId)
        const agencyName = agency?.name || 'Unknown'
        breakdown[agencyName] = (breakdown[agencyName] || 0) + 1
        return breakdown
      }, {} as Record<string, number>)
      
      return {
        ...college,
        applicationStats: {
          totalApplications: collegeApps.length,
          statusBreakdown: collegeApps.reduce((counts, app) => {
            counts[app.status] = (counts[app.status] || 0) + 1
            return counts
          }, {} as Record<string, number>),
          agencyBreakdown: agencyBreakdown,
          averageTuitionFee: collegeApps.length > 0 ? 
            collegeApps.reduce((sum, app) => sum + app.tuitionFee, 0) / collegeApps.length : 0
        },
        courses: college.courses?.map((course: any) => {
          const courseApps = collegeApps.filter(app => app.courseId === course.id)
          return {
            ...course,
            applicationCount: courseApps.length,
            applications: courseApps
          }
        }) || []
      }
    }),
    summary: {
      totalApplications: applications.length,
      totalColleges: colleges.length,
      averageApplicationsPerCollege: colleges.length > 0 ? applications.length / colleges.length : 0
    }
  }
}

function generateFinancialSummary(agencies: any[], applications: any[]) {
  const totalRevenue = applications.reduce((sum, app) => {
    const agency = agencies.find(a => a.id === app.agencyId)
    return sum + (app.tuitionFee * (agency?.commissionRate || 0) / 100)
  }, 0)
  
  const monthlyRevenue = applications.reduce((monthly, app) => {
    const month = new Date(app.submissionDate).toISOString().slice(0, 7)
    const agency = agencies.find(a => a.id === app.agencyId)
    const revenue = app.tuitionFee * (agency?.commissionRate || 0) / 100
    monthly[month] = (monthly[month] || 0) + revenue
    return monthly
  }, {} as Record<string, number>)
  
  return {
    reportType: 'Financial Summary',
    generatedAt: new Date().toISOString(),
    summary: {
      totalRevenue: totalRevenue,
      totalApplications: applications.length,
      averageRevenuePerApplication: applications.length > 0 ? totalRevenue / applications.length : 0,
      activeAgencies: agencies.filter(a => a.status === 'active').length
    },
    monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    })).sort((a, b) => a.month.localeCompare(b.month)),
    agencyRevenue: agencies.map(agency => {
      const agencyApps = applications.filter(app => app.agencyId === agency.id)
      const revenue = agencyApps.reduce((sum, app) => 
        sum + (app.tuitionFee * (agency.commissionRate || 0) / 100), 0)
      return {
        agencyId: agency.id,
        agencyName: agency.name,
        totalRevenue: revenue,
        applicationCount: agencyApps.length,
        commissionRate: agency.commissionRate
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }
}
