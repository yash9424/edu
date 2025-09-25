'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

type EventType = 'application' | 'payment' | 'agency' | 'college' | 'connection' | 'user' | 'course'
type EventAction = 'create' | 'update' | 'delete' | 'connect'

interface EventData {
  type: EventType
  action: EventAction
  data: any
}

interface UseRealTimeUpdatesProps {
  types: EventType[]
  onUpdate: (data: EventData) => void
  debounceMs?: number
  enabled?: boolean
}

export function useRealTimeUpdates({ 
  types, 
  onUpdate, 
  debounceMs = 300, 
  enabled = true 
}: UseRealTimeUpdatesProps) {
  const [isConnected, setIsConnected] = useState(false)
  
  // Use refs to store the latest values without causing re-renders
  const onUpdateRef = useRef(onUpdate)
  const typesRef = useRef(types)
  const enabledRef = useRef(enabled)
  const pendingUpdatesRef = useRef<{[key: string]: EventData}>({})
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  
  // Update refs when props change
  useEffect(() => {
    onUpdateRef.current = onUpdate
    typesRef.current = types
    enabledRef.current = enabled
  }, [onUpdate, types, enabled])
  
  // Process batched updates with debouncing
  const processPendingUpdates = useCallback(() => {
    const updates = Object.values(pendingUpdatesRef.current)
    pendingUpdatesRef.current = {}
    
    // Process each update
    updates.forEach(update => {
      if (onUpdateRef.current) {
        onUpdateRef.current(update)
      }
    })
  }, [])

  // Set up the event source only when enabled
  useEffect(() => {
    if (!enabled) {
      setIsConnected(false)
      return
    }
    
    let reconnectTimer: NodeJS.Timeout | null = null
    let isComponentMounted = true
    let connectionAttempts = 0
    const maxReconnectDelay = 10000 // 10 seconds max

    const connectEventSource = () => {
      if (!isComponentMounted || !enabledRef.current) return
      
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      
      // Use AbortController to handle cleanup more effectively
      const controller = new AbortController()
      
      // Implement exponential backoff for reconnection attempts
      const reconnectDelay = Math.min(1000 * Math.pow(1.5, connectionAttempts), maxReconnectDelay)
      connectionAttempts++
      
      try {
        eventSourceRef.current = new EventSource('/api/events')

        eventSourceRef.current.onopen = () => {
          if (isComponentMounted) {
            setIsConnected(true)
            connectionAttempts = 0 // Reset connection attempts on successful connection
          }
        }

        eventSourceRef.current.onmessage = (event) => {
          if (!isComponentMounted || !enabledRef.current) return
          
          try {
            const data: EventData = JSON.parse(event.data)
            if (data && data.type) {
              // Handle connection events separately
              if (data.type === 'connection') {
                return
              }
              
              // Handle other events if they match the requested types
              if (typesRef.current.includes(data.type)) {
                // Performance optimization: Skip processing if the component isn't visible
                if (typeof document !== 'undefined' && document.hidden) {
                  // Store the latest update for when the document becomes visible again
                  pendingUpdatesRef.current['latest_' + data.type] = data
                  return
                }
                
                // Create a unique key for this update to prevent duplicates
                const updateKey = `${data.type}_${data.action}_${data.data?.id || Date.now()}`
                
                // Store the update in the pending updates
                pendingUpdatesRef.current[updateKey] = data
                
                // Clear existing timer
                if (debounceTimerRef.current) {
                  clearTimeout(debounceTimerRef.current)
                }
                
                // Set new timer to process updates
                debounceTimerRef.current = setTimeout(() => {
                  if (isComponentMounted) {
                    processPendingUpdates()
                  }
                }, debounceMs)
              }
            }
          } catch (error) {
            console.error('Error parsing event data:', error)
          }
        }

        eventSourceRef.current.onerror = () => {
          if (!isComponentMounted) return
          
          setIsConnected(false)
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
          }
          
          // Attempt to reconnect after a delay
          reconnectTimer = setTimeout(() => {
            if (isComponentMounted) {
              connectEventSource()
            }
          }, reconnectDelay) // Use dynamic reconnect delay
        }
      } catch (error) {
        console.error('Error setting up EventSource:', error)
      }
    }

    // Initial connection
    connectEventSource()

    return () => {
      isComponentMounted = false
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [enabled, processPendingUpdates, debounceMs]) // Only reconnect when enabled changes

  return { isConnected }
}