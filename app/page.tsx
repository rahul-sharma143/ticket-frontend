"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { BookingProvider } from "@/contexts/booking-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStatus } from "@/components/network-status";
import { ApiStatus } from "@/components/api-status";
import { Navigation } from "@/components/navigation";
import { ShowList } from "@/components/show-list";

export default function HomePage() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <NetworkStatus />
                <ApiStatus />
              </div>
              <ShowList />
            </main>
          </div>
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
