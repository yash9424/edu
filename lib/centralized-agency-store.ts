'use client'

import { EventEmitter } from 'events'

export interface AgencyData {
  id: string
  name: string
  email: string
  phone: string
  address: string
  contactPerson: string
  commissionRate: number
  status: 'active' | 'inactive'
  createdAt: string
  userId?: string
  username?: string
  description?: string
  website?: string
  totalApplications?: number
  totalRevenue?: number
  version: number
  lastModified: string
  modifiedBy: string
}

export interface DataVersion {
  version: number
  timestamp: string
  modifiedBy: string
  changes: Partial<AgencyData>
  previousData: Partial<AgencyData>
}

export interface SyncEvent {
  type: 'agency_update' | 'agency_create' | 'agency_delete'
  agencyId: string
  data: AgencyData
  version: number
  timestamp: string
  modifiedBy: string
  targetRoles: ('admin' | 'agency')[]
  targetAgencyIds?: string[]
}

class CentralizedAgencyStore extends EventEmitter {
  private agencies: Map<string, AgencyData> = new Map()
  private versions: Map<string, DataVersion[]> = new Map()
  private subscribers: Map<string, {
    role: 'admin' | 'agency'
    agencyId?: string
    callback: (event: SyncEvent) => void
  }> = new Map()

  constructor() {
    super()
    this.setMaxListeners(100) // Increase max listeners for multiple components
  }

  // Initialize store with data from server
  async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/admin/agencies')
      if (response.ok) {
        const agenciesData = await response.json()
        const agencies = Array.isArray(agenciesData) ? agenciesData : agenciesData.agencies || []
        
        agencies.forEach((agency: any) => {
          const agencyData: AgencyData = {
            ...agency,
            version: agency.version || 1,
            lastModified: agency.lastModified || new Date().toISOString(),
            modifiedBy: agency.modifiedBy || 'system'
          }
          this.agencies.set(agency.id, agencyData)
        })
      }
    } catch (error) {
      console.error('Failed to initialize agency store:', error)
    }
  }

  // Get agency data with role-based filtering
  getAgency(agencyId: string, requestingRole: 'admin' | 'agency', requestingAgencyId?: string): AgencyData | null {
    const agency = this.agencies.get(agencyId)
    if (!agency) return null

    // Admin can see all agencies
    if (requestingRole === 'admin') {
      return { ...agency }
    }

    // Agency can only see their own data
    if (requestingRole === 'agency' && requestingAgencyId === agencyId) {
      return { ...agency }
    }

    return null
  }

  // Get all agencies with role-based filtering
  getAllAgencies(requestingRole: 'admin' | 'agency', requestingAgencyId?: string): AgencyData[] {
    const agencies = Array.from(this.agencies.values())

    if (requestingRole === 'admin') {
      return agencies.map(agency => ({ ...agency }))
    }

    if (requestingRole === 'agency' && requestingAgencyId) {
      const agency = agencies.find(a => a.id === requestingAgencyId)
      return agency ? [{ ...agency }] : []
    }

    return []
  }

  // Update agency with conflict resolution
  async updateAgency(
    agencyId: string, 
    updates: Partial<AgencyData>, 
    modifiedBy: string,
    expectedVersion?: number
  ): Promise<{ success: boolean; data?: AgencyData; error?: string }> {
    const currentAgency = this.agencies.get(agencyId)
    
    if (!currentAgency) {
      return { success: false, error: 'Agency not found' }
    }

    // Version conflict check
    if (expectedVersion && currentAgency.version !== expectedVersion) {
      return { 
        success: false, 
        error: `Version conflict. Expected ${expectedVersion}, current ${currentAgency.version}` 
      }
    }

    // Store previous version
    const previousData = { ...currentAgency }
    const newVersion = currentAgency.version + 1
    const timestamp = new Date().toISOString()

    // Create updated agency data
    const updatedAgency: AgencyData = {
      ...currentAgency,
      ...updates,
      version: newVersion,
      lastModified: timestamp,
      modifiedBy
    }

    // Store version history
    const versions = this.versions.get(agencyId) || []
    versions.push({
      version: newVersion,
      timestamp,
      modifiedBy,
      changes: updates,
      previousData
    })
    
    // Keep only last 10 versions
    if (versions.length > 10) {
      versions.splice(0, versions.length - 10)
    }
    
    this.versions.set(agencyId, versions)

    try {
      // Update server
      const response = await fetch(`/api/admin/agencies/${agencyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          version: newVersion,
          lastModified: timestamp,
          modifiedBy
        })
      })

      if (!response.ok) {
        throw new Error('Server update failed')
      }

      // Update local store
      this.agencies.set(agencyId, updatedAgency)

      // Broadcast to subscribers
      this.broadcastUpdate({
        type: 'agency_update',
        agencyId,
        data: updatedAgency,
        version: newVersion,
        timestamp,
        modifiedBy,
        targetRoles: ['admin', 'agency'],
        targetAgencyIds: [agencyId]
      })

      return { success: true, data: updatedAgency }
    } catch (error) {
      console.error('Failed to update agency:', error)
      return { success: false, error: 'Failed to update agency' }
    }
  }

  // Subscribe to updates with role-based filtering
  subscribe(
    subscriberId: string,
    role: 'admin' | 'agency',
    callback: (event: SyncEvent) => void,
    agencyId?: string
  ): void {
    this.subscribers.set(subscriberId, {
      role,
      agencyId,
      callback
    })
  }

  // Unsubscribe from updates
  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId)
  }

  // Broadcast updates to relevant subscribers
  private broadcastUpdate(event: SyncEvent): void {
    this.subscribers.forEach((subscriber, subscriberId) => {
      let shouldReceiveUpdate = false

      // Admin receives all updates
      if (subscriber.role === 'admin' && event.targetRoles.includes('admin')) {
        shouldReceiveUpdate = true
      }
      // Agency receives updates for their own data
      else if (
        subscriber.role === 'agency' && 
        event.targetRoles.includes('agency') &&
        event.targetAgencyIds?.includes(subscriber.agencyId || '')
      ) {
        shouldReceiveUpdate = true
      }

      if (shouldReceiveUpdate) {
        try {
          subscriber.callback(event)
        } catch (error) {
          console.error(`Error in subscriber ${subscriberId}:`, error)
        }
      }
    })
  }

  // Get version history for an agency
  getVersionHistory(agencyId: string): DataVersion[] {
    return this.versions.get(agencyId) || []
  }

  // Rollback to a previous version
  async rollbackToVersion(
    agencyId: string, 
    targetVersion: number, 
    modifiedBy: string
  ): Promise<{ success: boolean; data?: AgencyData; error?: string }> {
    const versions = this.versions.get(agencyId) || []
    const targetVersionData = versions.find(v => v.version === targetVersion)
    
    if (!targetVersionData) {
      return { success: false, error: 'Version not found' }
    }

    // Reconstruct data at target version
    const currentAgency = this.agencies.get(agencyId)
    if (!currentAgency) {
      return { success: false, error: 'Agency not found' }
    }

    // Apply rollback
    const rollbackData = {
      ...targetVersionData.previousData,
      version: currentAgency.version + 1,
      lastModified: new Date().toISOString(),
      modifiedBy: `${modifiedBy} (rollback to v${targetVersion})`
    }

    return this.updateAgency(agencyId, rollbackData, modifiedBy)
  }

  // Clear all data (for cleanup)
  clear(): void {
    this.agencies.clear()
    this.versions.clear()
    this.subscribers.clear()
    this.removeAllListeners()
  }
}

// Singleton instance
export const centralizedAgencyStore = new CentralizedAgencyStore()

// Initialize on first import
if (typeof window !== 'undefined') {
  centralizedAgencyStore.initialize().catch(console.error)
}