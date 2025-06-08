export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Loading Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Loading */}
        <div className="mb-8">
          <div className="h-9 w-48 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Filters Loading */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="h-10 bg-white/60 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-full md:w-48">
            <div className="h-10 bg-white/60 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Products Grid Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div 
              key={index} 
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-white/20 dark:border-gray-700/20 animate-pulse"
            >
              {/* Image Skeleton */}
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-pulse"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 bg-gradient-to-r from-purple-200 to-pink-200 rounded animate-pulse"></div>
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                
                {/* Price and Stock */}
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-16 bg-gradient-to-r from-purple-200 to-pink-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Footer Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Central Loading Indicator */}
        <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-10 shadow-2xl border border-white/30">
            <div className="flex flex-col items-center gap-6">
              {/* Enhanced Spinning Circle */}
              <div className="relative">
                {/* Outer ring */}
                <div className="w-20 h-20 border-4 border-purple-100 rounded-full"></div>
                {/* Middle ring */}
                <div className="absolute inset-1 w-18 h-18 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                {/* Inner spinning ring */}
                <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-purple-600 border-r-pink-600 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Loading Text */}
              <div className="text-center">
                <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Loading Products
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Discovering amazing deals for you...
                </p>
              </div>
              
              {/* Animated Dots */}
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce [animation-delay:150ms]"></div>
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}