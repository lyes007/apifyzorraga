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
          <VehicleSelector />

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

      {/* Service Features Section */}
      <section className="bg-primary/5 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Livraison Gratuite */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Livraison Gratuite</h3>
              <p className="text-sm text-muted-foreground">À partir de 100dt</p>
              <p className="text-xs text-muted-foreground mt-1">*Sauf articles en promotion</p>
            </div>

            {/* Service Client */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Service Client</h3>
              <p className="text-sm text-muted-foreground">(+216) 99 639 619</p>
              <p className="text-sm text-muted-foreground">(+216) 20 639 610</p>
            </div>

            {/* 100% Sécurité */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">100% Sécurité</h3>
              <p className="text-sm text-muted-foreground">Paiement en ligne</p>
              <p className="text-xs text-muted-foreground mt-1">*Bientôt disponible</p>
            </div>

            {/* Des Promotions */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Des Promotions</h3>
              <p className="text-sm text-muted-foreground">Offres spéciales</p>
              <p className="text-xs text-muted-foreground mt-1">Régulièrement mises à jour</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/30">
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
