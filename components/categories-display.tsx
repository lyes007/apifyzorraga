"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronRight, Package, Search } from "lucide-react"
import { getCategories } from "@/lib/apify-api"
import { CategorySkeleton } from "./loading-skeleton"

interface Category {
  level: number
  levelText_1: string | null
  levelId_1: string | null
  levelText_2: string | null
  levelId_2: string | null
  levelText_3: string | null
  levelId_3: string | null
  levelText_4: string | null
  levelId_4: string | null
}

interface CategoriesDisplayProps {
  manufacturerId: number
  vehicleId: number
  onCategorySelect: (categoryId: string, categoryName: string) => void
}

export function CategoriesDisplay({ manufacturerId, vehicleId, onCategorySelect }: CategoriesDisplayProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Record<string, Category[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadCategories()
  }, [manufacturerId, vehicleId])

  useEffect(() => {
    filterCategories()
  }, [categories, searchTerm])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      let categoriesData: Category[] = []

      // Try v1 first
      let response = await getCategories(manufacturerId, vehicleId, "v1")
      console.log("[v0] Categories v1 response:", response)

      if (!response.error && (response.data as any)?.[0]?.categories) {
        // v1 format: direct array of categories
        categoriesData = (response.data as any)[0].categories
        console.log("[v0] Using v1 categories:", categoriesData.length)
      }

      // If v1 failed or returned no data, try v2
      if (categoriesData.length === 0) {
        response = await getCategories(manufacturerId, vehicleId, "v2")
        console.log("[v0] Categories v2 response:", response)

        if (!response.error && (response.data as any)?.[0]?.categories) {
          // v2 format: nested object structure, convert to v1 format
          const v2Categories = (response.data as any)[0].categories
          categoriesData = convertV2ToV1Format(v2Categories)
          console.log("[v0] Using v2 categories:", categoriesData.length)
        }
      }

      // If v2 also failed, try v3
      if (categoriesData.length === 0) {
        response = await getCategories(manufacturerId, vehicleId, "v3")
        console.log("[v0] Categories v3 response:", response)

        if (!response.error) {
          let v3Categories: any = null
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            v3Categories = response.data[0]?.categories
          } else if (response.data && typeof response.data === 'object') {
            v3Categories = (response.data as any).categories
          }
          
          if (v3Categories) {
            // v3 format: different nested structure, convert to v1 format
            categoriesData = convertV3ToV1Format(v3Categories)
            console.log("[v0] Using v3 categories:", categoriesData.length)
          }
        }
      }

      if (categoriesData.length === 0) {
        setError("Aucune catégorie trouvée pour ce véhicule")
        return
      }

      console.log("[v0] Final categories data:", categoriesData)
      setCategories(categoriesData)
    } catch (err) {
      setError("Erreur lors du chargement des catégories")
      console.error("Error loading categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const convertV2ToV1Format = (v2Categories: any): Category[] => {
    const categories: Category[] = []

    const processCategory = (
      categoryData: any,
      parentText: string | null = null,
      parentId: string | null = null,
      level = 1,
    ) => {
      const categoryName = categoryData.categoryName
      const categoryId = categoryData.categoryId?.toString()

      if (categoryData.children && typeof categoryData.children === "object") {
        // Has children, process them
        Object.entries(categoryData.children).forEach(([childName, childData]: [string, any]) => {
          if (childData.children && Object.keys(childData.children).length > 0) {
            // Child has children, process recursively
            processCategory(childData, categoryName, categoryId, level + 1)
          } else {
            // Leaf node, create category entry
            categories.push({
              level: level + 1,
              levelText_1: level === 1 ? categoryName : parentText,
              levelId_1: level === 1 ? categoryId : parentId,
              levelText_2: level === 1 ? childName : categoryName,
              levelId_2: level === 1 ? (childData.categoryId?.toString() || null) : categoryId,
              levelText_3: level > 1 ? childName : null,
              levelId_3: level > 1 ? (childData.categoryId?.toString() || null) : null,
              levelText_4: null,
              levelId_4: null,
            })
          }
        })
      } else {
        // Leaf node
        categories.push({
          level: level,
          levelText_1: level === 1 ? categoryName : parentText,
          levelId_1: level === 1 ? categoryId : parentId,
          levelText_2: level > 1 ? categoryName : null,
          levelId_2: level > 1 ? categoryId : null,
          levelText_3: null,
          levelId_3: null,
          levelText_4: null,
          levelId_4: null,
        })
      }
    }

    Object.entries(v2Categories).forEach(([categoryName, categoryData]: [string, any]) => {
      processCategory(categoryData)
    })

    return categories
  }

  const convertV3ToV1Format = (v3Categories: any): Category[] => {
    const categories: Category[] = []

    const processCategory = (
      categoryData: any,
      parentText: string | null = null,
      parentId: string | null = null,
      level = 1,
    ) => {
      const categoryText = categoryData.text
      const categoryId =
        Object.keys(v3Categories).find((key) => v3Categories[key] === categoryData) ||
        Object.keys(categoryData).find((key) => key !== "text" && key !== "children") ||
        null

      if (categoryData.children && typeof categoryData.children === "object") {
        // Has children, process them
        Object.entries(categoryData.children).forEach(([childId, childData]: [string, any]) => {
          if (childData.children && Object.keys(childData.children).length > 0) {
            // Child has children, process recursively
            processCategory(childData, categoryText, categoryId, level + 1)
          } else {
            // Leaf node, create category entry
            categories.push({
              level: level + 1,
              levelText_1: level === 1 ? categoryText : parentText,
              levelId_1: level === 1 ? categoryId : parentId,
              levelText_2: level === 1 ? childData.text : categoryText,
              levelId_2: level === 1 ? childId : categoryId,
              levelText_3: level > 1 ? childData.text : null,
              levelId_3: level > 1 ? childId : null,
              levelText_4: null,
              levelId_4: null,
            })
          }
        })
      } else {
        // Leaf node
        categories.push({
          level: level,
          levelText_1: level === 1 ? categoryText : parentText,
          levelId_1: level === 1 ? categoryId : parentId,
          levelText_2: level > 1 ? categoryText : null,
          levelId_2: level > 1 ? categoryId : null,
          levelText_3: null,
          levelId_3: null,
          levelText_4: null,
          levelId_4: null,
        })
      }
    }

    Object.entries(v3Categories).forEach(([categoryId, categoryData]: [string, any]) => {
      processCategory(categoryData)
    })

    return categories
  }

  const filterCategories = () => {
    let filtered = categories

    if (searchTerm) {
      filtered = categories.filter((category) => {
        const searchText = [category.levelText_1, category.levelText_2, category.levelText_3, category.levelText_4]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return searchText.includes(searchTerm.toLowerCase())
      })
    }

    // Group filtered categories by main category
    const grouped = filtered.reduce(
      (acc, category) => {
        const mainCategory = category.levelText_1 || "Autres"
        if (!acc[mainCategory]) {
          acc[mainCategory] = []
        }
        acc[mainCategory].push(category)
        return acc
      },
      {} as Record<string, Category[]>,
    )

    setFilteredCategories(grouped)
  }

  const getDeepestLevelId = (category: Category): string | null => {
    if (category.levelId_4) return category.levelId_4
    if (category.levelId_3) return category.levelId_3
    if (category.levelId_2) return category.levelId_2
    return category.levelId_1
  }

  const getDeepestLevelText = (category: Category): string => {
    if (category.levelText_4) return category.levelText_4
    if (category.levelText_3) return category.levelText_3
    if (category.levelText_2) return category.levelText_2
    return category.levelText_1 || "Catégorie"
  }

  const getCategoryPath = (category: Category): string => {
    const parts = []
    if (category.levelText_1) parts.push(category.levelText_1)
    if (category.levelText_2) parts.push(category.levelText_2)
    if (category.levelText_3) parts.push(category.levelText_3)
    if (category.levelText_4) parts.push(category.levelText_4)
    return parts.join(" > ")
  }

  const handleCategoryClick = (category: Category) => {
    const deepestId = getDeepestLevelId(category)
    const deepestText = getDeepestLevelText(category)

    if (deepestId) {
      setSelectedCategory(deepestId)
      onCategorySelect(deepestId, deepestText)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Catégories de Pièces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CategorySkeleton key={i} />
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
            <Package className="h-5 w-5" />
            Catégories de Pièces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadCategories}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalCategories = Object.values(filteredCategories).reduce((sum, cats) => sum + cats.length, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Package className="h-5 w-5" />
          Catégories de Pièces
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {totalCategories} catégorie{totalCategories > 1 ? "s" : ""} disponible{totalCategories > 1 ? "s" : ""}
          {totalCategories !== categories.length && ` (${categories.length} au total)`}
        </p>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(filteredCategories).map(([mainCategory, categoryList]) => (
            <div key={mainCategory} className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2 flex items-center justify-between">
                <span>{mainCategory}</span>
                <Badge variant="outline" className="text-xs">
                  {categoryList.length}
                </Badge>
              </h3>
              <div className="grid gap-2 sm:grid-cols-1 lg:grid-cols-2">
                {categoryList.map((category, index) => {
                  const deepestId = getDeepestLevelId(category)
                  const deepestText = getDeepestLevelText(category)
                  const categoryPath = getCategoryPath(category)
                  const isSelected = selectedCategory === deepestId

                  return (
                    <Button
                      key={`${mainCategory}-${index}`}
                      variant={isSelected ? "default" : "ghost"}
                      className="justify-start h-auto p-3 text-left transition-all duration-200 hover:scale-[1.01]"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{deepestText}</div>
                          {categoryPath !== deepestText && (
                            <div className="text-xs text-muted-foreground truncate mt-1">{categoryPath}</div>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Niveau {category.level}
                        </Badge>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {totalCategories === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {searchTerm ? "Aucune catégorie trouvée" : "Aucune catégorie disponible"}
            </p>
            <p className="text-sm">
              {searchTerm
                ? "Essayez de modifier votre recherche"
                : "Ce véhicule n'a pas de catégories de pièces disponibles"}
            </p>
            {searchTerm && (
              <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={() => setSearchTerm("")}>
                Effacer la recherche
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
