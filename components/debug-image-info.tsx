"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff } from "lucide-react"

interface DebugImageInfoProps {
  article: any
  className?: string
}

export function DebugImageInfo({ article, className = "" }: DebugImageInfoProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={className}
      >
        <Eye className="h-4 w-4 mr-2" />
        Debug Image Info
      </Button>
    )
  }

  const imageFields = {
    s3ImageLink: article.s3ImageLink,
    imageLink: article.imageLink,
    imageMedia: article.imageMedia,
    articleMediaFileName: article.articleMediaFileName,
    articleMediaType: article.articleMediaType
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Debug: Image Fields</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(imageFields).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center text-xs">
            <span className="font-mono">{key}:</span>
            <div className="flex items-center gap-2">
              {value ? (
                <>
                  <Badge variant="default" className="text-xs">Has Value</Badge>
                  <span className="text-muted-foreground max-w-[200px] truncate">
                    {String(value).substring(0, 50)}
                    {String(value).length > 50 ? "..." : ""}
                  </span>
                </>
              ) : (
                <Badge variant="secondary" className="text-xs">No Value</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
