"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function SyncPaymentsButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const handleSync = async () => {
    try {
      setLoading(true)
      setResult("")
      
      const response = await fetch('/api/sync-payments', {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(data.message)
      } else {
        setResult(`Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleSync} 
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        {loading ? "Syncing..." : "Sync Payments"}
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">{result}</p>
      )}
    </div>
  )
}