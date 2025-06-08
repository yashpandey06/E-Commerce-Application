"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, ShoppingBag } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast({
        title: "Success",
        description: "Logged in successfully",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-400/30 to-red-400/30 dark:from-orange-600/20 dark:to-red-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-r from-green-400/30 to-blue-400/30 dark:from-green-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-40">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 dark:bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <Navbar />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-4rem)] relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-white/20 dark:bg-gray-800/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 dark:border-gray-700/30">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300 font-medium">Welcome Back to Kommercio</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent leading-tight">
                Continue Your Shopping Journey
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                Access your account to explore thousands of products, track orders, and enjoy personalized recommendations.
              </p>

              <div className="grid grid-cols-2 gap-6 max-w-md">
                <div className="text-center p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">5K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Products</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md relative overflow-hidden border-0 shadow-2xl shadow-purple-500/20 dark:shadow-purple-500/40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
              {/* Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-800/85"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.08)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15)_0%,transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.08)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15)_0%,transparent_50%)]"></div>
              
              <CardHeader className="relative z-10 text-center pb-6">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 rounded-2xl w-fit shadow-lg">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Sign in to your account
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-200 font-medium">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors z-10" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="pl-14 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 focus:bg-white dark:focus:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-200 font-medium">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors z-10" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        className="pl-14 pr-14 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 focus:bg-white dark:focus:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-gray-900/50 dark:hover:shadow-gray-800/50 transform hover:scale-[1.02] transition-all duration-300 group border-0 text-base relative overflow-hidden" 
                    disabled={loading}
                  >
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800/0 via-gray-700/20 to-gray-800/0 dark:from-gray-700/0 dark:via-gray-600/20 dark:to-gray-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {loading ? (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="font-semibold text-white">Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <span className="font-semibold text-white group-hover:text-gray-100 transition-colors duration-300">Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 text-white group-hover:text-gray-100" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">or</span>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Don't have an account?{" "}
                    <Link 
                      href="/auth/signup" 
                      className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-300 dark:hover:to-pink-300 transition-all duration-300"
                    >
                      Create Account
                    </Link>
                  </p>
                  
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 font-medium block"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 1;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}