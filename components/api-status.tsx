"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Server, ServerOff } from "lucide-react"

export function ApiStatus() {
  const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        const response = await fetch(`${baseUrl}/health`, {
          method: "GET",
          timeout: 5000,
        } as RequestInit)
        setIsApiOnline(response.ok)
      } catch {
        setIsApiOnline(false)
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (isApiOnline === null) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Server className="h-3 w-3" />
        Checking API...
      </Badge>
    )
  }

  return (
    <Badge variant={isApiOnline ? "default" : "destructive"} className="gap-1">
      {isApiOnline ? <Server className="h-3 w-3" /> : <ServerOff className="h-3 w-3" />}
      API {isApiOnline ? "Connected" : "Offline"}
    </Badge>
  )
}
