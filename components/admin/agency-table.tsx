"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MoreHorizontal, Mail, Phone, UserPlus, CreditCard, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface Agency {
  id: string
  name: string
  username?: string
  email: string
  phone: string
  contactPerson: string
  commissionRate: number
  status: string
  totalApplications?: number
  totalRevenue?: number
  joinedDate?: string
  createdAt?: string
  hasUser?: boolean
  userId?: string
}

export function AgencyTable() {
  const router = useRouter()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const fetchAgencies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/agencies')
      if (!response.ok) {
        throw new Error(`Failed to fetch agencies: ${response.status}`)
      }
      const data = await response.json()
      console.log('Fetched agencies:', data)
      setAgencies(data || [])
    } catch (err) {
      console.error('Error fetching agencies:', err)
      setError(err instanceof Error ? err.message : 'Failed to load agencies')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAgency = async (agencyId: string) => {
    try {
      setDeletingId(agencyId)
      const response = await fetch(`/api/admin/agencies/${agencyId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete agency')
      }
      
      // Refresh the agencies list
      await fetchAgencies()
    } catch (err) {
      console.error('Error deleting agency:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete agency')
    } finally {
      setDeletingId(null)
    }
  }
  
  useEffect(() => {
    fetchAgencies()
  }, [])
  
  const agencyList = agencies.map(agency => ({
    id: agency.id,
    name: agency.name,
    username: agency.username || 'N/A',
    email: agency.email,
    phone: agency.phone,
    contactPerson: agency.contactPerson,
    commissionRate: agency.commissionRate,
    status: agency.status,
    totalApplications: agency.totalApplications || 0,
    totalRevenue: agency.totalRevenue || 0,
    joinedDate: agency.createdAt || agency.joinedDate || new Date().toISOString(),
    hasUser: !!agency.username,
    userId: agency.userId
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Partners {!loading && `(${agencyList.length})`}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-8" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={fetchAgencies}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Pending Payments</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencyList.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-balance">{agency.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(agency.joinedDate).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {agency.username ? (
                      <Badge variant="outline" className="font-medium text-foreground">
                        {agency.username}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        No User
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{agency.contactPerson}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {agency.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      {agency.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{agency.commissionRate}%</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{agency.totalApplications}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">₹{agency.totalRevenue?.toLocaleString() || '0'}</div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/admin/payments?tab=applications&agency=' + agency.id)}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    View Payments
                  </Button>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`/admin/agencies/${agency.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </a>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Agency
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Agency</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{agency.name}"? This action cannot be undone and will remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAgency(agency.id)}
                              disabled={deletingId === agency.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === agency.id ? 'Deleting...' : 'Delete'}
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
        )}
      </CardContent>
    </Card>
  )
}
