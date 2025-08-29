"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Loader2, Eye, Plus } from "lucide-react"
import { searchArticlesByNumber } from "@/lib/apify-api"
import { useCart } from "@/hooks/use-cart"
import { RobustProductImage } from "@/components/ui/robust-product-image"

interface SearchResult {
  articleId: number
  articleNo: string
  articleProductName: string
  supplierName: string
  supplierId: number
  articleMediaType: number
  articleMediaFileName: string
  imageLink: string
  imageMedia: string
  s3ImageLink: string
}

interface SearchResponse {
  articleSearchNr: string
  countArticles: number
  articles: SearchResult[]
}

interface ArticleSearchProps {
  onArticleSelect?: (articleId: number) => void
  initialSearchQuery?: string
}

export default function ArticleSearch({ onArticleSelect, initialSearchQuery = "" }: ArticleSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const { addItem } = useCart()

  // Auto-search when initialSearchQuery is provided
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchQuery(initialSearchQuery)
      setHasSearched(true)
      // Trigger search automatically
      handleSearchWithQuery(initialSearchQuery)
    }
  }, [initialSearchQuery])

  const handleSearchWithQuery = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(false)

    try {
      console.log("[v0] Searching for article:", query)
      const response = await searchArticlesByNumber(query.trim())

      if (response.error) {
        console.error("[v0] Search error:", response.error)
        setSearchResults([])
        setResultCount(0)
      } else {
        console.log("[v0] Search response:", response.data)
        let searchData: SearchResponse | null = null
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          searchData = response.data[0] as SearchResponse
        } else if (response.data && typeof response.data === 'object') {
          searchData = response.data as SearchResponse
        }

        if (searchData?.articles) {
          setSearchResults(searchData.articles)
          setResultCount(searchData.countArticles || searchData.articles.length)
          console.log("[v0] Found articles:", searchData.articles.length)
        } else {
          setSearchResults([])
          setResultCount(0)
        }
      }
    } catch (error) {
      console.error("[v0] Search failed:", error)
      setSearchResults([])
      setResultCount(0)
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }

  const handleSearch = async () => {
    await handleSearchWithQuery(searchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleAddToCart = (article: SearchResult) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Recherche par Numéro d'Article
          </CardTitle>
          <CardDescription>Recherchez des pièces auto en utilisant le numéro d'article ou de référence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Entrez le numéro d'article (ex: 2250038)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Résultats de recherche
              {resultCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {resultCount} article{resultCount > 1 ? "s" : ""} trouvé{resultCount > 1 ? "s" : ""}
                </Badge>
              )}
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground">
                  Aucun article ne correspond au numéro "{searchQuery}". Vérifiez le numéro et réessayez.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((article) => (
                <Card key={article.articleId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <RobustProductImage
                          s3ImageLink={article.s3ImageLink}
                          imageLink={article.imageLink}
                          imageMedia={article.imageMedia}
                          alt={article.articleProductName}
                          className="w-full h-full"
                          size="xl"
                          showDebug={false}
                        />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm line-clamp-2">{article.articleProductName}</h4>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Référence:</span>
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{article.articleNo}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>Fournisseur:</span>
                            <Badge variant="outline" className="text-xs">
                              {article.supplierName}
                            </Badge>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="space-y-2 mt-3">
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
                            {onArticleSelect && (
                              <Button
                                onClick={() => onArticleSelect(article.articleId)}
                                className="w-full transition-colors"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Détails
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
