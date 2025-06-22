// app/cart/page.tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  CreditCard, 
  Heart,
  ArrowLeft,
  Gift,
  Truck,
  Shield,
  Percent,
  Tag,
  Lock,
  Clock
} from "lucide-react"

interface CouponCode {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, loading, fetchCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [paymentMethod, setPaymentMethod] = useState("paypal")
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<number[]>([])

  // Mock coupon codes for demo
  const validCoupons: CouponCode[] = [
    { code: "SAVE10", discount: 10, type: 'percentage' },
    { code: "SAVE20", discount: 20, type: 'fixed' },
    { code: "WELCOME15", discount: 15, type: 'percentage' }
  ]

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login")
      return
    }
    fetchCart()
  }, [user, isAuthenticated])

  // Helper function to safely convert price to number
  const getPrice = (price: any): number => {
    if (typeof price === 'number') return price
    if (typeof price === 'string') return parseFloat(price) || 0
    return 0
  }

  const subtotal = total
  const shippingCost = subtotal > 50 ? 0 : 9.99
  const taxRate = 0.08
  const taxAmount = subtotal * taxRate
  const discountAmount = appliedCoupon ? 
    (appliedCoupon.type === 'percentage' ? 
      subtotal * (appliedCoupon.discount / 100) : 
      appliedCoupon.discount) : 0
  const finalTotal = subtotal + shippingCost + taxAmount - discountAmount

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setCouponLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const validCoupon = validCoupons.find(
        c => c.code.toLowerCase() === couponCode.toLowerCase()
      )
      
      if (validCoupon) {
        setAppliedCoupon(validCoupon)
        setCouponCode("")
        toast({
          title: "Coupon applied!",
          description: `${validCoupon.type === 'percentage' ? 
            `${validCoupon.discount}% discount` : 
            `$${validCoupon.discount} discount`} has been applied to your order.`,
        })
      } else {
        toast({
          title: "Invalid coupon",
          description: "The coupon code you entered is not valid.",
          variant: "destructive",
        })
      }
      setCouponLoading(false)
    }, 1000)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order.",
    })
  }

  const handleCheckout = async () => {
    if (items.length === 0) return

    setCheckoutLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          payment_method: paymentMethod,
          return_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/payment/cancel`,
          coupon_code: appliedCoupon?.code,
          final_total: finalTotal
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (paymentMethod === "paypal" && data.approval_url) {
          window.location.href = data.approval_url
        } else {
          toast({
            title: "Order placed successfully!",
            description: `Order #${data.order_id} has been created`,
          })
          fetchCart()
          router.push("/profile?tab=orders")
        }
      } else if (response.status === 401) {
        router.push("/auth/login")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Checkout failed")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
      })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId)
    } else {
      try {
        await updateQuantity(itemId, newQuantity)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive",
        })
      }
    }
  }

  const moveToWishlist = (productId: number) => {
    setWishlistItems(prev => [...prev, productId])
    toast({
      title: "Moved to wishlist",
      description: "Item has been moved to your wishlist",
    })
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/products")}
              className="bg-white/50 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 text-lg">
            Review your items and proceed to secure checkout
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground dark:text-gray-300">Loading your cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-lg border border-white/20 dark:border-gray-700/20">
              <ShoppingBag className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Your cart is empty</h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-8">
                Discover amazing products and add them to your cart to get started.
              </p>
              <Button 
                onClick={() => router.push("/products")} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                Start Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items Header */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Cart Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Secure checkout
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {items.map((item) => {
                  const itemPrice = getPrice(item.product.price)
                  const itemTotal = itemPrice * item.quantity
                  
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Product Image */}
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={item.product.image_url || "/placeholder.svg?height=96&width=96"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                                  {item.product.name}
                                </h3>
                                <p className="text-purple-600 font-medium text-lg">
                                  ${itemPrice.toFixed(2)}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                In Stock
                              </Badge>
                            </div>
                            
                            {/* Actions Row */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Qty:</span>
                                <div className="flex items-center border rounded-lg bg-white/50">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="h-8 w-8 p-0 hover:bg-purple-100"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="h-8 w-8 p-0 hover:bg-purple-100"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Item Total */}
                              <div className="text-right">
                                <p className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                  ${itemTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveToWishlist(item.product.id)}
                              className="text-gray-600 hover:text-purple-600"
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              Save for later
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          <Link href={`/products/${item.product.id}`}>
                            <Button variant="outline" size="sm">
                              View Product
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Delivery Info */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-300">Free Delivery</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {subtotal > 50 ? 
                          "Congratulations! You qualify for free shipping." :
                          `Add $${(50 - subtotal).toFixed(2)} more to qualify for free shipping.`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Clock className="w-4 h-4" />
                    Estimated delivery: 3-5 business days
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Coupon Code */}
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="w-5 h-5 text-purple-600" />
                      Promo Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-green-100 rounded-full">
                            <Percent className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">{appliedCoupon.code}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {appliedCoupon.type === 'percentage' ? 
                                `${appliedCoupon.discount}% off` : 
                                `$${appliedCoupon.discount} off`
                              }
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={removeCoupon}
                          className="text-green-600 hover:text-green-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                        <Button 
                          onClick={applyCoupon}
                          disabled={!couponCode.trim() || couponLoading}
                          variant="outline"
                          className="bg-white/50 dark:bg-gray-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                        >
                          {couponLoading ? "..." : "Apply"}
                        </Button>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Try: SAVE10, SAVE20, or WELCOME15
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className={shippingCost === 0 ? "text-green-600" : ""}>
                          {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Payment Method
                      </h3>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="flex items-center cursor-pointer flex-1">
                              <div className="w-8 h-8 bg-blue-600 rounded mr-3 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">P</span>
                              </div>
                              <div>
                                <div className="font-medium">PayPal</div>
                                <div className="text-sm text-muted-foreground">Pay with your PayPal account</div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                              <CreditCard className="w-8 h-8 text-gray-600 mr-3" />
                              <div>
                                <div className="font-medium">Credit Card</div>
                                <div className="text-sm text-muted-foreground">Mock payment for demo</div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      onClick={handleCheckout} 
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                      size="lg"
                      disabled={items.length === 0 || checkoutLoading}
                    >
                      {checkoutLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Secure Checkout - ${finalTotal.toFixed(2)}
                        </div>
                      )}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      Your payment information is secure and encrypted
                    </div>
                  </CardContent>
                </Card>

                {/* Security Badge */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Secure Shopping</h4>
                        <p className="text-sm text-blue-600">256-bit SSL encryption</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}