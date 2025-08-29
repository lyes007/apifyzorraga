"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { VehicleSelector } from "@/components/vehicle-selector"
import ArticleSearch from "@/components/article-search"
import { ArticleDetails } from "@/components/article-details"
import { CartDrawer } from "@/components/cart-drawer"

export default function HomePage() {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [showArticleDetails, setShowArticleDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle articleId from URL (from navbar search)
    const articleId = searchParams.get('articleId')
    const search = searchParams.get('search')
    
    if (articleId) {
      setSelectedArticleId(Number(articleId))
      setShowArticleDetails(true)
    } else if (search) {
      setSearchQuery(search)
      setShowArticleDetails(false)
      setSelectedArticleId(null)
    }
  }, [searchParams])

  const handleArticleSelect = (articleId: number) => {
    setSelectedArticleId(articleId)
    setShowArticleDetails(true)
  }

  const handleBackToSearch = () => {
    setShowArticleDetails(false)
    setSelectedArticleId(null)
  }

  if (showArticleDetails && selectedArticleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <ArticleDetails articleId={selectedArticleId} onBack={handleBackToSearch} />
          </div>
        </main>
        <CartDrawer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Recherche de Pièces Automobiles
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trouvez facilement les pièces compatibles avec votre véhicule grâce à notre base de données
              professionnelle TecDoc
            </p>
          </div>

                      <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Recherche par Véhicule
              </h2>
              <p className="text-muted-foreground mb-6">
                Sélectionnez votre véhicule pour trouver les pièces compatibles
              </p>
              <VehicleSelector />
            </div>

            {searchQuery && (
              <div className="mt-12">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Résultats de recherche pour "{searchQuery}"
                  </h2>
                  <p className="text-muted-foreground">
                    Articles trouvés correspondant à votre recherche
                  </p>
                </div>
                <ArticleSearch 
                  initialSearchQuery={searchQuery}
                  onArticleSelect={handleArticleSelect}
                />
              </div>
            )}

            {!searchQuery && (
              <div className="text-center mt-12">
                <div className="inline-flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">
                    Vous pouvez aussi rechercher directement par référence dans la barre de recherche ci-dessus
                  </span>
                </div>
              </div>
            )}
        </div>
      </main>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Zorraga Pièces Auto - Recherche professionnelle de pièces automobiles</p>
            <p className="mt-1">Propulsé par la base de données TecDoc</p>
          </div>
        </div>
      </footer>
      <CartDrawer />
    </div>
  )
}
