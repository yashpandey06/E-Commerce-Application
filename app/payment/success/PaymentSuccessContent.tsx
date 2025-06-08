"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { CheckCircle, Loader } from "lucide-react"

export default function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(true)
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const paymentId = searchParams.get("paymentId")
    const payerId = searchParams.get("PayerID")

    if (paymentId && payerId) {
      executePayment(paymentId, payerId)
    } else {
      toast({
        title: "Error",
        description: "Missing payment information",
        variant: "destructive"
      })
      router.push("/cart")
    }
  }, [user, searchParams])

  const executePayment = async (paymentId: string, payerId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch("api/payment/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          payer_id: payerId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setOrderData(data)
        toast({
          title: "Payment Successful!",
          description: "Your order has been placed successfully"
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Payment execution failed")
      }
    } catch (error) {
      console.error("Payment execution error:", error)
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Payment execution failed",
        variant: "destructive"
      })
      router.push("/cart")
    } finally {
      setProcessing(false)
    }
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardContent className="text-center py-12">
              <Loader className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Processing Payment...</h2>
              <p className="text-gray-600 dark:text-gray-300">Please wait while we confirm your payment.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Your payment has been processed successfully.</p>
            
            {orderData && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Order ID: #{orderData.order_id}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID: {orderData.payment_id}</p>
              </div>
            )}
            
            <div className="space-y-2 pt-4">
              <Button 
                onClick={() => router.push("/profile?tab=orders")} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                View Order History
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