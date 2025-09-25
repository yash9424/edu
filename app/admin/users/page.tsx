"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, MoreHorizontal, Key, UserCheck, Power, PowerOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AdminHeader } from "@/components/admin/admin-header"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"
import { toast } from "sonner"

interface User {
  id: string
  username: string
  name?: string
  role: 'Admin' | 'Agency'
  email: string
  status: 'active' | 'inactive'
  lastLogin?: string
  agencyId?: string
  agencyName?: string
  createdAt?: string
}

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Real-time updates
  useRealTimeUpdates({
    types: ['user', 'agency'],
    onUpdate: (eventData) => {
      if (eventData.type === 'user') {
        switch (eventData.action) {
          case 'create':
            setUsers(prev => [...prev, eventData.data])
            toast.success(`User ${eventData.data.name || eventData.data.username} created successfully`)
            break
          case 'update':
            setUsers(prev => prev.map(u => u.id === eventData.data.id ? eventData.data : u))
            toast.success(`User ${eventData.data.name || eventData.data.username} updated successfully`)
            break
          case 'delete':
            setUsers(prev => prev.filter(u => u.id !== eventData.data.id))
            toast.success('User deleted successfully')
            break
        }
      } else if (eventData.type === 'agency' && eventData.action === 'update') {
        // Update user status if agency status changed
        if (eventData.data.userId) {
          setUsers(prev => prev.map(u => {
            if (u.id === eventData.data.userId) {
              return { ...u, status: eventData.data.status }
            }
            return u
          }))
        }
      }
    }
  })

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const getRoleColor = (role: string) => {
    return role === "Admin" ? "destructive" : "outline"
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle user creation
    setIsCreateModalOpen(false)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password reset
    setIsPasswordModalOpen(false)
  }

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const previousStatus = user.status
    
    // Optimistic UI update
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === user.id ? { ...u, status: newStatus as 'active' | 'inactive' } : u
      )
    )
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...user, 
          status: newStatus,
          _previousStatus: previousStatus // Include previous status for tracking changes
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user status')
      }
      
      const updatedUser = await response.json()
      
      // Update with server response
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? updatedUser.user : u
        )
      )
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error updating user status:', error)
      
      // Revert optimistic update on error
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, status: previousStatus as 'active' | 'inactive' } : u
        )
      )
      
      toast.error('Failed to update user status. Please try again.')
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="User Management" subtitle="Manage agency users and credentials" />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-10 w-80" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Enter username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency">Associated Agency (for Agency users)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ABC Education Consultancy</SelectItem>
                      <SelectItem value="2">Global Learning Partners</SelectItem>
                      <SelectItem value="3">Future Scholars Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create User
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Associated Agency</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                Array(4).fill(0).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell><div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div></TableCell>
                    <TableCell><div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Created {user.createdAt && user.createdAt !== undefined ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.agencyName ? (
                        <div className="text-sm">{user.agencyName}</div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                    <div className="text-sm">{user.lastLogin && user.lastLogin !== undefined ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</div>
                  </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
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
                            <a href={`/admin/users/${user.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/admin/users/${user.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsPasswordModalOpen(true)
                            }}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                            {user.status === "active" ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Password Reset Modal */}
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedUser?.username} ({selectedUser?.email})
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter new password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm new password" required />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Reset Password
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
