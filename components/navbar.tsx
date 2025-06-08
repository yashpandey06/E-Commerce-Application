"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShoppingCart, User, LogOut, ShoppingBag, Sparkles } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-gray-800/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50 relative">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Kommercio
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-4 z-50 relative">
          <Link href="/products">
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 font-medium relative z-50">
              Products
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <div className="flex items-center space-x-4 relative z-50">
              {/* Cart */}
              <Link href="/cart" className="relative group z-50">
                <Button variant="ghost" size="icon" className="relative hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 z-50">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-lg animate-pulse">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 relative z-50">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl z-50">
                  <DropdownMenuItem asChild className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "vendor" && (
                    <DropdownMenuItem asChild className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400">
                      <Link href="/vendor/products" className="flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        My Products
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={logout}
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Welcome Message */}
              <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700 relative z-50">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Welcome, {user.username}!</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 relative z-50">
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 font-medium relative z-50"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium px-6 shadow-lg hover:shadow-xl hover:shadow-gray-500/25 dark:hover:shadow-gray-900/50 transform hover:scale-105 transition-all duration-300 relative z-50 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
