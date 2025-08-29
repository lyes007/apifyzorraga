"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SimpleSelect } from "@/components/ui/simple-select"
import { 
  ShoppingCart, 
  Eye, 
  Search, 
  Plus, 
  Filter,
  Grid3x3,
  List,
  TrendingUp,
  Package2,
  Star,
  ChevronDown,
  SortAsc,
  Euro
} from "lucide-react"
import { getArticles } from "@/lib/apify-api"
import { useCart } from "@/hooks/use-cart"
import { RobustProductImage } from "@/components/ui/robust-product-image"

interface Article {
  articleId: number
  articleNo: string
  supplierName: string
  supplierId: number
  articleProductName: string
  productId: number
  articleMediaType: number
  articleMediaFileName: string
  imageLink: string
  imageMedia: string
  s3ImageLink: string
}

interface ModernArticlesListProps {
  manufacturerId: number
  vehicleId: number
  productGroupId: string
  categoryName: string
  onArticleSelect: (articleId: number) => void
}

type SortOption = 'name' | 'supplier' | 'price' | 'popularity'
type ViewMode = 'grid' | 'list'

const ITEMS_PER_PAGE = 12

export function ModernArticlesList({
  manufacturerId,
  vehicleId,
  productGroupId,
  categoryName,
  onArticleSelect,
}: ModernArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const { addItem } = useCart()
  const router = useRouter()

  useEffect(() => {
    loadArticles()
  }, [manufacturerId, vehicleId, productGroupId])

  useEffect(() => {
    setCurrentPage(1) // Reset page when filters change
  }, [searchTerm, selectedSupplier, sortBy])

  const loadArticles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getArticles(manufacturerId, vehicleId, Number.parseInt(productGroupId))

      if (response.error) {
        setError(response.error)
        return
      }

      const articlesData = (response.data as any)?.[0]?.articles || []
      console.log(`[ModernArticles] Loaded ${articlesData.length} articles for category:`, categoryName)
      setArticles(articlesData)
    } catch (err) {
      setError("Erreur lors du chargement des articles")
      console.error("Error loading articles:", err)
    } finally {
      setLoading(false)
    }
  }

  // Advanced filtering and sorting
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles

    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.articleProductName.toLowerCase().includes(query) ||
          article.articleNo.toLowerCase().includes(query) ||
          article.supplierName.toLowerCase().includes(query)
      )
    }

    // Apply supplier filter
    if (selectedSupplier) {
      filtered = filtered.filter((article) => article.supplierName === selectedSupplier)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.articleProductName.localeCompare(b.articleProductName)
        case 'supplier':
          return a.supplierName.localeCompare(b.supplierName)
        case 'price':
          return 0 // Mock sorting since all prices are the same
        case 'popularity':
          return Math.random() - 0.5 // Mock popularity
        default:
          return 0
      }
    })

    return filtered
  }, [articles, searchTerm, selectedSupplier, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedArticles.length / ITEMS_PER_PAGE)
  const paginatedArticles = filteredAndSortedArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const uniqueSuppliers = Array.from(new Set(articles.map((article) => article.supplierName)))
    .sort()
    .map(supplier => ({
      value: supplier,
      label: supplier
    }))

  const sortOptions = [
    { value: 'name', label: 'Nom (A-Z)' },
    { value: 'supplier', label: 'Fournisseur' },
    { value: 'price', label: 'Prix' },
    { value: 'popularity', label: 'Popularité' }
  ]

  const handleAddToCart = (article: Article) => {
    addItem({
      articleId: article.articleId,
      name: article.articleProductName,
      price: 29.99,
      quantity: 1,
      image: article.imageLink || article.imageMedia || article.s3ImageLink || '',
      supplier: article.supplierName,
      articleNo: article.articleNo,
    })
  }

  const handleViewDetails = (articleId: number) => {
    router.push(`/article/${articleId}`)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSupplier("")
    setSortBy('name')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Package2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Articles disponibles</CardTitle>
              <p className="text-sm text-muted-foreground">{categoryName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted/50 rounded animate-pulse" />
                  <div className="h-3 bg-muted/30 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Package2 className="h-5 w-5 text-primary" />
            Articles - {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            <Package2 className="h-16 w-16 mx-auto mb-4 text-destructive/50" />
            <p className="text-destructive mb-4 font-medium">{error}</p>
            <Button variant="outline" onClick={loadArticles}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/10 shadow-lg">
      {/* Header */}
      <CardHeader className="pb-4 mobile-articles-header">
        <div className="space-y-4">
          {/* Title and View Toggle Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full">
                <Package2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl text-primary truncate">Articles disponibles</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                  {filteredAndSortedArticles.length} article{filteredAndSortedArticles.length > 1 ? "s" : ""} 
                  {filteredAndSortedArticles.length !== articles.length && ` sur ${articles.length}`} • {categoryName}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-10 w-16 sm:w-18 text-xs"
              >
                <Grid3x3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Grille</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-10 w-16 sm:w-18 text-xs"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Liste</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Primary Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Rechercher par nom, référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-search-input pl-10 pr-10 border-2 hover:border-primary/50 transition-colors h-12 text-base sm:text-sm"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchTerm("")}
              >
                ×
              </Button>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-11 sm:h-auto justify-center sm:justify-start"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {(searchTerm || selectedSupplier) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-11 sm:h-auto text-muted-foreground hover:text-foreground"
                >
                  Effacer les filtres
                </Button>
              )}
            </div>

            {/* Sort controls - always visible on mobile */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Trier par:</span>
              <SimpleSelect
                options={sortOptions}
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
                placeholder="Tri"
                className="flex-1 sm:w-40"
              />
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mobile-filter-panel p-4 sm:p-6 bg-muted/30 rounded-lg border border-border/50 slide-in-from-bottom">
              <div className="space-y-4 sm:space-y-0 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Fournisseur</label>
                  <SimpleSelect
                    options={[{ value: '', label: 'Tous les fournisseurs' }, ...uniqueSuppliers]}
                    value={selectedSupplier}
                    onValueChange={setSelectedSupplier}
                    placeholder="Sélectionner un fournisseur"
                    className="w-full"
                  />
                </div>
                
                {/* Additional filters can be added here */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Prix</label>
                  <Button variant="outline" disabled className="w-full justify-start h-12">
                    <Euro className="h-4 w-4 mr-2" />
                    Tous les prix
                  </Button>
                </div>

                {/* Mobile: Close filters button */}
                <div className="sm:hidden pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFilters(false)}
                    className="w-full h-11"
                  >
                    Fermer les filtres
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-2">
        {filteredAndSortedArticles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package2 className="h-20 w-20 mx-auto mb-6 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedSupplier ? "Aucun résultat trouvé" : "Aucun article disponible"}
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto">
              {searchTerm || selectedSupplier
                ? "Essayez de modifier vos critères de recherche ou utilisez des termes différents"
                : "Cette catégorie ne contient aucun article compatible avec votre véhicule"}
            </p>
            {(searchTerm || selectedSupplier) && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Effacer tous les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Articles Grid/List */}
            <div className={viewMode === 'grid' 
              ? "mobile-article-grid grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 category-scroll px-2 sm:px-0" 
              : "space-y-3 px-2 sm:px-0"
            }>
              {paginatedArticles.map((article, index) => (
                <Card
                  key={article.articleId}
                  className={`overflow-hidden product-card mobile-article-card border-2 border-border/30 hover:border-primary/50 category-card slide-in-from-bottom view-transition ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className={`mobile-article-image bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center relative overflow-hidden ${
                    viewMode === 'list' ? 'w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0' : 'aspect-square min-h-[200px] sm:min-h-[240px]'
                  }`}>
                    <RobustProductImage
                      s3ImageLink={article.s3ImageLink}
                      imageLink={article.imageLink}
                      imageMedia={article.imageMedia}
                      alt={article.articleProductName}
                      className="w-full h-full transition-transform duration-300 hover:scale-110"
                      size="xl"
                      showDebug={false}
                    />
                    
                    {/* Quick Add Button Overlay */}
                    <Button
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-primary/90 hover:bg-primary opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(article)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Product Info */}
                  <CardContent className={`mobile-article-content flex-1 ${viewMode === 'list' ? 'p-3 sm:p-4 flex flex-col justify-between' : 'p-3 sm:p-4'}`}>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1 text-foreground">
                            {article.articleProductName}
                          </h3>
                          <Badge variant="secondary" className="text-xs shrink-0 supplier-badge">
                            {article.supplierName}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono text-muted-foreground">
                            {article.articleNo}
                          </code>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">4.5</span>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-xl font-bold text-primary">
                        29,99 <span className="text-sm font-medium">TND</span>
                      </div>

                      {/* Actions */}
                      <div className={`grid gap-2 ${viewMode === 'list' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <Button
                          onClick={() => handleAddToCart(article)}
                          size="sm"
                          className="w-full mobile-button transition-all hover:shadow-md min-h-[44px]"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Ajouter au panier
                        </Button>
                        
                        {viewMode === 'grid' && (
                          <Button
                            onClick={() => handleViewDetails(article.articleId)}
                            variant="outline"
                            size="sm"
                            className="w-full mobile-button transition-all hover:shadow-md min-h-[44px]"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </Button>
                        )}

                        {viewMode === 'list' && (
                          <Button
                            onClick={() => handleViewDetails(article.articleId)}
                            variant="outline"
                            size="sm"
                            className="w-full mobile-button min-h-[44px]"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-border/50">
                {/* Mobile: Compact pagination */}
                <div className="sm:hidden flex items-center gap-3 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="flex-1 mobile-pagination-button"
                  >
                    Précédent
                  </Button>
                  <div className="px-4 py-3 bg-primary/10 rounded-lg text-sm font-medium min-w-[80px] text-center">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="flex-1 mobile-pagination-button"
                  >
                    Suivant
                  </Button>
                </div>

                {/* Desktop: Full pagination */}
                <div className="hidden sm:flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page = i + 1
                      if (totalPages > 7) {
                        if (currentPage <= 4) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 3) {
                          page = totalPages - 6 + i
                        } else {
                          page = currentPage - 3 + i
                        }
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'ghost'}
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="text-center text-sm text-muted-foreground mt-6 pt-4 border-t border-border/30">
              Affichage {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedArticles.length)} sur {filteredAndSortedArticles.length} articles
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
