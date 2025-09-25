import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { dataType, format, dateRange, includeFields, filters } = await request.json()

    // Fetch live data from data store
    let data = await fetchLiveData(dataType)
    
    // Apply filters
    data = applyFilters(data, filters, dateRange)
    
    // Format the data based on requested format
    const formattedData = formatData(data, format, includeFields)
    
    const headers = new Headers()
    
    switch (format) {
      case 'csv':
        headers.set("Content-Type", "text/csv")
        headers.set("Content-Disposition", `attachment; filename="${dataType}_export.csv"`)
        break
      case 'json':
        headers.set("Content-Type", "application/json")
        headers.set("Content-Disposition", `attachment; filename="${dataType}_export.json"`)
        break
      case 'excel':
        headers.set("Content-Type", "text/csv") // Simplified as CSV for now
        headers.set("Content-Disposition", `attachment; filename="${dataType}_export.csv"`)
        break
      default:
        headers.set("Content-Type", "application/octet-stream")
    }
    
    return new NextResponse(formattedData, { headers })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

async function fetchLiveData(dataType: string) {
  switch (dataType) {
    case 'applications':
      return await dataStore.getApplications()
    case 'payments':
      // For now, return mock payment data since we don't have a payments store
      return [
        {
          id: '1',
          applicationId: '1',
          amount: 2500,
          status: 'completed',
          paymentDate: '2024-01-16',
          method: 'credit_card'
        },
        {
          id: '2',
          applicationId: '2',
          amount: 3000,
          status: 'pending',
          paymentDate: '2024-01-20',
          method: 'bank_transfer'
        }
      ]
    case 'agencies':
      return await dataStore.getAgencies()
    case 'colleges':
      return await dataStore.getColleges()
    case 'users':
      return await dataStore.getUsers()
    default:
      return []
  }
}

function applyFilters(data: any[], filters: any, dateRange: any) {
  let filteredData = [...data]
  
  // Apply status filter
  if (filters?.status && filters.status.trim()) {
    filteredData = filteredData.filter(item => 
      item.status?.toLowerCase().includes(filters.status.toLowerCase())
    )
  }
  
  // Apply agency filter
  if (filters?.agency && filters.agency.trim()) {
    filteredData = filteredData.filter(item => {
      if (item.name) {
        // For agency data
        return item.name.toLowerCase().includes(filters.agency.toLowerCase())
      }
      if (item.agencyId) {
        // For application data - would need to resolve agency name
        return item.agencyId.toLowerCase().includes(filters.agency.toLowerCase())
      }
      return true
    })
  }
  
  // Apply date range filter
  if (dateRange?.from || dateRange?.to) {
    filteredData = filteredData.filter(item => {
      const itemDate = item.submissionDate || item.createdAt || item.paymentDate
      if (!itemDate) return true
      
      const date = new Date(itemDate)
      const fromDate = dateRange.from ? new Date(dateRange.from) : null
      const toDate = dateRange.to ? new Date(dateRange.to) : null
      
      if (fromDate && date < fromDate) return false
      if (toDate && date > toDate) return false
      
      return true
    })
  }
  
  return filteredData
}

function formatData(data: any[], format: string, includeFields?: string[]) {
  if (data.length === 0) {
    return format === 'json' ? '[]' : ''
  }
  
  // Filter fields if specified
  let processedData = data
  if (includeFields && includeFields.length > 0) {
    processedData = data.map(item => {
      const filteredItem: any = {}
      includeFields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          filteredItem[field] = item[field]
        }
      })
      return filteredItem
    })
  }
  
  switch (format) {
    case 'csv':
      const fields = includeFields && includeFields.length > 0 ? includeFields : Object.keys(processedData[0])
      const headers = fields.join(',')
      const rows = processedData.map(item => 
        fields.map(field => {
          const value = item[field]
          // Handle different data types and escape CSV values
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      ).join('\n')
      
      return `${headers}\n${rows}`
    
    case 'json':
      return JSON.stringify(processedData, null, 2)
    
    case 'excel':
      // For now, return CSV format (in production, use a proper Excel library)
      return formatData(processedData, 'csv', includeFields)
    
    default:
      return JSON.stringify(processedData)
  }
}
