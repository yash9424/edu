"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"

export function MigratePaymentsButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const handleMigration = async () => {
    try {
      setLoading(true)
      setResult("")
      
      const response = await fetch('/api/migrate-payments', {
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
        onClick={handleMigration} 
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Database className="h-4 w-4" />
        {loading ? "Migrating..." : "Migrate Applications to Payments"}
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">{result}</p>
      )}
    </div>
  )
}