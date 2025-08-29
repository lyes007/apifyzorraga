"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Eye, ImageIcon, Search, Plus } from "lucide-react"
import { getArticles } from "@/lib/apify-api"
import { ArticleCardSkeleton } from "./loading-skeleton"
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

interface ArticlesListProps {
  manufacturerId: number
  vehicleId: number
  productGroupId: string
  categoryName: string
  onArticleSelect: (articleId: number) => void
}

export function ArticlesList({
  manufacturerId,
  vehicleId,
  productGroupId,
  categoryName,
  onArticleSelect,
}: ArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const { addItem } = useCart()

  useEffect(() => {
    loadArticles()
  }, [manufacturerId, vehicleId, productGroupId])

  useEffect(() => {
    filterArticles()
  }, [articles, searchTerm, selectedSupplier])

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
      setArticles(articlesData)
    } catch (err) {
      setError("Erreur lors du chargement des articles")
      console.error("Error loading articles:", err)
    } finally {
      setLoading(false)
    }
  }

  const filterArticles = () => {
    let filtered = articles

    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.articleProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.articleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.supplierName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSupplier) {
      filtered = filtered.filter((article) => article.supplierName === selectedSupplier)
    }

    setFilteredArticles(filtered)
  }

  const uniqueSuppliers = Array.from(new Set(articles.map((article) => article.supplierName))).sort()

  const handleAddToCart = (article: Article) => {
    addItem({
      articleId: article.articleId,
      name: article.articleProductName,
      price: 29.99, // Mock price for all articles
      quantity: 1,
              image: article.imageLink || article.imageMedia || article.s3ImageLink || '',
      supplier: article.supplierName,
      articleNo: article.articleNo,
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Articles - {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Articles - {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadArticles}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-primary flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Articles - {categoryName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredArticles.length} article{filteredArticles.length > 1 ? "s" : ""} trouvé
              {filteredArticles.length > 1 ? "s" : ""}
              {filteredArticles.length !== articles.length && ` sur ${articles.length}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, référence ou fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {uniqueSuppliers.length > 1 && (
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[150px]"
            >
              <option value="">Tous les fournisseurs</option>
              {uniqueSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {searchTerm || selectedSupplier ? "Aucun résultat trouvé" : "Aucun article trouvé"}
            </p>
            <p className="text-sm">
              {searchTerm || selectedSupplier
                ? "Essayez de modifier vos critères de recherche"
                : "Cette catégorie ne contient aucun article pour ce véhicule"}
            </p>
            {(searchTerm || selectedSupplier) && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSupplier("")
                }}
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArticles.map((article) => (
              <Card
                key={article.articleId}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  <RobustProductImage
                    s3ImageLink={article.s3ImageLink}
                    imageLink={article.imageLink}
                    imageMedia={article.imageMedia}
                    alt={article.articleProductName}
                    className="w-full h-full transition-transform duration-200 hover:scale-110"
                    size="xl"
                    showDebug={false}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm line-clamp-2 flex-1 leading-tight">
                        {article.articleProductName}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {article.supplierName}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      Réf: {article.articleNo}
                    </p>
                    
                    {/* Price and Actions */}
                    <div className="space-y-2">
                                             <div className="text-lg font-bold text-primary text-center">
                         29,99 TND
                       </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleAddToCart(article)}
                          className="w-full transition-colors"
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Panier
                        </Button>
                        <Button
                          onClick={() => onArticleSelect(article.articleId)}
                          className="w-full transition-colors"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
