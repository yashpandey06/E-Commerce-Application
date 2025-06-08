"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  ImageIcon,
  Eye,
  Store
} from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  stock: number
  rating?: number
  reviews_count?: number
  is_featured?: boolean
  vendor_id?: number
  created_at?: string
  is_active?: boolean
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.id as string)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchRelatedProducts()
    }
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`)
      
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else if (response.status === 404) {
        toast({
          title: "Product not found",
          description: "The product you're looking for doesn't exist",
          variant: "destructive",
        })
        router.push("/products")
      } else {
        throw new Error("Failed to fetch product")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`/api/products?limit=4`)
      
      if (response.ok) {
        const data = await response.json()
        const filtered = data.products?.filter((p: Product) => p.id !== productId).slice(0, 4) || []
        setRelatedProducts(filtered)
      }
    } catch (error) {
      console.error("Error fetching related products:", error)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    try {
      await addToCart(product.id, quantity)
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product to cart",
        variant: "destructive",
      })
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      })
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", color: "destructive" }
    if (stock < 10) return { text: `Only ${stock} left`, color: "warning" }
    return { text: "In Stock", color: "success" }
  }

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    )
  }

  const getImageSrc = (product: Product) => {
    if (imageError || !product.image_url) {
      return "/placeholder.svg?height=600&width=600"
    }
    
    // Handle Unsplash URLs
    if (product.image_url.includes('unsplash.com/photos/')) {
      const photoId = product.image_url.split('/photos/')[1]
      if (photoId) {
        return `https://images.unsplash.com/photo-${photoId}?w=600&h=600&fit=crop&auto=format`
      }
    }
    
    return product.image_url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading product details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Product Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">The product you're looking for doesn't exist or is no longer available.</p>
            <Button onClick={() => router.push("/products")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus(product.stock)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/products" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Products
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
        </div>

        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6 bg-white/50 dark:bg-gray-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardContent className="p-0">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                  {!imageError && product.image_url ? (
                    <Image
                      src={getImageSrc(product)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-24 h-24 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No Image Available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_featured && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Featured
                      </Badge>
                    )}
                    <Badge 
                      variant={stockStatus.color === "destructive" ? "destructive" : "outline"}
                      className={
                        stockStatus.color === "warning" 
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" 
                          : stockStatus.color === "success"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : ""
                      }
                    >
                      {stockStatus.text}
                    </Badge>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-400"
                        }`} 
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={handleShare}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    >
                      <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Product ID: {product.id}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(product.rating)}
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {product.rating || 0}
                  </span>
                </div>
                {product.reviews_count && (
                  <span className="text-gray-500 dark:text-gray-400">
                    ({product.reviews_count} review{product.reviews_count !== 1 ? 's' : ''})
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  ₹{product.price.toFixed(2)}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Quantity:</span>
                  <div className="flex items-center border rounded-lg bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-medium text-gray-900 dark:text-gray-100">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.stock} available
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-12"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ₹{(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            )}

            {product.stock === 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-300 font-medium">
                  This product is currently out of stock
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <Truck className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">On orders over ₹50</p>
          </Card>
          
          <Card className="text-center p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Secure Payment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">100% secure checkout</p>
          </Card>
          
          <Card className="text-center p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <RotateCcw className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">30-day return policy</p>
          </Card>
          
          <Card className="text-center p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <Store className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quality Assured</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Premium quality products</p>
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader className="p-0 relative">
                    <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={relatedProduct.image_url || "/placeholder.svg?height=300&width=300"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Link href={`/products/${relatedProduct.id}`}>
                          <Button size="sm" variant="secondary">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-gray-900 dark:text-gray-100">
                      {relatedProduct.name}
                    </CardTitle>
                    <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mt-2">
                      ₹{relatedProduct.price}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}