// app/vendor/products/page.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { Plus, Edit, Trash2, Package, DollarSign, Archive } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url?: string
  vendor_id: number
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image_url: "",
  })

  useEffect(() => {
    console.log('Vendor page - user:', user, 'authLoading:', authLoading, 'isAuthenticated:', isAuthenticated)
    
    // Wait for auth to finish loading
    if (authLoading) return

    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login')
      router.push("/auth/login")
      return
    }
    
    if (user.role !== "vendor" && user.role !== "admin") {
      console.log('User role not vendor/admin:', user.role)
      toast({
        title: "Access Denied",
        description: "You need vendor access to view this page",
        variant: "destructive"
      })
      router.push("/")
      return
    }
    
    console.log('User is vendor/admin, fetching products')
    fetchProducts()
  }, [user, authLoading, isAuthenticated])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    console.log('Getting auth headers, token exists:', !!token)
    
    if (!token) {
      router.push("/auth/login")
      return null
    }
    
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  }

  const fetchProducts = async () => {
    try {
      console.log('Fetching vendor products...')
      const headers = getAuthHeaders()
      if (!headers) return

      // Use absolute URL path
      const response = await fetch("/api/products", {
        headers: {
          "Authorization": headers.Authorization
        }
      })
      
      console.log('Products fetch response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Products data received:', data)
        
        // Filter products by current vendor
        const vendorProducts = data.products.filter((product: Product) => 
          product.vendor_id === user?.id
        )
        console.log('Filtered vendor products:', vendorProducts)
        setProducts(vendorProducts)
      } else if (response.status === 401) {
        console.log('Unauthorized, redirecting to login')
        router.push("/auth/login")
      } else {
        console.error('Failed to fetch products, status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      console.log('Submitting product form...', formData)
      const headers = getAuthHeaders()
      if (!headers) return

      // Use absolute URL paths
      const url = editingProduct
        ? `/api/vendor/products/${editingProduct.id}`
        : "/api/vendor/products"

      const method = editingProduct ? "PUT" : "POST"

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      }

      console.log('Sending product data:', productData)
      console.log('Request URL:', url)
      console.log('Request method:', method)

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(productData),
      })

      console.log('Product submission response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Product saved successfully:', result)
        toast({
          title: "Success",
          description: editingProduct ? "Product updated successfully" : "Product created successfully",
        })
        setIsDialogOpen(false)
        resetForm()
        fetchProducts()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Product submission error:', errorData)
        throw new Error(errorData.detail || "Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      console.log('Deleting product:', productId)
      const headers = getAuthHeaders()
      if (!headers) return

      // Use absolute URL path
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": headers.Authorization
        }
      })

      console.log('Delete response status:', response.status)

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        fetchProducts()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      image_url: "",
    })
    setEditingProduct(null)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image_url: product.image_url || "",
    })
    setIsDialogOpen(true)
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
    } else if (stock < 10) {
      return <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Low Stock</Badge>
    } else {
      return <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">In Stock</Badge>
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated or not vendor
  if (!isAuthenticated || !user || (user.role !== "vendor" && user.role !== "admin")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                My Products
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Manage your product inventory and listings</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                    {editingProduct ? "Update your product details" : "Create a new product for your store"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name" className="text-base font-medium text-gray-700 dark:text-gray-200">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter product name"
                        className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description" className="text-base font-medium text-gray-700 dark:text-gray-200">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="Enter detailed product description"
                        rows={4}
                        className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-base font-medium text-gray-700 dark:text-gray-200">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        placeholder="0.00"
                        className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-base font-medium text-gray-700 dark:text-gray-200">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                        placeholder="0"
                        className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="category" className="text-base font-medium text-gray-700 dark:text-gray-200">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                          <SelectItem value="sports">Sports & Outdoors</SelectItem>
                          <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                          <SelectItem value="toys">Toys & Games</SelectItem>
                          <SelectItem value="food">Food & Beverages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="image_url" className="text-base font-medium text-gray-700 dark:text-gray-200">Image URL (optional)</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitLoading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {submitLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingProduct ? "Updating..." : "Creating..."}
                        </div>
                      ) : (
                        editingProduct ? "Update Product" : "Create Product"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{products.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${products.reduce((sum, p) => sum + p.price, 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                    <Archive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {products.filter(p => p.stock < 10).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader className="p-0 relative">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.image_url || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/70 text-white capitalize text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3">
                      {getStockBadge(product.stock)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-gray-900 dark:text-gray-100">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-sm mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                    {product.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Stock</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{product.stock}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(product)} 
                      className="flex-1 bg-white/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 hover:text-purple-700 dark:hover:text-purple-400"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="bg-white/50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-700 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardContent className="text-center py-20">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">No Products Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                You haven't created any products yet. Start building your inventory and showcase your amazing products to customers!
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}