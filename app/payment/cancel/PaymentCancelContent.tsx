"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { XCircle } from "lucide-react"

export default function PaymentCancelContent() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Your payment was cancelled. No charges were made to your account.</p>
            
            <div className="space-y-2 pt-4">
              <Button 
                onClick={() => router.push("/cart")} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Return to Cart
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/products")} 
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}