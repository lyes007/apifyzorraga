"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Car, Package, Barcode, Settings, ShoppingCart } from "lucide-react"
import { getArticleDetails } from "@/lib/apify-api"
import { useCart } from "@/hooks/use-cart"
import { RobustProductImage } from "@/components/ui/robust-product-image"

interface ArticleDetail {
  articleId: number
  articleNo: string
  articleProductName: string
  supplierName: string
  supplierId: number
  articleMediaType: number
  articleMediaFileName: string
  articleInfo: {
    articleId: number
    articleNo: string
    supplierId: number
    supplierName: string
    isAccessory: number
    articleProductName: string
  }
  allSpecifications: Array<{
    criteriaName: string
    criteriaValue: string
  }>
  eanNo: {
    eanNumbers: string
  }
  oemNo: Array<{
    oemBrand: string
    oemDisplayNo: string
  }>
  imageLink: string
  imageMedia: string
  s3ImageLink: string
  compatibleCars: Array<{
    vehicleId: number
    modelId: number
    manufacturerName: string
    modelName: string
    typeEngineName: string
    constructionIntervalStart: string
    constructionIntervalEnd: string | null
  }>
}

interface ArticleDetailsProps {
  articleId: number
  onBack: () => void
}

export function ArticleDetails({ articleId, onBack }: ArticleDetailsProps) {
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    if (article) {
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
  }

  useEffect(() => {
    loadArticleDetails()
  }, [articleId])

  const loadArticleDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getArticleDetails(articleId)

      if (response.error) {
        setError(response.error)
        return
      }

      let articleData: any = null
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        articleData = response.data[0]?.article
      } else if (response.data && typeof response.data === 'object') {
        articleData = (response.data as any).article
      }
      
      if (!articleData) {
        setError("Données d'article invalides")
        return
      }
      
      // Debug: Log image data
      console.log("Article data received:", articleData)
      console.log("Image fields:", {
        s3ImageLink: articleData.s3ImageLink,
        imageLink: articleData.imageLink,
        imageMedia: articleData.imageMedia,
        articleMediaFileName: articleData.articleMediaFileName,
        articleMediaType: articleData.articleMediaType
      })
      
      setArticle(articleData)
    } catch (err) {
      setError("Erreur lors du chargement des détails de l'article")
      console.error("Error loading article details:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-primary">Détails de l'article</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Chargement des détails...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !article) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-primary">Détails de l'article</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error || "Article non trouvé"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-primary">Détails de l'article</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Article Header */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
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
          </div>

          <div className="md:w-2/3 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{article.articleProductName}</h2>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default">{article.supplierName}</Badge>
                <Badge variant="outline">Réf: {article.articleNo}</Badge>
              </div>
              
              {/* Price and Add to Cart */}
                              <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-primary">
                    29,99 TND
                  </div>
                <Button 
                  onClick={handleAddToCart}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
              </div>
              

            </div>

            {/* EAN and OEM Numbers */}
            <div className="grid gap-4 md:grid-cols-2">
              {article.eanNo?.eanNumbers && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4" />
                    <span className="font-medium">Code EAN</span>
                  </div>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{article.eanNo.eanNumbers.trim()}</p>
                </div>
              )}

              {article.oemNo && article.oemNo.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Références OEM</span>
                  </div>
                  <div className="space-y-1">
                    {article.oemNo.map((oem, index) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded">
                        <span className="font-medium">{oem.oemBrand}:</span> {oem.oemDisplayNo}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Specifications */}
        {article.allSpecifications && article.allSpecifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Spécifications techniques
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              {article.allSpecifications.map((spec, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="font-medium text-sm">{spec.criteriaName}</span>
                  <span className="text-sm">{spec.criteriaValue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Compatible Cars */}
        {article.compatibleCars && article.compatibleCars.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" />
              Véhicules compatibles ({article.compatibleCars.length})
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {article.compatibleCars.map((car, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded text-sm">
                  <div className="font-medium">
                    {car.manufacturerName} {car.modelName}
                  </div>
                  <div className="text-muted-foreground">
                    {car.typeEngineName} • {car.constructionIntervalStart.split("-")[0]} -{" "}
                    {car.constructionIntervalEnd ? car.constructionIntervalEnd.split("-")[0] : "présent"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
