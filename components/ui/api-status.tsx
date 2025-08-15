"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function ApiStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkApiStatus = async () => {
    setIsChecking(true);
    try {
      const response: { status: string; timestamp: string } =
        await apiClient.healthCheck();
      setIsConnected(response.status === "ok");
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkApiStatus();

    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return null;
  }

  if (isConnected) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <Wifi className="w-3 h-3 mr-1" />
        API Connected
      </Badge>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          API server is not available. Running in offline mode with limited
          functionality.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={checkApiStatus}
          disabled={isChecking}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
          />
          {isChecking ? "Checking..." : "Retry"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
