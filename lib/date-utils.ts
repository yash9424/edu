"use client"

/**
 * Date formatting utilities to prevent hydration mismatches
 * between server and client rendering
 */

import { useState, useEffect } from "react"

/**
 * Hook to safely format dates on the client side only
 * This prevents hydration mismatches caused by locale differences
 * between server and client environments
 */
export function useClientDate() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Safely format a date string for display
 * Returns the raw date string during SSR and formatted date on client
 * 
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or raw date string during SSR
 */
export function formatDateSafe(
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return ""
  
  // During SSR, return the raw date string to prevent hydration mismatch
  if (typeof window === "undefined") {
    return dateString
  }
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, options)
  } catch (error) {
    console.warn("Invalid date string:", dateString)
    return dateString
  }
}

/**
 * Default date formatting options for consistency
 */
export const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}

export const COMPACT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: 'numeric',
  day: 'numeric'
}