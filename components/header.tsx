"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Moon, 
  Sun, 
  Menu, 
  ShoppingCart, 
  Search, 
  X, 
  Home,
  Settings,
  User,
  Phone,
  Mail,
  MapPin,
  Zap,
  ChevronDown,
  Clock
} from "lucide-react"
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
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const { toggleCart, getTotalItems } = useCart()
  const router = useRouter()

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory).slice(0, 5))
    }
    const savedRecent = localStorage.getItem('recent-searches')
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent).slice(0, 3))
    }
  }, [])

  // Save to search history
  const saveToHistory = (query: string) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    
    const newHistory = [trimmedQuery, ...searchHistory.filter(h => h !== trimmedQuery)].slice(0, 5)
    setSearchHistory(newHistory)
    localStorage.setItem('search-history', JSON.stringify(newHistory))
    
    const newRecent = [trimmedQuery, ...recentSearches.filter(r => r !== trimmedQuery)].slice(0, 3)
    setRecentSearches(newRecent)
    localStorage.setItem('recent-searches', JSON.stringify(newRecent))
  }

  // Handle search with history
  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim()
    if (!searchTerm) return
    
    setIsSearching(true)
    setShowSearchResults(true)
    saveToHistory(searchTerm)
    
    try {
      const response = await searchArticlesByNumber(searchTerm)
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

  // Enhanced keyboard handling
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setShowSearchResults(false)
      setSearchFocused(false)
      searchInputRef.current?.blur()
    } else if (e.key === "/" && e.metaKey) {
      e.preventDefault()
      searchInputRef.current?.focus()
    }
  }

  // Handle input focus and blur
  const handleSearchFocus = () => {
    setSearchFocused(true)
    if (searchQuery.trim() || recentSearches.length > 0) {
      setShowSearchResults(true)
    }
  }

  const handleSearchBlur = () => {
    // Delay to allow click events on results
    setTimeout(() => {
      setSearchFocused(false)
    }, 150)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchResults(false)
    setSearchResults([])
    searchInputRef.current?.focus()
  }

  // Handle recent search selection
  const handleRecentSearch = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  // Mobile search expansion handlers
  const expandMobileSearch = () => {
    setMobileSearchExpanded(true)
    setTimeout(() => {
      mobileSearchRef.current?.focus()
    }, 300)
  }

  const collapseMobileSearch = () => {
    setMobileSearchExpanded(false)
    setSearchQuery("")
    setShowSearchResults(false)
    setSearchResults([])
  }

  // Handle mobile search
  const handleMobileSearch = async () => {
    if (!searchQuery.trim()) return
    await handleSearch()
  }

     const handleArticleSelect = (articleId: number) => {
     setShowSearchResults(false)
     setSearchQuery("")
     router.push(`/article/${articleId}`)
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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Top bar for contact info - desktop only */}
        <div className="hidden lg:flex items-center justify-between py-2 text-xs text-muted-foreground border-b border-border/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>+216 XX XXX XXX</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>contact@zorraga-auto.tn</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>Tunis, Tunisie</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Livraison 24h
            </Badge>
            <Badge variant="outline" className="text-xs">
              Garantie 2 ans
            </Badge>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-3 lg:py-4">
          {/* Logo and brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logoLightMode-1Sdeh2yB5H7GBKFJ7JPAuPpiXrnkdC.png"
                alt="Zorraga Pièces Auto"
                className="h-10 w-auto sm:h-12 lg:h-14 dark:hidden transition-all duration-300 group-hover:scale-105"
              />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logozorraga-YGuXTzhMbEM7UVKQ9Accbj2LhtdOlz.png"
                alt="Zorraga Pièces Auto"
                className="h-10 w-auto sm:h-12 lg:h-14 hidden dark:block transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                Zorraga Auto
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Pièces automobiles professionnelles
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative flex-1 max-w-xl mx-4 lg:mx-8 hidden sm:block" ref={searchRef}>
            <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
              {/* Search Icon */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                {isSearching ? (
                  <div className="h-5 w-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Search className={`h-5 w-5 transition-colors duration-200 ${searchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>

              {/* Enhanced Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher par référence, marque ou pièce... (Cmd+/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={`w-full pl-12 pr-24 py-3 lg:py-4 border-2 rounded-xl text-sm lg:text-base 
                         transition-all duration-300 placeholder:text-muted-foreground/70
                         ${searchFocused 
                           ? 'border-primary bg-background shadow-lg shadow-primary/10 ring-4 ring-primary/10' 
                           : 'border-border bg-background/50 hover:border-primary/50 hover:bg-background/80'
                         }`}
              />

              {/* Action Buttons */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="h-8 w-8 hover:bg-muted/80 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Desktop search button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSearch()}
                  className="h-8 w-8 hover:bg-primary/10 rounded-lg transition-all duration-200"
                  disabled={!searchQuery.trim()}
                >
                  <Search className="h-4 w-4 text-primary" />
                </Button>
              </div>

              {/* Keyboard shortcut hint */}
              {!searchFocused && !searchQuery && (
                <div className="hidden lg:flex absolute right-4 top-1/2 transform -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground/50">
                  <kbd className="px-2 py-1 bg-muted/30 rounded text-[10px] border border-border/30">⌘</kbd>
                  <kbd className="px-2 py-1 bg-muted/30 rounded text-[10px] border border-border/30">/</kbd>
                </div>
              )}
            </div>

            {/* Advanced Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border-2 border-border/20 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewAllResults}
                        className="text-xs h-7 px-3 rounded-lg hover:bg-primary hover:text-primary-foreground"
                      >
                        Voir tous
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {searchResults.slice(0, 5).map((article, index) => (
                        <div
                          key={article.articleId}
                          onClick={() => handleArticleSelect(article.articleId)}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-primary/20 group search-result-item"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex-shrink-0 overflow-hidden">
                            {article.imageLink ? (
                              <img
                                src={article.imageLink}
                                alt={article.articleProductName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Search className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                              {article.articleProductName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Réf: {article.articleNo} • {article.supplierName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              29,99 TND
                            </div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              En stock
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches - Show when no results or just focused */}
                {((searchResults.length === 0 && !isSearching) || (searchFocused && !searchQuery)) && recentSearches.length > 0 && (
                  <div className="p-4 border-t border-border/30">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Recherches récentes
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearch(query)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground flex items-center gap-3 recent-search-item"
                        >
                          <Clock className="h-3 w-3 text-primary" />
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {searchFocused && !searchQuery && (
                  <div className="p-4 border-t border-border/30">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Actions rapides</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Home className="h-4 w-4 text-primary" />
                        Parcourir
                      </button>
                      <button
                        onClick={() => router.push('/admin')}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Settings className="h-4 w-4 text-primary" />
                        Admin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border-2 border-border/20 rounded-xl shadow-xl p-6 text-center z-50">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-2">Aucun résultat trouvé</p>
                <p className="text-xs text-muted-foreground mb-4">Essayez avec d'autres mots-clés</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewAllResults}
                  className="rounded-lg hover:bg-primary hover:text-primary-foreground"
                >
                  Parcourir tous les articles
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Search Icon */}
          <div className="sm:hidden flex items-center">
            {!mobileSearchExpanded && (
              <Button
                variant="ghost"
                size="icon"
                onClick={expandMobileSearch}
                className="h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105 search-icon-mobile"
              >
                <Search className="h-5 w-5 text-foreground" />
              </Button>
            )}
          </div>

          {/* Modern Action Buttons */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="h-10 px-4 rounded-lg hover:bg-primary/10 transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="h-10 px-4 rounded-lg hover:bg-primary/10 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>

            {/* Cart Button with Enhanced Design */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground border-2 border-background animate-pulse"
                >
                  {getTotalItems()}
                </Badge>
              )}
              <span className="sr-only">Panier ({getTotalItems()} articles)</span>
            </Button>

            {/* Theme Toggle with Enhanced Design */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Basculer le thème</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className={`h-5 w-5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`} />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden overflow-hidden mobile-menu-slide">
            <div className="bg-gradient-to-b from-background to-muted/20 border-t border-border/30 mx-4 rounded-b-xl">
              <div className="p-6 space-y-6">
                {/* Brand info */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-primary">Zorraga Auto</h2>
                  <p className="text-sm text-muted-foreground">
                    Votre partenaire en pièces automobiles
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Livraison 24h
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Garantie 2 ans
                    </Badge>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-12 rounded-xl hover:bg-primary/10 transition-all"
                  >
                    <Home className="h-5 w-5 mr-3" />
                    <span className="text-base">Accueil</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/admin')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-12 rounded-xl hover:bg-primary/10 transition-all"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span className="text-base">Administration</span>
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-border/30">
                  <h3 className="text-sm font-semibold text-foreground">Contact</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>+216 XX XXX XXX</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>contact@zorraga-auto.tn</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Tunis, Tunisie</span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  variant="outline"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-12 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <X className="h-5 w-5 mr-2" />
                  Fermer le menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Overlay - Covers entire navbar */}
      {mobileSearchExpanded && (
        <div className="fixed top-0 left-0 right-0 bg-background border-b border-border/30 shadow-xl z-[9999] mobile-search-overlay">
          {/* Search Header */}
          <div className="flex items-center h-16 px-4 border-b border-border/20">
            <div className="flex-1 relative">
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder="Rechercher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleMobileSearch()
                  } else if (e.key === "Escape") {
                    collapseMobileSearch()
                  }
                }}
                className="w-full px-4 py-3 bg-muted/30 border border-border/40 rounded-lg text-base 
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                         placeholder:text-muted-foreground/70 placeholder:text-left mobile-search-input"
              />
            </div>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={collapseMobileSearch}
              className="ml-3 h-10 w-10 rounded-lg hover:bg-muted/80"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

                     {/* Search Content Area */}
           <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
             {/* Recent Searches only when no query */}
             {!searchQuery && !showSearchResults && recentSearches.length > 0 && (
               <div className="p-4">
                 <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                   Recherches récentes
                 </h3>
                 <div className="space-y-1">
                   {recentSearches.map((query, index) => (
                     <button
                       key={index}
                       onClick={() => {
                         setSearchQuery(query)
                         handleSearch(query)
                       }}
                       className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left recent-search-item"
                     >
                       <Clock className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm">{query}</span>
                     </button>
                   ))}
                 </div>
               </div>
             )}

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {searchResults.slice(0, 8).map((article, index) => (
                    <div
                      key={article.articleId}
                      onTouchEnd={(e) => {
                        console.log('=== MOBILE SEARCH TOUCH DEBUG ===')
                        console.log('Touch end event triggered')
                        console.log('Article ID:', article.articleId)
                        console.log('Article object:', article)
                        
                        e.preventDefault()
                        e.stopPropagation()
                        
                        try {
                          console.log('Attempting to close mobile search...')
                          collapseMobileSearch()
                          console.log('Mobile search closed')
                          
                          console.log('Attempting navigation to:', `/article/${article.articleId}`)
                          router.push(`/article/${article.articleId}`)
                          console.log('Navigation attempted')
                        } catch (error) {
                          console.error('Error during navigation:', error)
                        }
                        
                        console.log('=== END TOUCH DEBUG ===')
                      }}
                      onClick={(e) => {
                        console.log('Click event also triggered')
                        e.preventDefault()
                        e.stopPropagation()
                        collapseMobileSearch()
                        router.push(`/article/${article.articleId}`)
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors mobile-search-result"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        touchAction: 'manipulation',
                        userSelect: 'none'
                      }}
                    >
                      <div className="w-12 h-12 bg-muted/30 rounded-lg flex-shrink-0 overflow-hidden">
                        {article.imageLink ? (
                          <img
                            src={article.imageLink}
                            alt={article.articleProductName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Search className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{article.articleProductName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          Réf: {article.articleNo} • {article.supplierName}
                        </p>
                        <p className="text-sm font-semibold text-primary">29,99 TND</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {searchResults.length > 8 && (
                  <button
                    onClick={() => {
                      handleViewAllResults()
                      collapseMobileSearch()
                    }}
                    className="w-full mt-4 p-3 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors text-center text-sm font-medium"
                  >
                    Voir tous les {searchResults.length} résultats
                  </button>
                )}
              </div>
            )}

            {/* No results */}
            {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Aucun résultat trouvé</p>
                <p className="text-sm text-muted-foreground">
                  Essayez avec d'autres mots-clés ou une référence différente
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
