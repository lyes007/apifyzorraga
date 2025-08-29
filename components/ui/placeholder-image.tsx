import { Package, ImageIcon } from "lucide-react"

interface PlaceholderImageProps {
  size?: "sm" | "md" | "lg"
  variant?: "package" | "image"
  className?: string
}

export function PlaceholderImage({ size = "md", variant = "package", className = "" }: PlaceholderImageProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  }

  const Icon = variant === "package" ? Package : ImageIcon

  return (
    <div className={`flex items-center justify-center text-muted-foreground ${className}`}>
      <Icon className={sizeClasses[size]} />
    </div>
  )
}
