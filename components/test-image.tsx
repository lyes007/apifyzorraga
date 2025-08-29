"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function TestImage() {
  const [testResults, setTestResults] = useState<{
    placeholder: boolean
    external: boolean
    loading: boolean
  }>({
    placeholder: false,
    external: false,
    loading: false
  })

  const testImages = async () => {
    setTestResults({ placeholder: false, external: false, loading: true })
    
    // Test 1: Placeholder image
    const placeholderImg = new Image()
    placeholderImg.onload = () => setTestResults(prev => ({ ...prev, placeholder: true }))
    placeholderImg.onerror = () => setTestResults(prev => ({ ...prev, placeholder: false }))
    placeholderImg.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjcyOEQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+"
    
    // Test 2: External image (a reliable test image)
    const externalImg = new Image()
    externalImg.onload = () => setTestResults(prev => ({ ...prev, external: true }))
    externalImg.onerror = () => setTestResults(prev => ({ ...prev, external: false }))
    externalImg.src = "https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=Test+Image"
    
    // Wait a bit for both tests
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, loading: false }))
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Image Loading Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testImages} disabled={testResults.loading} className="w-full">
          {testResults.loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Image Loading"
          )}
        </Button>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Placeholder Image:</span>
            {testResults.placeholder ? (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Working
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">External Image:</span>
            {testResults.external ? (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Working
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          This test helps verify if image loading works in your environment.
        </div>
      </CardContent>
    </Card>
  )
}
