"use client"

import * as React from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Option {
  value: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
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

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat trouvé",
  loading = false
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

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

  const handleTriggerClick = () => {
    console.log("Trigger clicked, current open state:", open)
    setOpen(!open)
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            onClick={handleTriggerClick}
            className={cn(
              "w-full h-12 justify-between text-left font-normal",
              "border-2 hover:border-primary/50 transition-all duration-300",
              disabled && "opacity-50 cursor-not-allowed",
              !selectedOption && "text-muted-foreground"
            )}
          >
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
            <div className="flex items-center gap-1 ml-2">
              {selectedOption && !disabled && (
                <X 
                  className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" 
                  onClick={clearSelection}
                />
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <ScrollArea className="h-60">
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex items-center space-x-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-primary/10 transition-colors",
                      value === option.value && "bg-primary/20"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate font-medium">{option.label}</span>
                      {option.sublabel && (
                        <span className="truncate text-xs text-muted-foreground">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
