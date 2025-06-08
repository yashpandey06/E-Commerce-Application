"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { 
  ArrowLeft,
  Package, 
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  User,
  XCircle,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  Star,
  Heart,
  ShoppingCart,
  Copy,
  Check,
  FileText
} from "lucide-react"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  image_url?: string
}

interface OrderDetails {
  id: number
  total_amount: number
  status: string
  created_at: string
  updated_at?: string
  payment_intent_id: string
  items: OrderItem[]
  shipping_address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  estimated_delivery?: string
  tracking_number?: string
}

export default function OrderDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    
    if (orderId) {
      fetchOrderDetails()
    }
  }, [user, orderId])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return null
    }
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }

  const fetchOrderDetails = async () => {
    try {
      const headers = getAuthHeaders()
      if (!headers) return

      console.log(`Fetching order details for order ID: ${orderId}`)
      
      const response = await fetch(`/api/orders/${orderId}`, {
        headers
      })
      
      console.log('Order details response status:', response.status)
      
      if (response.ok) {
        const orderData = await response.json()
        console.log('Order details received:', orderData)
        setOrder(orderData)
      } else if (response.status === 401) {
        logout()
      } else if (response.status === 404) {
        toast({
          title: "Order not found",
          description: "The order you're looking for doesn't exist or you don't have permission to view it.",
          variant: "destructive"
        })
        router.push("/profile?tab=orders")
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: errorData.detail || "Failed to load order details",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async () => {
    if (!order) return
    
    setCancelling(true)
    try {
      const headers = getAuthHeaders()
      if (!headers) return

      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "PUT",
        headers
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Order cancelled successfully"
        })
        fetchOrderDetails()
      } else if (response.status === 401) {
        logout()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.detail || "Failed to cancel order",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      })
    } finally {
      setCancelling(false)
    }
  }

  const reorderItems = async () => {
    if (!order) return
    
    setReordering(true)
    try {
      // Add each item to cart
      for (const item of order.items) {
        const headers = getAuthHeaders()
        if (!headers) return

        await fetch("/api/cart/items", {
          method: "POST",
          headers,
          body: JSON.stringify({
            product_id: item.product_id,
            quantity: item.quantity
          })
        })
      }
      
      toast({
        title: "Items added to cart",
        description: "All items from this order have been added to your cart",
      })
      
      router.push("/cart")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart",
        variant: "destructive"
      })
    } finally {
      setReordering(false)
    }
  }

  const generateAndDownloadInvoice = async () => {
    if (!order || !user) return
    
    setDownloadingInvoice(true)
    
    try {
      // Generate PDF using jsPDF
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      // Colors
      const primaryColor = [147, 51, 234] // Purple
      const secondaryColor = [236, 72, 153] // Pink
      const darkGray = [55, 65, 81]
      const lightGray = [156, 163, 175]
      
      // Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(0, 0, 210, 40, 'F')
      
      // Company Logo/Name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('ShopEase', 20, 25)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Your Premium E-commerce Store', 20, 32)
      
      // Invoice Title
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFontSize(28)
      doc.setFont('helvetica', 'bold')
      doc.text('INVOICE', 140, 25)
      
      // Order Details
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Order #${order.id}`, 140, 32)
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 37)
      
      // Customer Information
      let yPos = 60
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text('Bill To:', 20, yPos)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.text(user.username || 'Customer', 20, yPos + 8)
      doc.text(user.email || '', 20, yPos + 16)
      
      if (order.shipping_address) {
        doc.text(order.shipping_address.street, 20, yPos + 24)
        doc.text(`${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}`, 20, yPos + 32)
        doc.text(order.shipping_address.country, 20, yPos + 40)
      }
      
      // Order Status
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text('Order Status:', 120, yPos)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.text(order.status.charAt(0).toUpperCase() + order.status.slice(1), 120, yPos + 8)
      doc.text(`Payment ID: ${order.payment_intent_id.slice(0, 16)}...`, 120, yPos + 16)
      
      if (order.tracking_number) {
        doc.text(`Tracking: ${order.tracking_number}`, 120, yPos + 24)
      }
      
      // Table Header
      yPos = 120
      doc.setFillColor(240, 240, 240)
      doc.rect(20, yPos, 170, 10, 'F')
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.text('Item', 25, yPos + 7)
      doc.text('Qty', 120, yPos + 7)
      doc.text('Price', 140, yPos + 7)
      doc.text('Total', 170, yPos + 7)
      
      // Table Items
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      
      let subtotal = 0
      
      order.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity
        subtotal += itemTotal
        
        // Alternate row background
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(20, yPos - 3, 170, 12, 'F')
        }
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
        
        // Product name (truncate if too long)
        const productName = item.product_name.length > 35 
          ? item.product_name.substring(0, 35) + '...' 
          : item.product_name
        doc.text(productName, 25, yPos + 4)
        
        doc.text(item.quantity.toString(), 125, yPos + 4)
        doc.text(`₹${item.price.toFixed(2)}`, 140, yPos + 4)
        doc.text(`₹${itemTotal.toFixed(2)}`, 170, yPos + 4)
        
        yPos += 12
      })
      
      // Totals
      yPos += 10
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2])
      doc.line(20, yPos, 190, yPos)
      
      yPos += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Subtotal
      doc.text('Subtotal:', 140, yPos)
      doc.text(`₹${subtotal.toFixed(2)}`, 170, yPos)
      
      // Shipping
      yPos += 8
      doc.text('Shipping:', 140, yPos)
      doc.setTextColor(34, 197, 94) // Green
      doc.text('FREE', 170, yPos)
      
      // Tax
      yPos += 8
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.text('Tax:', 140, yPos)
      doc.text('₹0.00', 170, yPos)
      
      // Total
      yPos += 12
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(130, yPos - 5, 60, 12, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL:', 140, yPos + 2)
      doc.text(`₹${order.total_amount.toFixed(2)}`, 170, yPos + 2)
      
      // Footer
      yPos = 260
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Thank you for your business!', 20, yPos)
      doc.text('For support, contact us at support@shopease.com', 20, yPos + 5)
      doc.text(`Invoice generated on ${new Date().toLocaleDateString()}`, 20, yPos + 10)
      
      // Terms (if space allows)
      if (yPos < 280) {
        yPos += 20
        doc.setFontSize(7)
        doc.text('Terms & Conditions: All sales are final. Returns accepted within 30 days.', 20, yPos)
        doc.text('This invoice was generated electronically and is valid without signature.', 20, yPos + 4)
      }
      
      // Save the PDF
      const fileName = `invoice-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully",
      })
      
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast({
        title: "Download Failed",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const copyOrderId = async () => {
    await navigator.clipboard.writeText(order?.id.toString() || "")
    setIsCopied(true)
    toast({
      title: "Copied!",
      description: "Order ID copied to clipboard",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const shareOrder = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: `Order #${order.id}`,
          text: `Check out my order details`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      copyOrderId()
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
        return {
          color: "bg-blue-500",
          text: "Order Placed",
          icon: CheckCircle,
          progress: 25,
          description: "Your order has been received and is being processed"
        }
      case "confirmed":
        return {
          color: "bg-orange-500",
          text: "Confirmed",
          icon: Clock,
          progress: 50,
          description: "Your order has been confirmed and is being prepared"
        }
      case "shipped":
        return {
          color: "bg-purple-500",
          text: "Shipped",
          icon: Truck,
          progress: 75,
          description: "Your order is on its way to you"
        }
      case "delivered":
        return {
          color: "bg-green-500",
          text: "Delivered",
          icon: Package,
          progress: 100,
          description: "Your order has been delivered successfully"
        }
      case "cancelled":
        return {
          color: "bg-red-500",
          text: "Cancelled",
          icon: XCircle,
          progress: 0,
          description: "This order has been cancelled"
        }
      default:
        return {
          color: "bg-gray-500",
          text: status,
          icon: AlertCircle,
          progress: 0,
          description: "Status unknown"
        }
    }
  }

  const statusConfig = order ? getStatusConfig(order.status) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-lg border border-white/20 dark:border-gray-700/20">
              <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Order Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button onClick={() => router.push("/profile?tab=orders")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig?.icon || AlertCircle

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/profile?tab=orders")}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Order #{order.id}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyOrderId}
                    className="p-1 h-auto"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Order details and tracking information</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={shareOrder} size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <Button 
                  variant="outline" 
                  onClick={reorderItems}
                  disabled={reordering}
                  size="sm"
                >
                  {reordering ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  Reorder
                </Button>
              )}
              
              {order.status === "created" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Order</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this order? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Keep Order</Button>
                      <Button 
                        variant="destructive" 
                        onClick={cancelOrder}
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Cancel Order
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Order Status Progress */}
          {statusConfig && (
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${statusConfig.color}`}>
                    <StatusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{statusConfig.text}</h3>
                      <Badge className={statusConfig.color + " text-white"}>
                        {statusConfig.text}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{statusConfig.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${statusConfig.color}`}
                        style={{ width: `${statusConfig.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {order.tracking_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Truck className="w-4 h-4" />
                    <span>Tracking Number: <span className="font-mono font-medium">{order.tracking_number}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-100/10 rounded-xl">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium text-blue-800">Order Date</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-100/10 rounded-xl">
                    <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-medium text-purple-800">Items</div>
                    <div className="text-sm text-purple-600 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-100/10 rounded-xl">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium text-green-800">Total</div>
                    <div className="text-sm text-green-600 mt-1 font-semibold">
                      ₹{order.total_amount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-100/10 rounded-xl">
                    <CreditCard className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="font-medium text-orange-800">Payment</div>
                    <div className="text-xs text-orange-600 mt-1 font-mono">
                      {order.payment_intent_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Order Items
                </CardTitle>
                <CardDescription>Items in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="group p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-all duration-300 bg-white/50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {item.product_name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Product ID: {item.product_id}</p>
                            </div>
                            <Link href={`/products/${item.product_id}`}>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                View Product
                              </Button>
                            </Link>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">₹{item.price.toFixed(2)} × {item.quantity}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Qty: {item.quantity}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between text-sm">
                      <span className="line-clamp-1">{item.product_name} (×{item.quantity})</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{order.total_amount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={reorderItems}
                  disabled={reordering}
                >
                  {reordering ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  Reorder Items
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 dark:hover:from-green-900/30 hover:to-emerald-100 dark:hover:to-emerald-900/30 border-green-200 dark:border-green-800"
                  onClick={generateAndDownloadInvoice}
                  disabled={downloadingInvoice}
                >
                  {downloadingInvoice ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin text-green-600" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2 text-green-600" />
                  )}
                  <span className="text-green-700">
                    {downloadingInvoice ? 'Generating PDF...' : 'Download Invoice'}
                  </span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Rate Products
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-800">
                  Have questions about your order? Our support team is here to help.
                </p>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-white/50">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Chat
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start bg-white/50">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start bg-white/50">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                </div>
                
                <div className="text-xs text-blue-600 text-center">
                  Available 24/7 for order assistance
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}