// app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = "http://localhost:8000"

// Handle all HTTP methods
async function handleRequest(
  request: NextRequest,
  method: string,
  params: { path: string[] }
) {
  try {
    // Await params before using them (Next.js 15 requirement)
    const resolvedParams = await params
    
    // Reconstruct the backend URL from the path
    let path = resolvedParams.path.join('/')
    
    // Handle special case: frontend calls /api/auth/login but backend expects /auth/token
    if (path === 'auth/login') {
      path = 'auth/token'
    }
    
    const backendUrl = new URL(`${BACKEND_URL}/${path}`)
    
    // Forward query parameters
    const { searchParams } = new URL(request.url)
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value)
    })

    console.log(`Proxying ${method} request to:`, backendUrl.toString())

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      cache: 'no-store'
    }

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const body = await request.json()
        requestOptions.body = JSON.stringify(body)
      } catch (error) {
        // If no JSON body, that's fine for some requests
        console.log('No JSON body found, proceeding without body')
      }
    }

    // Make the request to backend
    const response = await fetch(backendUrl.toString(), requestOptions)
    
    // Get response data
    let data
    try {
      data = await response.json()
    } catch (error) {
      // If response is not JSON, create a simple response
      data = { message: 'Success' }
    }

    console.log(`Backend responded with status: ${response.status}`)

    // Return response with CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    })
  } catch (error) {
    console.error(`Proxy error for ${method} ${params.path?.join('/') || 'unknown'}:`, error)
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        details: error instanceof Error ? error.message : String(error),
        path: params.path?.join('/') || 'unknown'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      }
    )
  }
}

// Export all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'GET', params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'POST', params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'PUT', params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'DELETE', params)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'PATCH', params)
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // For OPTIONS, we don't need to await params since we're not using them
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  })
}