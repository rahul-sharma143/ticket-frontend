"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface RetryButtonProps {
  onRetry: () => Promise<void> | void
  disabled?: boolean
  children?: React.ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function RetryButton({
  onRetry,
  disabled = false,
  children = "Try Again",
  variant = "outline",
  size = "sm",
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleRetry} disabled={disabled || isRetrying}>
      <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
      {isRetrying ? "Retrying..." : children}
    </Button>
  )
}
