"use client"

import { useState, useEffect, useCallback } from 'react'
import { centralizedAgencyStore, type AgencyData } from './centralized-agency-store'

export interface Agency extends AgencyData {
  updatedAt: string
}

export interface UseCentralizedAgencyDataReturn {
  agencies: Agency[]
  loading: boolean
  error: string | null
  updateAgencyData: (agencyId: string, data: Partial<Agency>) => Promise<boolean>
  refreshData: () => Promise<void>
  getVersionHistory: (agencyId: string) => any[]
  rollbackToVersion: (agencyId: string, version: number) => Promise<boolean>
}

export function useCentralizedAgencyData(
  userRole: string, 
  agencyId?: string
): UseCentralizedAgencyDataReturn {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to real-time updates
  useEffect(() => {
    const handleRealtimeUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'agency_updated' || data.type === 'agency_created') {
          // Check if this update is relevant to the current user
          const isRelevant = userRole === 'admin' || 
            (userRole === 'agency' && data.data?.id === agencyId)
          
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
  }, [userRole, agencyId])

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = centralizedAgencyStore.getAllAgencies(userRole as 'admin' | 'agency', agencyId)
      setAgencies(data.map(agency => ({ ...agency, updatedAt: agency.lastModified })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agency data')
    } finally {
      setLoading(false)
    }
  }, [userRole, agencyId])

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  // Update agency data
  const updateAgencyData = useCallback(async (
    targetAgencyId: string, 
    updateData: Partial<Agency>
  ): Promise<boolean> => {
    try {
      const result = await centralizedAgencyStore.updateAgency(
        targetAgencyId, 
        updateData, 
        `${userRole}-${agencyId || 'system'}`
      )
      if (result.success) {
        // Optimistically update local state
        setAgencies(prev => prev.map(agency => 
          agency.id === targetAgencyId 
            ? { ...agency, ...updateData, updatedAt: new Date().toISOString() }
            : agency
        ))
      }
      return result.success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agency')
      return false
    }
  }, [userRole, agencyId])

  // Get version history
  const getVersionHistory = useCallback((targetAgencyId: string) => {
    return centralizedAgencyStore.getVersionHistory(targetAgencyId)
  }, [])

  // Rollback to version
  const rollbackToVersion = useCallback(async (
    targetAgencyId: string, 
    version: number
  ): Promise<boolean> => {
    try {
      const result = await centralizedAgencyStore.rollbackToVersion(
        targetAgencyId, 
        version, 
        `${userRole}-${agencyId || 'system'}`
      )
      if (result.success) {
        await refreshData()
      }
      return result.success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rollback')
      return false
    }
  }, [refreshData, userRole, agencyId])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    agencies,
    loading,
    error,
    updateAgencyData,
    refreshData,
    getVersionHistory,
    rollbackToVersion
  }
}