"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, MoreHorizontal, MapPin, GraduationCap, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

interface College {
  id: string
  name: string
  location: string
  type: string
  ranking: number
  totalCourses?: number
  totalApplications?: number
  status: string
  establishedYear: number
}

export function CollegeTable() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Fetch colleges data with caching
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchColleges = async () => {
      try {
        // Check if we have cached data in sessionStorage
        const cachedData = sessionStorage.getItem('colleges-data');
        const cachedTimestamp = sessionStorage.getItem('colleges-data-timestamp');
        
        // Use cached data if it exists and is less than 5 minutes old
        if (cachedData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          
          if (now - timestamp < fiveMinutes) {
            setColleges(JSON.parse(cachedData));
            setLoading(false);
            
            // Fetch fresh data in the background
            setTimeout(() => fetchFreshData(), 100);
            return;
          }
        }
        
        // No valid cache, fetch fresh data
        await fetchFreshData();
      } catch (err: unknown) {
        console.error('Error fetching colleges:', err);
        setError('Failed to load colleges. Please try again.');
        setLoading(false);
      }
    };
    
    const fetchFreshData = async () => {
      try {
        const response = await fetch('/api/admin/colleges', { signal });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch colleges: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the data in sessionStorage
        sessionStorage.setItem('colleges-data', JSON.stringify(data));
        sessionStorage.setItem('colleges-data-timestamp', Date.now().toString());
        
        setColleges(data);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        
        console.error('Error fetching fresh colleges data:', err);
        // Only set error if we don't have cached data
        if (colleges.length === 0) {
          setError('Failed to load colleges. Please try again.');
          setLoading(false);
        }
      }
    };
    
    fetchColleges()
  }, [])
  
  // Subscribe to real-time updates
  useRealTimeUpdates({
    types: ['college'],
    onUpdate: (event) => {
      const updatedCollege = event.data as College;
      setColleges(prevColleges => {
        const index = prevColleges.findIndex(college => college.id === updatedCollege.id)
        if (index >= 0) {
          // Update existing college
          const newColleges = [...prevColleges]
          newColleges[index] = updatedCollege
          return newColleges
        } else {
          // Add new college
          return [...prevColleges, updatedCollege]
        }
      })
    }
  })

  const handleDelete = async (collegeId: string) => {
    setDeletingId(collegeId)
    try {
      const response = await fetch(`/api/admin/colleges/${collegeId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete college')
      }
      
      setColleges(prev => prev.filter(college => college.id !== collegeId))
      
      // Clear cache
      sessionStorage.removeItem('colleges-data')
      sessionStorage.removeItem('colleges-data-timestamp')
    } catch (error) {
      console.error('Error deleting college:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "University":
        return "default"
      case "Institute":
        return "secondary"
      case "College":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Colleges ({colleges.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>College Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ranking</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colleges.map((college) => (
              <TableRow key={college.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-balance">{college.name}</div>
                    <div className="text-sm text-muted-foreground">Est. {college.establishedYear}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{college.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeColor(college.type)}>{college.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">#{college.ranking}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{college.totalCourses}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{college.totalApplications}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(college.status)}>{college.status}</Badge>
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
                        <a href={`/admin/colleges/${college.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/admin/colleges/${college.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit College
                        </a>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete College
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete College</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{college.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(college.id)}
                              disabled={deletingId === college.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === college.id ? "Deleting..." : "Delete"}
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
      </CardContent>
    </Card>
  )
}
