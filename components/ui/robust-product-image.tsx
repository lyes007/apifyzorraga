"use client"

import { useState, useEffect } from "react"
import { Package, ImageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RobustProductImageProps {
  s3ImageLink?: string
  imageLink?: string
  imageMedia?: string
  alt: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  showDebug?: boolean
}

export function RobustProductImage({ 
  s3ImageLink,
  imageLink,
  imageMedia,
  alt, 
  className = "", 
  size = "md",
  showDebug = false
}: RobustProductImageProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState<string>("")
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [failedSources, setFailedSources] = useState<string[]>([])
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)

  const imageSources = [
    { name: "Direct", url: imageLink },
    { name: "Media", url: imageMedia },
    { name: "S3", url: s3ImageLink }
  ].filter(source => source.url)

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16",
    xl: "h-20 w-20"
  }

  // Try next image source when current one fails
  const tryNextSource = () => {
    if (currentSourceIndex < imageSources.length - 1) {
      setCurrentSourceIndex(prev => prev + 1)
      setImageError(false)
      setImageLoading(true)
    } else {
      // All sources failed
      setImageError(true)
      setImageLoading(false)
    }
  }

  // Update current image source when source index changes
  useEffect(() => {
    if (imageSources.length > 0 && currentSourceIndex < imageSources.length) {
      const source = imageSources[currentSourceIndex]
      setCurrentImageSrc(source.url || "")
      console.log(`Trying image source ${currentSourceIndex + 1}/${imageSources.length}: ${source.name} - ${source.url}`)
    }
  }, [currentSourceIndex, imageSources])

  // Reset when image sources change
  useEffect(() => {
    setCurrentSourceIndex(0)
    setImageError(false)
    setImageLoading(true)
    setFailedSources([])
  }, [s3ImageLink, imageLink, imageMedia])

  const handleImageError = () => {
    const currentSource = imageSources[currentSourceIndex]
    if (currentSource) {
      setFailedSources(prev => [...prev, `${currentSource.name}: ${currentSource.url}`])
      console.log(`Image failed to load from ${currentSource.name}:`, currentSource.url)
    }
    tryNextSource()
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
    const currentSource = imageSources[currentSourceIndex]
    console.log(`Image loaded successfully from ${currentSource?.name}:`, currentSource?.url)
  }

  // If no sources available or all failed, show fallback
  if (imageSources.length === 0 || imageError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted rounded-md ${className}`}>
        <Package className={`${sizeClasses[size]} text-muted-foreground mb-2`} />
        {showDebug && failedSources.length > 0 && (
          <div className="text-xs text-muted-foreground text-center px-2">
            <div className="font-medium mb-1">Failed sources:</div>
            {failedSources.map((source, index) => (
              <div key={index} className="text-xs opacity-75 truncate max-w-full">
                {source}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Don't render img tag until we have a valid source
  if (!currentImageSrc) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
            <div className="text-xs text-muted-foreground">
              Initializing...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
            <div className="text-xs text-muted-foreground">
              Loading {imageSources[currentSourceIndex]?.name}...
            </div>
          </div>
        </div>
      )}
      
      <img
        src={currentImageSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded-md transition-opacity duration-200 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {showDebug && (
        <div className="absolute top-1 left-1">
          <Badge variant="secondary" className="text-xs">
            {currentSourceIndex + 1}/{imageSources.length}
          </Badge>
        </div>
      )}
    </div>
  )
}
