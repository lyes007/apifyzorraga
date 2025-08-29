"use client"

import * as React from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Option {
  value: string
  label: string
  sublabel?: string
  logo?: string
}

interface SimpleSelectProps {
  options: Option[]
  value?: string
  onValueChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  className?: string
  searchPlaceholder?: string
  emptyMessage?: string
  loading?: boolean
}

export function SimpleSelect({
  options,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat trouvé",
  loading = false
}: SimpleSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    
    const query = searchQuery.toLowerCase()
    return options.filter(
      option => 
        option.label.toLowerCase().includes(query) ||
        (option.sublabel?.toLowerCase().includes(query))
    )
  }, [options, searchQuery])

  const selectedOption = options.find(option => option.value === value)

  const handleSelect = (selectedValue: string) => {
    console.log("Selected value:", selectedValue)
    onValueChange(selectedValue)
    setOpen(false)
    setSearchQuery("")
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange("")
    setSearchQuery("")
  }

  const toggleOpen = () => {
    if (disabled || loading) return
    console.log("Toggle open, current state:", open)
    setOpen(!open)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={toggleOpen}
        className={cn(
          "w-full h-12 justify-between text-left font-normal",
          "border-2 hover:border-primary/50 transition-all duration-300",
          disabled && "opacity-50 cursor-not-allowed",
          !selectedOption && "text-muted-foreground"
        )}
      >
        <div className="flex items-center min-w-0 flex-1 gap-3">
          {selectedOption?.logo && (
            <img 
              src={selectedOption.logo} 
              alt={selectedOption.label}
              className="w-6 h-6 object-contain flex-shrink-0 bg-white/10 rounded-sm p-0.5"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <div className="flex flex-col items-start min-w-0 flex-1">
            {selectedOption ? (
              <>
                <span className="truncate max-w-full text-sm font-medium">
                  {selectedOption.label}
                </span>
                {selectedOption.sublabel && (
                  <span className="truncate max-w-full text-xs text-muted-foreground">
                    {selectedOption.sublabel}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {selectedOption && !disabled && (
            <X 
              className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" 
              onClick={clearSelection}
            />
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )} />
        </div>
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border-2 border-primary/20 rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Search Input */}
          <div className="flex items-center border-b border-border/50 px-3 py-3 bg-muted/30">
            <Search className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 bg-transparent placeholder:text-muted-foreground/70"
              autoFocus
            />
            {searchQuery && (
              <X 
                className="ml-2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" 
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40"
               style={{
                 scrollBehavior: 'smooth',
                 overscrollBehavior: 'contain'
               }}
          >
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <>
                  {filteredOptions.slice(0, 150).map((option, index) => (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex items-center space-x-2 rounded-md mx-2 my-0.5 px-3 py-3 text-sm cursor-pointer transition-all duration-150",
                        "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-sm",
                        value === option.value && "bg-gradient-to-r from-primary/20 to-primary/10 shadow-sm border-l-2 border-primary",
                        index === 0 && "mt-1"
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          value === option.value ? "opacity-100 text-primary" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center min-w-0 flex-1 gap-3">
                        {option.logo && (
                          <img 
                            src={option.logo} 
                            alt={option.label}
                            className="w-6 h-6 object-contain flex-shrink-0 bg-white/10 rounded-sm p-0.5"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate font-medium">{option.label}</span>
                          {option.sublabel && (
                            <span className="truncate text-xs text-muted-foreground">
                              {option.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredOptions.length > 150 && (
                    <div className="mx-2 my-1 px-3 py-3 text-xs text-muted-foreground text-center border-t border-dashed border-border/50 bg-gradient-to-r from-muted/20 to-muted/10 rounded-md">
                      <div className="font-medium text-primary/80 mb-1">
                        +{filteredOptions.length - 150} autres marques
                      </div>
                      <div className="text-muted-foreground/80">
                        Continuez à taper pour affiner votre recherche
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
