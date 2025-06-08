// contexts/auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  email: string
  username: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string, role?: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check both possible token keys for backward compatibility
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      
      console.log("Checking auth status, token exists:", !!token)
      
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token and get user info using proxy route
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      console.log("Auth check response status:", response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log("User data received:", userData)
        setUser(userData)
        
        // Ensure we're using the correct token key
        if (!localStorage.getItem("token") && localStorage.getItem("access_token")) {
          localStorage.setItem("token", token)
          localStorage.removeItem("access_token")
        }
      } else {
        console.log("Token invalid, removing from storage")
        // Token is invalid, remove it
        localStorage.removeItem("token")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      // On error, clear tokens
      localStorage.removeItem("token")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return userData
      } else {
        throw new Error(`Failed to fetch user info: ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
      // Clear tokens on error
      localStorage.removeItem("token")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      setUser(null)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email)
      
      // Use proxy route instead of direct backend call
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Login response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Login error:", errorData)
        throw new Error(errorData.detail || errorData.error || "Login failed")
      }

      const data = await response.json()
      console.log("Login successful, token received")

      // Store token with consistent key
      localStorage.setItem("token", data.access_token)
      
      // Store refresh token if provided
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }

      // Fetch user info after successful login
      const userData = await fetchUserInfo(data.access_token)
      
      toast({
        title: "Success",
        description: "Logged in successfully"
      })

      return userData
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive"
      })
      throw error
    }
  }

  const signup = async (email: string, username: string, password: string, role = "customer") => {
    try {
      console.log("Attempting signup for:", email)
      
      // Use proxy route instead of direct backend call
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password, role }),
      })

      console.log("Signup response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Signup error:", errorData)
        throw new Error(errorData.detail || errorData.error || "Signup failed")
      }

      toast({
        title: "Success",
        description: "Account created successfully"
      })

      // Auto login after signup
      await login(email, password)
    } catch (error) {
      console.error("Signup failed:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Signup failed",
        variant: "destructive"
      })
      throw error
    }
  }

  const logout = () => {
    console.log("Logging out user")
    
    // Clear all tokens
    localStorage.removeItem("token")
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    
    // Clear user state
    setUser(null)
    
    toast({
      title: "Success",
      description: "Logged out successfully"
    })
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user && !loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}