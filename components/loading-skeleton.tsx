export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />
}

export function ArticleCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <LoadingSkeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
        <LoadingSkeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

export function CategorySkeleton() {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
