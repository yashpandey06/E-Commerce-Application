// app/profile/ProfileContent.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { 
  User, 
  Mail, 
  ShoppingBag, 
  Edit, 
  Save, 
  X, 
  Package, 
  Calendar,
  DollarSign,
  Eye,
  XCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Shield,
  Bell,
  CreditCard,
  MapPin,
  Phone,
  Clock,
  TrendingUp,
  Award,
  Heart,
  Star,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Truck,
  AlertCircle,
  Camera
} from "lucide-react"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  image_url?: string
}

interface Order {
  id: number
  total_amount: number
  status: string
  created_at: string
  payment_intent_id: string
  item_count: number
  items: OrderItem[]
}

interface UserProfile {
  id: number
  email: string
  username: string
  role: string
  avatar_url?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  date_joined?: string
}

interface UserStats {
  total_orders: number
  total_spent: number
  pending_orders: number
  favorite_category?: string
}

export default function ProfileContent() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    total_orders: 0,
    total_spent: 0,
    pending_orders: 0
  })
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [orderFilter, setOrderFilter] = useState("all")
  const [orderSearch, setOrderSearch] = useState("")
  
  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') || 'profile'
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: ""
  })
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    order_updates: true,
    promotional_emails: false,
    security_alerts: true
  })

  useEffect(() => {
    console.log('Profile page effect - user:', user, 'authLoading:', authLoading)
    
    if (authLoading) return

    if (!user) {
      console.log('No user found, redirecting to login')
      router.push("/auth/login")
      return
    }
    
    console.log('User found, fetching profile and orders')
    fetchProfile()
    fetchOrders()
  }, [user, authLoading, router])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    console.log('Getting auth headers, token exists:', !!token)
    
    if (!token) {
      console.log('No token found, redirecting to login')
      router.push("/auth/login")
      return null
    }
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...')
      const headers = getAuthHeaders()
      if (!headers) return

      const response = await fetch("/api/auth/me", {
        headers
      })
      
      console.log('Profile response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('Profile data received:', userData)
        setProfile(userData)
        setProfileForm({
          username: userData.username || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          country: userData.country || ""
        })
      } else if (response.status === 401) {
        console.log('Unauthorized, logging out')
        logout()
      } else {
        console.error('Profile fetch failed with status:', response.status)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      console.log('Fetching orders...')
      const headers = getAuthHeaders()
      if (!headers) return

      const response = await fetch("/api/orders", {
        headers
      })
      
      console.log('Orders response status:', response.status)
      
      if (response.ok) {
        const ordersData = await response.json()
        console.log('Raw orders data received:', ordersData)
        
        setOrders(ordersData)
        
        // Calculate user stats
        const stats: UserStats = {
          total_orders: ordersData.length,
          total_spent: ordersData.reduce((sum: number, order: Order) => sum + order.total_amount, 0),
          pending_orders: ordersData.filter((order: Order) => 
            ["created", "confirmed", "shipped"].includes(order.status.toLowerCase())
          ).length
        }
        setUserStats(stats)
        
      } else if (response.status === 401) {
        console.log('Unauthorized, logging out')
        logout()
      } else {
        console.error('Orders fetch failed with status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      })
    } finally {
      setOrdersLoading(false)
      if (loading) setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      const headers = getAuthHeaders()
      if (!headers) return

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(profileForm)
      })
      
      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditingProfile(false)
        toast({
          title: "Success",
          description: "Profile updated successfully"
        })
      } else if (response.status === 401) {
        logout()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.detail,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  const updatePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.new_password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    try {
      const headers = getAuthHeaders()
      if (!headers) return

      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      })
      
      if (response.ok) {
        setEditingPassword(false)
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        })
        toast({
          title: "Success",
          description: "Password updated successfully"
        })
      } else if (response.status === 401) {
        logout()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.detail,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      })
    }
  }

  const cancelOrder = async (orderId: number) => {
    try {
      const headers = getAuthHeaders()
      if (!headers) return

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Order cancelled successfully"
        })
        fetchOrders()
      } else if (response.status === 401) {
        logout()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.detail,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      })
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
        return {
          color: "bg-blue-500",
          text: "Order Placed",
          icon: CheckCircle,
          textColor: "text-blue-700",
          bgColor: "bg-blue-50"
        }
      case "confirmed":
        return {
          color: "bg-orange-500",
          text: "Confirmed",
          icon: Clock,
          textColor: "text-orange-700",
          bgColor: "bg-orange-50"
        }
      case "shipped":
        return {
          color: "bg-purple-500",
          text: "Shipped",
          icon: Truck,
          textColor: "text-purple-700",
          bgColor: "bg-purple-50"
        }
      case "delivered":
        return {
          color: "bg-green-500",
          text: "Delivered",
          icon: Package,
          textColor: "text-green-700",
          bgColor: "bg-green-50"
        }
      case "cancelled":
        return {
          color: "bg-red-500",
          text: "Cancelled",
          icon: XCircle,
          textColor: "text-red-700",
          bgColor: "bg-red-50"
        }
      default:
        return {
          color: "bg-gray-500",
          text: status,
          icon: AlertCircle,
          textColor: "text-gray-700",
          bgColor: "bg-gray-50"
        }
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = orderSearch === "" || 
      order.id.toString().includes(orderSearch) ||
      order.items.some(item => 
        item.product_name.toLowerCase().includes(orderSearch.toLowerCase())
      )
    
    const matchesFilter = orderFilter === "all" || order.status.toLowerCase() === orderFilter
    
    return matchesSearch && matchesFilter
  })

  const getProfileCompletionScore = () => {
    if (!profile) return 0
    
    const fields = [
      profile.username,
      profile.email,
      profile.phone,
      profile.address,
      profile.city,
      profile.country
    ]
    
    const completedFields = fields.filter(field => field && field.trim() !== "").length
    return Math.round((completedFields / fields.length) * 100)
  }

  const profileScore = getProfileCompletionScore()

  // Show loading spinner while auth is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            <p className="text-lg text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Info */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute -bottom-2 -right-2 rounded-full bg-white"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {profile?.username || 'User'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {profile?.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="capitalize">
                        {profile?.role}
                      </Badge>
                      {profile?.date_joined && (
                        <span className="text-sm text-gray-500">
                          Member since {new Date(profile.date_joined).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{userStats.total_orders}</div>
                      <div className="text-xs text-gray-500">Orders</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">₹{userStats.total_spent.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Spent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{userStats.pending_orders}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Completion */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Profile Completion</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{profileScore}%</span>
                  </div>
                  <Progress value={profileScore} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Information Card */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="bg-white/50 dark:bg-gray-800/50"
                >
                  {editingProfile ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {editingProfile ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    {editingProfile ? (
                      <Input
                        id="username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                        className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">{profile?.username || 'Not set'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {editingProfile ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">{profile?.email || 'Not set'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {editingProfile ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">{profile?.phone || 'Not set'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    {editingProfile ? (
                      <Input
                        id="country"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                        placeholder="United States"
                        className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">{profile?.country || 'Not set'}</div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    {editingProfile ? (
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        placeholder="123 Main Street"
                        className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">{profile?.address || 'Not set'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {editingProfile ? (
                      <Input
                        id="city"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        placeholder="New York"
                        className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">{profile?.city || 'Not set'}</div>
                    )}
                  </div>
                </div>

                {editingProfile && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={updateProfile} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Orders Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20 dark:border-gray-700/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Order History
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">Track and manage your orders</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchOrders}
                    disabled={ordersLoading}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    {ordersLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                  <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                    {orders.length} Total Orders
                  </Badge>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <Select value={orderFilter} onValueChange={setOrderFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/50 dark:bg-gray-800/50">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="created">Order Placed</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardContent className="text-center py-20">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {orderSearch || orderFilter !== "all" ? "No matching orders" : "No Orders Yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {orderSearch || orderFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "You haven't placed any orders yet. Start shopping to see your orders here."
                    }
                  </p>
                  <Button 
                    onClick={() => router.push("/products")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <Card key={order.id} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${statusConfig.color}`}>
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                                <Badge className={`${statusConfig.color} text-white`}>
                                  {statusConfig.text}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  <span>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="bg-white/50 dark:bg-gray-800/50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {order.status === "created" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cancel Order #{order.id}</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to cancel this order? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline">Keep Order</Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => cancelOrder(order.id)}
                                    >
                                      Cancel Order
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                        
                        {/* Order Items Preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={item.id || index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                    {item.image_url ? (
                                      <Image
                                        src={item.image_url}
                                        alt={item.product_name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-gray-100">{item.product_name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Qty: {item.quantity} • ${item.price.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500">
                                  +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium capitalize text-gray-900 dark:text-gray-100">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {key === 'email_notifications' && "Receive general email notifications"}
                          {key === 'order_updates' && "Get notified about order status changes"}
                          {key === 'promotional_emails' && "Receive promotional offers and discounts"}
                          {key === 'security_alerts' && "Important security and account alerts"}
                        </div>
                      </div>
                      <Button
                        variant={value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings(prev => ({
                          ...prev,
                          [key]: !value
                        }))}
                      >
                        {value ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password for better security</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPassword(!editingPassword)}
                  className="bg-white/50 dark:bg-gray-800/50"
                >
                  {editingPassword ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {editingPassword ? "Cancel" : "Change Password"}
                </Button>
              </CardHeader>
              {editingPassword && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      className="bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      onClick={updatePassword}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setEditingPassword(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Account Actions */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-300">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div>
                    <div className="font-medium text-red-800 dark:text-red-300">Delete Account</div>
                    <div className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</div>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}