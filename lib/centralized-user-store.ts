"use client"

import { EventEmitter } from 'events'

export interface UserData {
  id: string
  username: string
  name: string
  role: 'Admin' | 'Agency'
  email: string
  status: 'active' | 'inactive'
  lastLogin: string
  agencyId?: string
  agencyName?: string
  createdAt: string
  updatedAt: string
  version: number
  lastModified: string
  modifiedBy: string
}

export interface UserDataVersion {
  version: number
  timestamp: string
  modifiedBy: string
  changes: Partial<UserData>
  previousData: Partial<UserData>
}

export interface UserUpdateEvent {
  type: 'user_updated' | 'user_created' | 'user_deleted'
  data: UserData
  timestamp: number
  targetRoles: string[]
  version: number
  modifiedBy: string
}

class CentralizedUserStore extends EventEmitter {
  private users: Map<string, UserData> = new Map()
  private versions: Map<string, UserDataVersion[]> = new Map()
  private lastFetch: number = 0
  private readonly CACHE_DURATION = 30000 // 30 seconds
  private isInitialized = false

  constructor() {
    super()
    this.setMaxListeners(50) // Increase max listeners for multiple components
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      await this.fetchUsers()
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize user store:', error)
      throw error
    }
  }

  private async fetchUsers(): Promise<void> {
    try {
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
      const usersArray = Array.isArray(data) ? data : data.users || []
      
      // Clear existing users and add fresh data
      this.users.clear()
      usersArray.forEach((user: any) => {
        const userId = user.id || user._id?.toString() || user._id
        this.users.set(userId, {
          ...user,
          id: userId,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        })
      })

      this.lastFetch = Date.now()
      this.emit('users_refreshed', Array.from(this.users.values()))
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  async getAllUsers(userRole: 'admin' | 'agency' = 'admin', userId?: string): Promise<UserData[]> {
    // Check if we need to refresh data
    const now = Date.now()
    if (!this.isInitialized || (now - this.lastFetch) > this.CACHE_DURATION) {
      await this.fetchUsers()
    }

    const allUsers = Array.from(this.users.values())
    
    // Filter based on user role
    if (userRole === 'agency' && userId) {
      // Agency users can only see their own data
      return allUsers.filter(user => user.id === userId)
    }
    
    // Admin can see all users
    return allUsers
  }

  async updateUserData(userId: string, data: Partial<UserData>): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedUser = await response.json()
      
      // Update local cache
      if (this.users.has(userId)) {
        this.users.set(userId, {
          ...this.users.get(userId)!,
          ...updatedUser,
          updatedAt: new Date().toISOString()
        })
      }

      // Emit update event
      const updatedUserData = this.users.get(userId)!
      const event: UserUpdateEvent = {
        type: 'user_updated',
        data: updatedUserData,
        timestamp: Date.now(),
        targetRoles: ['admin'], // Users are typically managed by admins
        version: updatedUserData.version || 1,
        modifiedBy: updatedUserData.modifiedBy || 'system'
      }
      
      this.emit('user_updated', event)
      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }

  async createUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserData | null> {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newUser = await response.json()
      const userWithTimestamps = {
        ...newUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Add to local cache
      this.users.set(newUser.id, userWithTimestamps)

      // Emit create event
      const event: UserUpdateEvent = {
        type: 'user_created',
        data: userWithTimestamps,
        timestamp: Date.now(),
        targetRoles: ['admin'],
        version: userWithTimestamps.version || 1,
        modifiedBy: userWithTimestamps.modifiedBy || 'system'
      }
      
      this.emit('user_created', event)
      return userWithTimestamps
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const userToDelete = this.users.get(userId)
      if (!userToDelete) return false

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Remove from local cache
      this.users.delete(userId)

      // Emit delete event
      const event: UserUpdateEvent = {
        type: 'user_deleted',
        data: userToDelete,
        timestamp: Date.now(),
        targetRoles: ['admin'],
        version: userToDelete.version || 1,
        modifiedBy: userToDelete.modifiedBy || 'system'
      }
      
      this.emit('user_deleted', event)
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  // Subscribe to real-time updates
  subscribe(callback: (event: UserUpdateEvent) => void): () => void {
    const eventHandler = (event: UserUpdateEvent) => {
      callback(event)
    }

    this.on('user_updated', eventHandler)
    this.on('user_created', eventHandler)
    this.on('user_deleted', eventHandler)

    // Return unsubscribe function
    return () => {
      this.off('user_updated', eventHandler)
      this.off('user_created', eventHandler)
      this.off('user_deleted', eventHandler)
    }
  }

  // Force refresh data
  async refreshData(): Promise<void> {
    await this.fetchUsers()
  }
}

// Create singleton instance
export const centralizedUserStore = new CentralizedUserStore()