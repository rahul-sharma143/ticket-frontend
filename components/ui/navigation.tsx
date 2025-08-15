"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const pathname = usePathname()
  const { user, switchRole } = useAuth()

  return (
    <Card className="border-b rounded-none">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-primary">TicketBook</h1>
            <div className="flex space-x-4">
              <Link href="/">
                <Button variant={pathname === "/" ? "default" : "ghost"} className="font-medium">
                  Shows
                </Button>
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant={pathname === "/admin" ? "default" : "ghost"} className="font-medium">
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome, </span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <Badge variant={user?.role === "admin" ? "default" : "secondary"}>{user?.role}</Badge>
            <Button variant="outline" size="sm" onClick={() => switchRole(user?.role === "admin" ? "user" : "admin")}>
              Switch to {user?.role === "admin" ? "User" : "Admin"}
            </Button>
          </div>
        </div>
      </nav>
    </Card>
  )
}
