"use client"

import { useState } from "react"
import { Package, ImageIcon } from "lucide-react"

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  fallbackIcon?: "package" | "image"
  size?: "sm" | "md" | "lg" | "xl"
}

export function ProductImage({ 
  src, 
  alt, 
  className = "", 
  fallbackIcon = "package",
  size = "md" 
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16",
    xl: "h-20 w-20"
  }

  const Icon = fallbackIcon === "package" ? Package : ImageIcon

  // If no src or image failed to load, show fallback
  if (!src || imageError) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-md ${className}`}>
        <Icon className={`${sizeClasses[size]} text-muted-foreground`} />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-md transition-opacity duration-200 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
      />
    </div>
  )
}
