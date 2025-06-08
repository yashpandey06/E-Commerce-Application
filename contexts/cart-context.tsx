"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image_url?: string
    stock?: number
  }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addToCart: (productId: number, quantity: number) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  clearCart: () => void
  loading: boolean
  fetchCart: () => Promise<void>
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  // Reset cart when user logs out
  useEffect(() => {
    console.log('Cart context - auth state changed:', { 
      user: !!user, 
      isAuthenticated,
      userId: user?.id 
    })
    
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching cart')
      fetchCart()
    } else {
      console.log('User not authenticated, clearing cart')
      setItems([])
      setError(null)
    }
  }, [isAuthenticated, user?.id]) // Include user.id to catch user changes

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    console.log('Cart - Getting auth headers, token exists:', !!token)
    
    if (!token) {
      throw new Error("Please login to continue")
    }
    
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }

  const handleAuthError = (response: Response) => {
    if (response.status === 401) {
      console.log('Unauthorized access, logging out')
      logout()
      toast({
        title: "Session expired",
        description: "Please login again",
        variant: "destructive"
      })
      return true
    }
    return false
  }

  const fetchCart = async () => {
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, skipping cart fetch')
      setItems([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching cart for user:', user.id)
      const headers = getAuthHeaders()
      
      const response = await fetch("/api/cart", {
        headers,
        cache: 'no-store' // Prevent caching issues
      })

      console.log('Cart fetch response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Cart data received:', data)
        
        // Handle different response formats
        if (data.items) {
          setItems(data.items)
        } else if (Array.isArray(data)) {
          setItems(data)
        } else {
          setItems([])
        }
        
        setError(null)
      } else if (response.status === 404) {
        // Cart doesn't exist yet - this is normal for new users
        console.log('Cart not found (404) - initializing empty cart')
        setItems([])
        setError(null)
      } else if (handleAuthError(response)) {
        return // Auth error handled
      } else {
        // Try to get error message from response
        let errorMessage = `Failed to fetch cart (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, try text
          try {
            const errorText = await response.text()
            if (errorText && !errorText.includes('<!DOCTYPE')) {
              errorMessage = errorText
            }
          } catch {
            // Use default message
          }
        }
        
        console.error('Cart fetch error:', errorMessage)
        setError(errorMessage)
        
        // Don't show toast for cart fetch errors to avoid spam
        // toast({
        //   title: "Error",
        //   description: errorMessage,
        //   variant: "destructive"
        // })
      }
    } catch (error) {
      console.error("Network error fetching cart:", error)
      setError("Network error - please check your connection")
      
      // Only show toast for network errors, not HTTP errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Please check your internet connection",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated || !user) {
      throw new Error("Please login to add items to cart")
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Adding to cart:', { productId, quantity, userId: user.id })
      const headers = getAuthHeaders()

      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      })

      console.log('Add to cart response status:', response.status)

      if (response.ok) {
        console.log('Successfully added to cart')
        await fetchCart() // Refresh cart after adding
        // Remove the toast from here - let the UI handle it
      } else if (handleAuthError(response)) {
        throw new Error("Please login to continue")
      } else {
        let errorMessage = "Failed to add item to cart"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // Use default message
        }
        
        console.error('Add to cart error:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setError(error instanceof Error ? error.message : "Failed to add to cart")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (itemId: number) => {
    if (!isAuthenticated) {
      throw new Error("Please login to continue")
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Removing from cart:', { itemId, userId: user?.id })
      const headers = getAuthHeaders()

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers
      })

      console.log('Remove from cart response status:', response.status)

      if (response.ok) {
        console.log('Successfully removed from cart')
        await fetchCart() // Refresh cart after removing
        toast({
          title: "Removed from cart",
          description: "Item removed from your cart"
        })
      } else if (handleAuthError(response)) {
        throw new Error("Please login to continue")
      } else {
        let errorMessage = "Failed to remove item from cart"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // Use default message
        }
        
        console.error('Remove from cart error:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      setError(error instanceof Error ? error.message : "Failed to remove from cart")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error("Please login to continue")
    }

    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      return removeFromCart(itemId)
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Updating cart quantity:', { itemId, quantity, userId: user?.id })
      const headers = getAuthHeaders()

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ quantity })
      })

      console.log('Update quantity response status:', response.status)

      if (response.ok) {
        console.log('Successfully updated quantity')
        await fetchCart() // Refresh cart after updating
      } else if (handleAuthError(response)) {
        throw new Error("Please login to continue")
      } else {
        let errorMessage = "Failed to update quantity"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // Use default message
        }
        
        console.error('Update quantity error:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      setError(error instanceof Error ? error.message : "Failed to update quantity")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearCart = () => {
    console.log('Clearing cart locally')
    setItems([])
    setError(null)
  }

  // Calculate derived values
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const total = items.reduce((total, item) => total + (item.product.price * item.quantity), 0)

  const value = {
    items,
    itemCount,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading,
    fetchCart,
    error
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}