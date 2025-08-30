"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/hooks/use-cart"
import { RobustProductImage } from "@/components/ui/robust-product-image"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Package, 
  Shield, 
  Truck, 
  Info,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Award,
  Clock
} from "lucide-react"

interface ArticleDetailsProps {
  articleId: number
  onBack?: () => void
}

interface ArticleData {
  articleId: number
  articleNo: string
  articleProductName: string
  supplierName: string
  supplierId: number
  imageLink?: string
  imageMedia?: string
  s3ImageLink?: string
  allMedia?: Array<{
    articleMediaType: string
  articleMediaFileName: string
    supplierId: number
    mediaInformation: string
  imageLink: string
  imageMedia: string
  }>
  allSpecifications?: Array<{
    specificationName: string
    specificationValue: string
    specificationUnit?: string
  }>
  eanNo?: { eanNumbers: string }
  oemNo?: Array<{
    oemNumber: string
    manufacturerName: string
  }>
  articleInfo?: {
    weight?: number
    dimensions?: string
    warranty?: string
}
}

export function ArticleDetails({ articleId, onBack }: ArticleDetailsProps) {
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  const { addItem } = useCart()

  // Build comprehensive image gallery from all available sources
  const images = useMemo(() => {
    if (!article) return []
    
    const imageSet = new Set<string>()
    
    // Add primary images first
    if (article.imageLink) imageSet.add(article.imageLink)
    if (article.imageMedia) imageSet.add(article.imageMedia)
    if (article.s3ImageLink) imageSet.add(article.s3ImageLink)
    
    // Add all media images
    if (article.allMedia && article.allMedia.length > 0) {
      article.allMedia.forEach(media => {
        if (media.imageLink) imageSet.add(media.imageLink)
        if (media.imageMedia) imageSet.add(media.imageMedia)
      })
    }
    
    return Array.from(imageSet)
  }, [article])

  useEffect(() => {
    loadArticleDetails()
  }, [articleId])

  const loadArticleDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch article details, specifications, and media in parallel
      const [detailsResponse, specsResponse, mediaResponse] = await Promise.all([
        fetch('/api/apify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectPageType: 'get-article-details-by-article-id',
            langId: 6,
            countryId: 6,
            articleId: articleId
          })
        }),
        fetch('/api/apify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectPageType: 'get-article-specification-details-by-article-id',
            langId: 6,
            countryId: 6,
            articleId: articleId
          })
        }),
        fetch('/api/apify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectPageType: 'get-article-all-media',
            langId: 6,
            countryId: 6,
            articleId: articleId
          })
        })
      ])

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch article details')
      }

      const [detailsData, specsData, mediaData] = await Promise.all([
        detailsResponse.json(),
        specsResponse.json(),
        mediaResponse.json()
      ])

      if (detailsData.length > 0 && detailsData[0].article) {
        const articleDetails = detailsData[0].article
        const specifications = specsData.length > 0 ? specsData[0] : null
        
        // Process media data - could be single object or array
        let allMedia: any[] = []
        if (mediaData && mediaData.length > 0) {
          // If it's an array of media objects
          if (Array.isArray(mediaData)) {
            allMedia = mediaData.filter(media => media.imageLink || media.imageMedia)
          } else if (mediaData[0] && (mediaData[0].imageLink || mediaData[0].imageMedia)) {
            // Single media object
            allMedia = [mediaData[0]]
          }
        }



        setArticle({
          ...articleDetails,
          allMedia: allMedia,
          allSpecifications: specifications?.articleAllSpecifications || [],
          eanNo: specifications?.articleEanNo || null,
          oemNo: specifications?.articleOemNo || []
        })
      } else {
        throw new Error('Article not found')
      }
    } catch (err) {
      console.error('[ArticleDetails] Error loading article:', err)
      setError(err instanceof Error ? err.message : 'Failed to load article details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!article) return
    
    addItem({
      articleId: article.articleId,
      name: article.articleProductName,
      price: 29.99, // Mock price
      quantity: quantity,
      image: article.imageLink || article.imageMedia || article.s3ImageLink || '',
      supplier: article.supplierName,
      articleNo: article.articleNo,
    })
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted/30 rounded-lg animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted/30 rounded-md animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted/30 rounded-md animate-pulse" />
              <div className="h-6 bg-muted/30 rounded-md w-3/4 animate-pulse" />
              <div className="h-10 bg-muted/30 rounded-md w-1/2 animate-pulse" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-muted/30 rounded animate-pulse" />
              ))}
            </div>
          </div>
          </div>
          </div>
    )
  }

  if (error || !article) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Article non trouvé</h2>
            <p className="text-muted-foreground">
              {error || "L'article demandé n'existe pas ou n'est plus disponible."}
            </p>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
            </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }



  const mockPrice = 29.99
  const mockOriginalPrice = 39.99
  const discount = Math.round(((mockOriginalPrice - mockPrice) / mockOriginalPrice) * 100)

  return (
    <div className="max-w-7xl mx-auto article-details-mobile">
      {/* Desktop Back Button */}
      {onBack && (
        <div className="hidden sm:block mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="h-10 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux résultats
          </Button>
        </div>
      )}

      <div className="mobile-detail-grid grid lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative mobile-gallery-main bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden aspect-square product-image-hover">
            {images.length > 0 ? (
              <RobustProductImage
                s3ImageLink={images[selectedImage]}
                imageLink={images[selectedImage]}
                imageMedia={images[selectedImage]}
                alt={article.articleProductName}
                className="w-full h-full object-contain transition-all duration-300"
              />
            ) : (
              <RobustProductImage
                s3ImageLink={article.s3ImageLink}
                imageLink={article.imageLink}
                imageMedia={article.imageMedia}
                alt={article.articleProductName}
                className="w-full h-full object-contain"
              />
            )}
            
            {/* Image overlay actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Gallery navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 gallery-navigation-arrow bg-background/80 hover:bg-background border border-border rounded-full p-2"
                  aria-label="Image précédente"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 gallery-navigation-arrow bg-background/80 hover:bg-background border border-border rounded-full p-2"
                  aria-label="Image suivante"
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 gallery-counter px-3 py-1 rounded-full text-xs font-medium">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white font-bold">
                  -{discount}%
                </Badge>
              </div>
            )}
          </div>

          {/* Enhanced Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Images ({images.length})
              </h4>
              <div className="mobile-thumbnail-strip">
                {/* Desktop: Show all thumbnails */}
                <div className="hidden sm:grid grid-cols-6 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 thumbnail-transition ${
                        selectedImage === index 
                          ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RobustProductImage
                        s3ImageLink={image}
                        imageLink={image}
                        imageMedia={image}
                        alt={`${article.articleProductName} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>

                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 gallery-thumbnail-grid">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 thumbnail-transition ${
                        selectedImage === index 
                          ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RobustProductImage
                        s3ImageLink={image}
                        imageLink={image}
                        imageMedia={image}
                        alt={`${article.articleProductName} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="mobile-product-title text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {article.articleProductName}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className="mobile-badge text-xs">
                    {article.supplierName}
                  </Badge>
                  <Badge variant="outline" className="mobile-badge text-xs">
                    Réf: {article.articleNo}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(127 avis)</span>
            </div>
          </div>

          {/* Price */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
            <div>
                  <div className="flex items-baseline gap-3">
                    <span className="mobile-product-price text-3xl font-bold text-primary price-pulse">
                      {mockPrice.toFixed(2)} <span className="text-lg">TND</span>
                    </span>
                    {discount > 0 && (
                      <span className="text-lg text-muted-foreground line-through">
                        {mockOriginalPrice.toFixed(2)} TND
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prix TTC • Livraison incluse
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    En stock
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Truck className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Livraison 24h</span>
            </div>
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Garantie 2 ans</span>
            </div>
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Award className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Qualité OE</span>
            </div>
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Installation</span>
            </div>
              </div>
              
          {/* Quantity & Add to Cart */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Quantité</label>
                  <div className="mobile-quantity-controls flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mobile-quantity-button h-10 w-10 p-0"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mobile-quantity-button h-10 w-10 p-0"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>

                <Button 
                  onClick={handleAddToCart}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ajouter au panier • {(mockPrice * quantity).toFixed(2)} TND
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-11">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                  <Button variant="outline" className="h-11">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                </Button>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
            </div>

      {/* Product Details Tabs */}
      <div className="mt-8 lg:mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 sm:h-auto">
            <TabsTrigger value="overview" className="mobile-tabs-trigger text-xs sm:text-sm">Aperçu</TabsTrigger>
            <TabsTrigger value="specs" className="mobile-tabs-trigger text-xs sm:text-sm">Spécifications</TabsTrigger>
            <TabsTrigger value="compatibility" className="mobile-tabs-trigger text-xs sm:text-sm">Compatibilité</TabsTrigger>
            <TabsTrigger value="delivery" className="mobile-tabs-trigger text-xs sm:text-sm">Livraison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 tab-content-enter">
            <Card className="mobile-detail-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Description du produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Pièce de suspension de haute qualité conçue pour assurer une conduite confortable et sécurisée. 
                  Fabriquée selon les standards OE pour une compatibilité parfaite avec votre véhicule.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium">Caractéristiques principales</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Matériaux haute résistance</li>
                      <li>• Installation facile</li>
                      <li>• Testé en conditions extrêmes</li>
                      <li>• Certification ISO/TS 16949</li>
                    </ul>
                </div>

                  {article.eanNo && (
                <div className="space-y-2">
                      <h4 className="font-medium">Codes produit</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">EAN:</span>
                  <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {article.eanNo.eanNumbers}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(article.eanNo?.eanNumbers || '')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                  </div>
                      </div>
                  </div>
                </div>
              )}
            </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6 tab-content-enter">
            <Card className="mobile-detail-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
              Spécifications techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {article.allSpecifications && article.allSpecifications.length > 0 ? (
                  <div className="grid gap-3">
              {article.allSpecifications.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm font-medium">{spec.specificationName}</span>
                        <span className="text-sm text-muted-foreground">
                          {spec.specificationValue}
                          {spec.specificationUnit && ` ${spec.specificationUnit}`}
                        </span>
                </div>
              ))}
            </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune spécification technique disponible pour ce produit.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

                    <TabsContent value="compatibility" className="mt-6 tab-content-enter">
            <div className="space-y-6">
              {/* OEM Numbers Section */}
              <Card className="mobile-detail-section">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Références OE / OEM
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Numéros de pièces d'origine constructeur compatibles
                  </p>
                </CardHeader>
                <CardContent>
                                    {article.oemNo && article.oemNo.length > 0 ? (
                    <div className="space-y-4">
                      {/* Header with count */}
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">
                          {article.oemNo.length} référence{article.oemNo.length > 1 ? 's' : ''} OE trouvée{article.oemNo.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          {article.oemNo.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                const allRefs = article.oemNo.map(oem => `${oem.oemBrand}: ${oem.oemDisplayNo}`).join('\n')
                                copyToClipboard(allRefs)
                              }}
                              title="Copier toutes les références"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Tout copier
                            </Button>
                          )}
                          {article.oemNo.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              Défiler pour voir plus
                            </span>
                          )}
                        </div>
                      </div>

                      {/* OEM References */}
                      <div className="space-y-3 max-h-96 overflow-y-auto category-scroll">
                        {article.oemNo.map((oem, index) => (
                          <div key={index} className="border border-border/40 rounded-lg p-4 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Award className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{oem.oemBrand || 'Constructeur'}</h4>
                                  <p className="text-xs text-muted-foreground">Référence OE</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                OE
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between bg-background/50 p-2 rounded-md border border-border/30">
                              <code className="text-xs font-mono font-medium text-foreground">
                                {oem.oemDisplayNo}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-primary/10"
                                onClick={() => copyToClipboard(oem.oemDisplayNo)}
                                title="Copier la référence"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Summary */}
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {article.oemNo.length} référence{article.oemNo.length > 1 ? 's' : ''} OE compatible{article.oemNo.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                          Cette pièce remplace directement les références d'origine constructeur
                        </p>
            </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium mb-2">Aucune référence OE disponible</h4>
                      <p className="text-sm text-muted-foreground">
                        Les informations de compatibilité OE ne sont pas disponibles pour cette pièce
                      </p>

          </div>
        )}
      </CardContent>
    </Card>

              {/* Vehicle Compatibility Info */}
              <Card className="mobile-detail-section">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Informations de compatibilité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Garantie de compatibilité</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          Pièce garantie compatible selon les spécifications TecDoc
                        </p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-sm">Vérification recommandée</span>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Vérifiez toujours la compatibilité avec votre véhicule avant commande
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-border/40 rounded-lg">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Comment vérifier la compatibilité
                      </h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Comparez avec la référence d'origine de votre pièce</li>
                        <li>• Vérifiez le numéro VIN de votre véhicule</li>
                        <li>• Consultez le manuel technique de votre véhicule</li>
                        <li>• Contactez notre service technique en cas de doute</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6 tab-content-enter">
            <Card className="mobile-detail-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Livraison et retours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
                    <h4 className="font-medium">Options de livraison</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Livraison Express</p>
                          <p className="text-xs text-green-600">24h - Gratuite dès 50 TND</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Livraison Standard</p>
                          <p className="text-xs text-muted-foreground">2-3 jours - 5 TND</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Retours et garantie</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Retour gratuit sous 30 jours</p>
                      <p>• Garantie constructeur 2 ans</p>
                      <p>• Support technique inclus</p>
                      <p>• Pièce défectueuse ? Échange immédiat</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
            </div>
          </div>
  )
}