'use client'

import { useState, useEffect, useRef } from 'react'
import { useRealTimeUpdates } from './use-real-time-updates'

// Global cache for usernames to prevent redundant fetches across components
const usernameCache: Record<string, {username: string, timestamp: number}> = {}

export function useRealTimeUsername(userId?: string) {
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!userId) return

    // Check if we have a cached username that's less than 5 minutes old
    const cachedData = usernameCache[userId]
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    if (cachedData && (now - cachedData.timestamp < fiveMinutes)) {
      setUsername(cachedData.username)
      setIsLoading(false)
      return
    }

    // Clean up previous fetch if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new abort controller for this fetch
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setIsLoading(true)
    setError(null)

    // Initial fetch with abort signal
    fetch(`/api/user/${userId}/username`, { signal })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch username: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setUsername(data.username)
        setIsLoading(false)
        
        // Cache the username
        usernameCache[userId] = {
          username: data.username,
          timestamp: Date.now()
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        
        console.error(err)
        setError(err)
        setIsLoading(false)
      })
      
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [userId])

  // Subscribe to real-time updates
  useRealTimeUpdates({
    types: ['user'],
    onUpdate: (event) => {
      if (event.type === 'user' && event.data.id === userId) {
        setUsername(event.data.username)
        setError(null) // Clear any previous errors when we get an update
      }
    }
  })

  return { username, isLoading, error }
}