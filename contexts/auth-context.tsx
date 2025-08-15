"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: "admin" | "user") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Mock authentication - simulate logged in admin user by default
  useEffect(() => {
    const mockUser: User = {
      id: "1",
      name: "Admin User",
      email: "admin@ticketbook.com",
      role: "admin",
    };
    setUser(mockUser);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic
    if (email && password) {
      const mockUser: User = {
        id: "1",
        name: email.includes("admin") ? "Admin User" : "Regular User",
        email,
        role: email.includes("admin") ? "admin" : "user",
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: "admin" | "user") => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
