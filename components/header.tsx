"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, ShoppingCart, Search, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { searchArticlesByNumber } from "@/lib/apify-api"
import { useRouter } from "next/navigation"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { toggleCart, getTotalItems } = useCart()
  const router = useRouter()

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setShowSearchResults(true)
    
    try {
      const response = await searchArticlesByNumber(searchQuery.trim())
      if (response.error) {
        setSearchResults([])
      } else {
        let searchData: any = null
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          searchData = response.data[0]
        } else if (response.data && typeof response.data === 'object') {
          searchData = response.data
        }
        
        if (searchData?.articles) {
          setSearchResults(searchData.articles)
        } else {
          setSearchResults([])
        }
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleArticleSelect = (articleId: number) => {
    setShowSearchResults(false)
    setSearchQuery("")
    router.push(`/?articleId=${articleId}`)
  }

  const handleViewAllResults = () => {
    setShowSearchResults(false)
    setSearchQuery("")
    router.push(`/?search=${encodeURIComponent(searchQuery)}`)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logoLightMode-1Sdeh2yB5H7GBKFJ7JPAuPpiXrnkdC.png"
              alt="Zorraga Pièces Auto"
              className="h-10 w-auto sm:h-12 dark:hidden transition-all duration-200"
            />
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logozorraga-YGuXTzhMbEM7UVKQ9Accbj2LhtdOlz.png"
              alt="Zorraga Pièces Auto"
              className="h-10 w-auto sm:h-12 hidden dark:block transition-all duration-200"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-primary">Pièces Auto</h1>
              <p className="text-xs text-muted-foreground">Recherche professionnelle</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-10 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewAllResults}
                      className="text-xs h-6 px-2"
                    >
                      Voir tous
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {searchResults.slice(0, 5).map((article) => (
                      <div
                        key={article.articleId}
                        onClick={() => handleArticleSelect(article.articleId)}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 bg-muted rounded flex-shrink-0">
                          {article.imageLink && (
                            <img
                              src={article.imageLink}
                              alt={article.articleProductName}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{article.articleProductName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {article.articleNo} • {article.supplierName}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          29,99 TND
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg p-4 text-center z-50">
                <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllResults}
                  className="mt-2 text-xs h-6 px-2"
                >
                  Voir tous les articles
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Admin Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="hidden md:flex items-center gap-2 transition-colors hover:bg-primary/10"
            >
              <span className="text-sm">Admin</span>
            </Button>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative transition-colors hover:bg-primary/10"
            >
              <ShoppingCart className="h-4 w-4" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
              <span className="sr-only">Panier</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="transition-colors hover:bg-primary/10"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Basculer le thème</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t">
            <div className="pt-4 space-y-2">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-primary">Zorraga Pièces Auto</h2>
                <p className="text-sm text-muted-foreground">Recherche professionnelle de pièces automobiles</p>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push('/admin')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-center"
                >
                  <span className="text-sm">Administration</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
