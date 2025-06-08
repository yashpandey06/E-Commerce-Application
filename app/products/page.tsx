"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { 
  Search, 
  ShoppingCart, 
  Filter, 
  Grid3X3, 
  List, 
  Star,
  Heart,
  Eye,
  Package,
  ImageIcon,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ChevronDown
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
}

interface Filters {
  search: string
  category: string
  priceRange: [number, number]
  inStock: boolean
  featured: boolean
  minRating: number
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "toys", label: "Toys & Games" },
  { value: "food", label: "Food & Beverages" }
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" }
]

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<number[]>([])
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({})
  const [showFilters, setShowFilters] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    priceRange: [0, 1000],
    inStock: false,
    featured: false,
    minRating: 0
  })
  
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")
  
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState(filters.search)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchDebounce])

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.category !== "all") params.set("category", filters.category)
    if (sortBy !== "newest") params.set("sort", sortBy)
    
    const newUrl = params.toString() ? `/products?${params}` : '/products'
    router.replace(newUrl, { scroll: false })
  }, [filters.search, filters.category, sortBy, router])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)
      if (filters.category !== "all") params.append("category", filters.category)

      const url = params.toString() ? `/api/products?${params}` : '/api/products'
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        const productList = data.products || []
        setAllProducts(productList)
        setTotalProducts(productList.length)
        
        if (data.error) {
          toast({
            title: "Warning",
            description: data.error,
            variant: "destructive",
          })
        }
      } else {
        throw new Error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters.search, filters.category, toast])

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Apply price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      )
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0)
    }

    // Apply featured filter
    if (filters.featured) {
      filtered = filtered.filter(p => p.is_featured)
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "popular":
        filtered.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
        break
      default:
        // newest first - assuming products come sorted by creation date
        break
    }

    return filtered
  }, [allProducts, filters, sortBy])

  useEffect(() => {
    setProducts(filteredAndSortedProducts)
  }, [filteredAndSortedProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const [addingToCart, setAddingToCart] = useState<{[key: number]: boolean}>({})

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      })
      return
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }))

    try {
      await addToCart(productId, 1)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }))
    }
  }

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  const getImageSrc = (product: Product) => {
    if (imageErrors[product.id] || !product.image_url) {
      return "/placeholder.svg?height=300&width=300"
    }
    
    // Handle Unsplash URLs
    if (product.image_url.includes('unsplash.com/photos/')) {
      const photoId = product.image_url.split('/photos/')[1]
      if (photoId) {
        return `https://images.unsplash.com/photo-${photoId}?w=500&h=500&fit=crop&auto=format`
      }
    }
    
    return product.image_url
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>
    if (stock < 10) return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Low Stock</Badge>
    return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">In Stock</Badge>
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

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      priceRange: [0, 1000],
      inStock: false,
      featured: false,
      minRating: 0
    })
    setSearchDebounce("")
    setSortBy("newest")
  }

  const hasActiveFilters = filters.category !== "all" || filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 1000 || filters.inStock || filters.featured || filters.minRating > 0

  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  )

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="p-0 relative">
        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
          {!imageErrors[product.id] && product.image_url ? (
            <Image
              src={getImageSrc(product)}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(product.id)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No Image</p>
              </div>
            </div>
          )}
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" asChild>
              <Link href={`/products/${product.id}`}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Link>
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => toggleFavorite(product.id)}
            >
              <Heart 
                className={`w-4 h-4 ${
                  favorites.includes(product.id) 
                    ? "fill-red-500 text-red-500" 
                    : ""
                }`} 
              />
            </Button>
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Featured
              </Badge>
            )}
            {getStockBadge(product.stock)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-gray-900 dark:text-gray-100">
              {product.name}
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                ₹{product.price}
              </div>
            </div>
          </div>
          
          <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem] text-gray-600 dark:text-gray-400">
            {product.description}
          </CardDescription>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderStars(product.rating)}
              {product.reviews_count && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({product.reviews_count})
                </span>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/products/${product.id}`} className="flex-1">
          <Button variant="outline" className="w-full group-hover:border-purple-500 transition-colors">
            View Details
          </Button>
        </Link>
        <Button 
          onClick={() => handleAddToCart(product.id)} 
          disabled={product.stock === 0 || addingToCart[product.id]}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          size="icon"
        >
          {addingToCart[product.id] ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  )

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex">
        <div className="w-48 aspect-square relative bg-gray-100 dark:bg-gray-800">
          {!imageErrors[product.id] && product.image_url ? (
            <Image
              src={getImageSrc(product)}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => handleImageError(product.id)}
              sizes="192px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">No Image</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{product.name}</h3>
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{product.description}</p>
              <div className="flex items-center gap-4 mb-3">
                {renderStars(product.rating)}
                {product.reviews_count && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({product.reviews_count} reviews)
                  </span>
                )}
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                ₹{product.price}
              </div>
              {getStockBadge(product.stock)}
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/products/${product.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            <Button 
              onClick={() => handleAddToCart(product.id)} 
              disabled={product.stock === 0 || addingToCart[product.id]}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {addingToCart[product.id] ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </div>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => toggleFavorite(product.id)}
            >
              <Heart 
                className={`w-4 h-4 ${
                  favorites.includes(product.id) 
                    ? "fill-red-500 text-red-500" 
                    : ""
                }`} 
              />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Discover amazing products curated just for you. Quality, style, and value in every item.
          </p>
        </div>

        {/* Search and Quick Filters */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-sm border border-white/20 dark:border-gray-700/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search products..."
                value={searchDebounce}
                onChange={(e) => setSearchDebounce(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-full lg:w-48 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                  </label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Minimum Rating: {filters.minRating} stars
                  </label>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: value[0] }))}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStock: !!checked }))}
                    />
                    <label htmlFor="inStock" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      In Stock Only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={filters.featured}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, featured: !!checked }))}
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Featured Products
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 dark:text-gray-300">
                Showing {products.length} of {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                {filters.search && ` for "${filters.search}"`}
                {filters.category !== "all" && ` in ${CATEGORIES.find(c => c.value === filters.category)?.label}`}
              </p>
              {hasActiveFilters && (
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  Filtered
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Products Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-lg border border-white/20 dark:border-gray-700/20">
              <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {filters.search || hasActiveFilters
                  ? "Try adjusting your search or filters" 
                  : "Products will appear here once they're added"}
              </p>
              {(filters.search || hasActiveFilters) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}