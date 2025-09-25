"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, User } from "lucide-react"
import { EscalationMatrix } from "@/lib/data-store"

export function EscalationMatrixDisplay() {
  const [escalationMatrix, setEscalationMatrix] = useState<EscalationMatrix[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEscalationMatrix()
  }, [])

  const fetchEscalationMatrix = async () => {
    try {
      const response = await fetch('/api/agency/escalation-matrix')
      if (response.ok) {
        const data = await response.json()
        setEscalationMatrix(data.escalationMatrix || [])
      }
    } catch (error) {
      console.error('Failed to fetch escalation matrix:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (escalationMatrix.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No escalation contacts available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Contact these support representatives for assistance
      </p>
      
      {escalationMatrix.map((contact) => (
        <Card key={contact.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base">{contact.position}</span>
                  <Badge variant="outline" className="text-xs">
                    Level {contact.level}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {contact.name}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <a 
                      href={`tel:${contact.mobile}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {contact.mobile}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-xs text-muted-foreground mt-4">
        Contact Level 1 first, then escalate to higher levels if needed.
      </div>
    </div>
  )
}