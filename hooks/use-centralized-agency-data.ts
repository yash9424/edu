'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { centralizedAgencyStore, AgencyData, SyncEvent } from '@/lib/centralized-agency-store'

interface UseCentralizedAgencyDataProps {
  role: 'admin' | 'agency'
  agencyId?: string
  userId?: string
  autoRefresh?: boolean
}

interface UseCentralizedAgencyDataReturn {
  agencies: AgencyData[]
  agency: AgencyData | null
  loading: boolean
  error: string | null
  updateAgency: (agencyId: string, updates: Partial<AgencyData>) => Promise<{ success: boolean; error?: string }>
  refreshData: () => Promise<void>
  getVersionHistory: (agencyId: string) => any[]
  rollbackToVersion: (agencyId: string, version: number) => Promise<{ success: boolean; error?: string }>
}

export function useCentralizedAgencyData({
  role,
  agencyId,
  userId,
  autoRefresh = true
}: UseCentralizedAgencyDataProps): UseCentralizedAgencyDataReturn {
  const [agencies, setAgencies] = useState<AgencyData[]>([])
  const [agency, setAgency] = useState<AgencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const subscriberIdRef = useRef<string>()
  const mountedRef = useRef(true)

  // Generate unique subscriber ID
  useEffect(() => {
    subscriberIdRef.current = `${role}_${agencyId || 'all'}_${Date.now()}_${Math.random()}`
    
    return () => {
      mountedRef.current = false
    }
  }, [role, agencyId])

  // Handle real-time updates
  const handleSyncEvent = useCallback((event: SyncEvent) => {
    if (!mountedRef.current) return

    console.log('Received sync event:', event)

    switch (event.type) {
      case 'agency_update':
        setAgencies(prev => {
          const updated = prev.map(a => 
            a.id === event.agencyId ? { ...event.data } : a
          )
          return updated
        })
        
        if (agencyId === event.agencyId) {
          setAgency({ ...event.data })
        }
        break

      case 'agency_create':
        setAgencies(prev => {
          const exists = prev.some(a => a.id === event.agencyId)
          if (!exists) {
            return [...prev, { ...event.data }]
          }
          return prev
        })
        break

      case 'agency_delete':
        setAgencies(prev => prev.filter(a => a.id !== event.agencyId))
        if (agencyId === event.agencyId) {
          setAgency(null)
        }
        break
    }
  }, [agencyId])

  // Load initial data
  const loadData = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      setLoading(true)
      setError(null)

      // Initialize store if needed
      await centralizedAgencyStore.initialize()

      // Get agencies based on role
      const agenciesData = centralizedAgencyStore.getAllAgencies(role, agencyId)
      
      if (mountedRef.current) {
        setAgencies(agenciesData)

        // Set single agency if agencyId is provided
        if (agencyId) {
          const singleAgency = centralizedAgencyStore.getAgency(agencyId, role, agencyId)
          setAgency(singleAgency)
        }
      }
    } catch (err) {
      console.error('Failed to load agency data:', err)
      if (mountedRef.current) {
        setError('Failed to load agency data')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [role, agencyId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!autoRefresh || !subscriberIdRef.current) return

    centralizedAgencyStore.subscribe(
      subscriberIdRef.current,
      role,
      handleSyncEvent,
      agencyId
    )

    return () => {
      if (subscriberIdRef.current) {
        centralizedAgencyStore.unsubscribe(subscriberIdRef.current)
      }
    }
  }, [role, agencyId, handleSyncEvent, autoRefresh])

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData()
  }, [loadData])

  // Update agency function
  const updateAgency = useCallback(async (
    targetAgencyId: string, 
    updates: Partial<AgencyData>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const modifiedBy = userId || 'unknown'
      const result = await centralizedAgencyStore.updateAgency(
        targetAgencyId,
        updates,
        modifiedBy
      )

      if (!result.success) {
        setError(result.error || 'Update failed')
      }

      return result
    } catch (err) {
      const errorMessage = 'Failed to update agency'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [userId])

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  // Get version history
  const getVersionHistory = useCallback((targetAgencyId: string) => {
    return centralizedAgencyStore.getVersionHistory(targetAgencyId)
  }, [])

  // Rollback to version
  const rollbackToVersion = useCallback(async (
    targetAgencyId: string, 
    version: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const modifiedBy = userId || 'unknown'
      const result = await centralizedAgencyStore.rollbackToVersion(
        targetAgencyId,
        version,
        modifiedBy
      )

      if (!result.success) {
        setError(result.error || 'Rollback failed')
      }

      return result
    } catch (err) {
      const errorMessage = 'Failed to rollback agency'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [userId])

  return {
    agencies,
    agency,
    loading,
    error,
    updateAgency,
    refreshData,
    getVersionHistory,
    rollbackToVersion
  }
}