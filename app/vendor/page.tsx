// app/vendor/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { 
  Package, 
  Plus, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  DollarSign,
  Eye,
  Calendar,
  BarChart3,
  Star,
  AlertCircle,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Store,
  Target,
  Award,
  MessageSquare,
  Settings,
  FileText,
  PieChart
} from "lucide-react"

interface VendorStats {
  total_products: number
  total_sales: number
  active_orders: number
  total_customers: number
  monthly_revenue: number
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  average_rating: number
  total_reviews: number
}

interface RecentOrder {
  id: number
  customer_name: string
  total_amount: number
  status: string
  created_at: string
  items_count: number
}

interface TopProduct {
  id: number
  name: string
  sales_count: number
  revenue: number
  image_url?: string
}

export default function VendorDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [stats, setStats] = useState<VendorStats>({
    total_products: 0,
    total_sales: 0,
    active_orders: 0,
    total_customers: 0,
    monthly_revenue: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    average_rating: 0,
    total_reviews: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated || !user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "vendor" && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You need vendor access to view this page",
        variant: "destructive"
      })
      router.push("/")
      return
    }

    fetchDashboardData()
  }, [user, isAuthenticated, loading])

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

  const fetchDashboardData = async () => {
    try {
      const headers = getAuthHeaders()
      if (!headers) return

      // Fetch vendor stats (mock data for now)
      // In real implementation, you'd have separate endpoints
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products", { headers }),
        fetch("/api/vendor/orders", { headers }).catch(() => null)
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        const vendorProducts = productsData.products?.filter((p: any) => p.vendor_id === user?.id) || []
        
        // Mock stats calculation
        setStats(prev => ({
          ...prev,
          total_products: vendorProducts.length,
          total_sales: Math.floor(Math.random() * 1000),
          monthly_revenue: Math.floor(Math.random() * 10000),
          active_orders: Math.floor(Math.random() * 50),
          total_customers: Math.floor(Math.random() * 200),
          pending_orders: Math.floor(Math.random() * 20),
          completed_orders: Math.floor(Math.random() * 500),
          cancelled_orders: Math.floor(Math.random() * 10),
          average_rating: 4.2 + Math.random() * 0.7,
          total_reviews: Math.floor(Math.random() * 100)
        }))

        // Mock recent orders
        setRecentOrders([
          {
            id: 1,
            customer_name: "John Doe",
            total_amount: 99.99,
            status: "pending",
            created_at: new Date().toISOString(),
            items_count: 2
          },
          {
            id: 2,
            customer_name: "Jane Smith",
            total_amount: 149.99,
            status: "shipped",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            items_count: 1
          }
        ])

        // Mock top products
        setTopProducts(vendorProducts.slice(0, 3).map((p: any, index: number) => ({
          id: p.id,
          name: p.name,
          sales_count: Math.floor(Math.random() * 100),
          revenue: Math.floor(Math.random() * 1000),
          image_url: p.image_url
        })))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setDashboardLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "bg-yellow-500", text: "Pending", icon: Clock }
      case "confirmed":
        return { color: "bg-blue-500", text: "Confirmed", icon: CheckCircle }
      case "shipped":
        return { color: "bg-purple-500", text: "Shipped", icon: Truck }
      case "delivered":
        return { color: "bg-green-500", text: "Delivered", icon: Package }
      case "cancelled":
        return { color: "bg-red-500", text: "Cancelled", icon: XCircle }
      default:
        return { color: "bg-gray-500", text: status, icon: AlertCircle }
    }
  }

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || (user.role !== "vendor" && user.role !== "admin")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                  <Store className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Vendor Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                    Welcome back, <span className="font-semibold">{user.username}</span>! 
                    Here's how your store is performing.
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {user.role === "admin" ? "Admin" : "Vendor"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{stats.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500 dark:text-gray-400">({stats.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push("/vendor/products")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Manage Products
                </Button>
                <Button variant="outline" className="bg-white/50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total_products}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Products in your store</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+2 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${stats.monthly_revenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenue this month</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Orders</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.active_orders}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Orders to process</p>
              <div className="flex items-center mt-2">
                <Activity className="w-3 h-3 text-orange-500 mr-1" />
                <span className="text-xs text-orange-600">{stats.pending_orders} pending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.total_customers}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique customers</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+5 new this week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart Placeholder */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Sales Performance
                  </CardTitle>
                  <CardDescription>Revenue trends over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Sales chart would go here</p>
                      <p className="text-sm">Connect analytics service</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Order Status
                  </CardTitle>
                  <CardDescription>Current order distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="font-medium">{stats.completed_orders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="font-medium">{stats.pending_orders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Cancelled</span>
                      </div>
                      <span className="font-medium">{stats.cancelled_orders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Plus className="h-5 w-5" />
                    Add Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-purple-600 dark:text-purple-400">Quickly add a new product to your inventory.</p>
                  <Button 
                    onClick={() => router.push("/vendor/products")}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <ShoppingCart className="h-5 w-5" />
                    Process Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-blue-600 dark:text-blue-400">Manage and fulfill your customer orders.</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Orders
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <BarChart3 className="h-5 w-5" />
                    View Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-green-600 dark:text-green-400">Analyze your store performance and insights.</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest orders from your customers</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Orders will appear here once customers start purchasing.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status)
                      const StatusIcon = statusConfig.icon
                      
                      return (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${statusConfig.color}`}>
                              <StatusIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">Order #{order.id}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{order.customer_name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${order.total_amount.toFixed(2)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Top Performing Products
                    </CardTitle>
                    <CardDescription>Your best-selling products</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/vendor/products")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Manage All Products
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Products Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Start by adding your first product to your store.</p>
                    <Button 
                      onClick={() => router.push("/vendor/products")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="absolute -top-2 -left-2">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium line-clamp-1 text-gray-900 dark:text-gray-100">{product.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{product.sales_count} sales</div>
                            <div className="text-sm font-medium text-green-600">
                              ${product.revenue.toLocaleString()} revenue
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Conversion Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</span>
                    <span className="font-medium">$87.50</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customer Retention</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Performance Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-300">Monthly Revenue Goal</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400">Achieved 120% of target!</p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-300">Product Catalog</span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Add 5 more products to reach goal</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-300">Customer Rating</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Maintain 4.5+ rating</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Getting Started Guide */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Award className="w-6 h-6" />
              Getting Started as a Vendor
            </CardTitle>
            <CardDescription>Follow these steps to build a successful store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">1. Add Products</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                  Start by adding high-quality products with detailed descriptions and images.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => router.push("/vendor/products")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Add Products
                </Button>
              </div>
              
              <div className="text-center p-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">2. Optimize Pricing</h3>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  Research competitors and set competitive prices to attract customers.
                </p>
                <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                  Learn More
                </Button>
              </div>
              
              <div className="text-center p-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">3. Engage Customers</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                  Provide excellent customer service and build lasting relationships.
                </p>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                  View Tips
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}