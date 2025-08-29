"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ArticleDetails } from "@/components/article-details"
import { CartDrawer } from "@/components/cart-drawer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const router = useRouter()
  const articleId = parseInt(params.id)

  const handleBack = () => {
    router.back()
  }

  if (isNaN(articleId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-6">L'ID de l'article fourni n'est pas valide.</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile Back Button */}
        <div className="mb-4 sm:hidden">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="h-12 w-full justify-start bg-background/80 backdrop-blur-sm border border-border/50"
          >
            <ArrowLeft className="h-4 w-4 mr-3" />
            Retour aux articles
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <ArticleDetails articleId={articleId} onBack={handleBack} />
        </div>
      </main>
      
      <CartDrawer />
    </div>
  )
}
