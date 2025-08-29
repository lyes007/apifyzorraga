"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"

interface ImageUrlTesterProps {
  s3ImageLink?: string
  imageLink?: string
  imageMedia?: string
}

export function ImageUrlTester({ s3ImageLink, imageLink, imageMedia }: ImageUrlTesterProps) {
  const [testResults, setTestResults] = useState<{
    [key: string]: { loading: boolean; success: boolean; error: string | null }
  }>({})
  const [isTesting, setIsTesting] = useState(false)

  const imageUrls = [
    { name: "S3 Image", url: s3ImageLink, key: "s3" },
    { name: "Direct Link", url: imageLink, key: "direct" },
    { name: "Media URL", url: imageMedia, key: "media" }
  ].filter(item => item.url)

  const testImageUrl = async (url: string, key: string) => {
    setTestResults(prev => ({
      ...prev,
      [key]: { loading: true, success: false, error: null }
    }))

    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          [key]: { loading: false, success: true, error: null }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [key]: { loading: false, success: false, error: `HTTP ${response.status}` }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [key]: { loading: false, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }))
    }
  }

  const testAllUrls = async () => {
    setIsTesting(true)
    setTestResults({})
    
    for (const item of imageUrls) {
      if (item.url) {
        await testImageUrl(item.url, item.key)
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    setIsTesting(false)
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  if (imageUrls.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">No image URLs to test</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Image URL Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testAllUrls} 
          disabled={isTesting} 
          className="w-full"
          size="sm"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing URLs...
            </>
          ) : (
            "Test All Image URLs"
          )}
        </Button>
        
        <div className="space-y-3">
          {imageUrls.map((item) => {
            const result = testResults[item.key]
            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  {result && (
                    <div className="flex items-center gap-2">
                      {result.loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {result.success && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accessible
                        </Badge>
                      )}
                      {result.error && (
                        <Badge variant="destructive" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    {item.url}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUrl(item.url!)}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                
                {result?.error && (
                  <p className="text-xs text-destructive">
                    Error: {result.error}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="text-xs text-muted-foreground">
          This tests if the image URLs are accessible from your browser.
        </div>
      </CardContent>
    </Card>
  )
}
