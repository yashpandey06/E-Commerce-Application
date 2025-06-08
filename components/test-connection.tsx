"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TestConnection() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        status: "error",
        message: "Failed to test connection",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
        <CardDescription>Test the connection to the FastAPI backend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Test Connection"}
        </Button>

        {status && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={status.status === "success" ? "default" : "destructive"}>{status.status}</Badge>
            </div>

            {status.backend_connected !== undefined && (
              <div className="flex items-center gap-2">
                <span>Backend:</span>
                <Badge variant={status.backend_connected ? "default" : "destructive"}>
                  {status.backend_connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            )}

            {status.products_count !== undefined && (
              <div className="flex items-center gap-2">
                <span>Products:</span>
                <Badge variant="outline">{status.products_count}</Badge>
              </div>
            )}

            {status.message && <p className="text-sm text-muted-foreground">{status.message}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
