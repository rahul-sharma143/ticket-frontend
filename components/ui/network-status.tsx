"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus()

  if (isOnline && !wasOffline) {
    return null
  }

  if (!isOnline) {
    return (
      <Alert variant="destructive" className="mb-4">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          You are currently offline. Some features may not work properly until your connection is restored.
        </AlertDescription>
      </Alert>
    )
  }

  if (wasOffline && isOnline) {
    return (
      <Alert className="mb-4">
        <Wifi className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          Connection restored! You are back online.
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
