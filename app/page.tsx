"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ShoppingBag, Users, Shield, ArrowRight, Sparkles, Star } from "lucide-react"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-500/60 dark:to-pink-500/60 rounded-full opacity-20 dark:opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-500/60 dark:to-cyan-500/60 rounded-full opacity-20 dark:opacity-30 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-orange-400 to-red-400 dark:from-orange-500/60 dark:to-red-500/60 rounded-full opacity-20 dark:opacity-30 blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-400 dark:from-green-500/60 dark:to-blue-500/60 rounded-full opacity-20 dark:opacity-30 blur-3xl animate-pulse delay-3000"></div>
      </div>

      <Navbar />

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-20 relative">
          <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce border border-purple-200 dark:border-purple-700">
              <Sparkles className="w-4 h-4" />
              ✨ Premium Shopping Experience
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-gradient leading-tight">
              Welcome to Kommercio
            </h1>
            
            <p className="text-xl text-muted-foreground dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover amazing products from trusted vendors. Shop with confidence and enjoy a 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold"> seamless e-commerce experience</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-2xl shadow-purple-500/25 dark:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300">
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto group border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 dark:hover:shadow-purple-500/40">
                  <Users className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Become a Vendor
                </Button>
              </Link>
            </div>
            
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Why Choose Kommercio?
              </h2>
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                ))}
              </div>
              <p className="text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">Experience the future of online shopping with our premium platform</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-500/40 transform hover:scale-105 hover:-rotate-1 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 text-center p-8">
                  <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl w-fit shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3 text-blue-800 dark:text-blue-300">Easy Shopping</CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-400">
                    Browse thousands of products with advanced filtering and AI-powered search capabilities
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 dark:hover:shadow-purple-500/40 transform hover:scale-105 hover:rotate-1 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 text-center p-8">
                  <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl w-fit shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3 text-purple-800 dark:text-purple-300">Trusted Vendors</CardTitle>
                  <CardDescription className="text-purple-600 dark:text-purple-400">
                    All our vendors are verified and committed to providing premium quality products
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 shadow-xl hover:shadow-2xl hover:shadow-green-500/25 dark:hover:shadow-green-500/40 transform hover:scale-105 hover:-rotate-1 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 text-center p-8">
                  <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl w-fit shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 group-hover:scale-110">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3 text-green-800 dark:text-green-300">Secure Payments</CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-400">
                    Your transactions are protected with bank-level encryption and security measures
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`text-center py-20 transition-all duration-1000 delay-600 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-700 dark:via-pink-700 dark:to-orange-600 p-16 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-orange-500/90 dark:from-purple-700/90 dark:via-pink-700/90 dark:to-orange-600/90"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05)_0%,transparent_50%)]"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce">
                <Sparkles className="w-4 h-4" />
                Start Your Journey Today
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to Start Shopping?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers and discover amazing deals today
              </p>
              
              <Link href="/products">
                <Button size="lg" className="bg-white dark:bg-gray-100 text-purple-700 dark:text-purple-800 hover:bg-gray-100 dark:hover:bg-white shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 group font-semibold px-8 py-4">
                  <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Explore Products
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}