"use client"

import { useState, useEffect, useCallback } from 'react'
import { centralizedUserStore, type UserData } from './centralized-user-store'

export interface User extends UserData {
  updatedAt: string
}

export interface UseCentralizedUserDataReturn {
  users: User[]
  loading: boolean
  error: string | null
  updateUserData: (userId: string, data: Partial<User>) => Promise<boolean>
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User | null>
  deleteUser: (userId: string) => Promise<boolean>
  refreshData: () => Promise<void>
}

export function useCentralizedUserData(
  userRole: string = 'admin', 
  userId?: string
): UseCentralizedUserDataReturn {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to real-time updates
  useEffect(() => {
    const handleRealtimeUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'user_updated' || data.type === 'user_created' || data.type === 'user_deleted') {
          // Check if this update is relevant to the current user
          const isRelevant = userRole === 'admin' || 
            (userRole === 'agency' && data.data?.id === userId)
          
          if (isRelevant) {
            refreshData()
          }
        }
      } catch (error) {
        console.error('Error processing real-time update:', error)
      }
    }

    // Connect to SSE endpoint
    const eventSource = new EventSource('/api/events')
    eventSource.addEventListener('message', handleRealtimeUpdate)

    return () => {
      eventSource.close()
    }
  }, [userRole, userId])

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = centralizedUserStore.subscribe((event) => {
      // Check if this update is relevant to the current user role
      const isRelevant = userRole === 'admin' || 
        (userRole === 'agency' && event.data?.id === userId)
      
      if (isRelevant) {
        refreshData()
      }
    })

    return unsubscribe
  }, [userRole, userId])

  // Initial data load
  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Initialize store if needed
      await centralizedUserStore.initialize()
      
      // Get users based on role
      const data = await centralizedUserStore.getAllUsers(userRole as 'admin' | 'agency', userId)
      setUsers(data)
    } catch (err) {
      console.error('Error loading users:', err)
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [userRole, userId])

  // Load data on mount
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Update user data
  const updateUserData = useCallback(async (userId: string, data: Partial<User>): Promise<boolean> => {
    try {
      const success = await centralizedUserStore.updateUserData(userId, data)
      if (success) {
        await refreshData() // Refresh to get latest data
      }
      return success
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }, [refreshData])

  // Create user
  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> => {
    try {
      const newUser = await centralizedUserStore.createUser(userData)
      if (newUser) {
        await refreshData() // Refresh to get latest data
      }
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }, [refreshData])

  // Delete user
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const success = await centralizedUserStore.deleteUser(userId)
      if (success) {
        await refreshData() // Refresh to get latest data
      }
      return success
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }, [refreshData])

  return {
    users,
    loading,
    error,
    updateUserData,
    createUser,
    deleteUser,
    refreshData
  }
}