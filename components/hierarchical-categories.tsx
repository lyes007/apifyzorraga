"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ChevronRight, 
  ChevronLeft, 
  Package, 
  Search, 
  Home, 
  Grid3x3,
  Layers,
  ArrowRight,
  ImageIcon
} from "lucide-react"
import { getCategories } from "@/lib/apify-api"

// Category image mapping function
const getCategoryImage = (categoryName: string): string | null => {
  // Normalize category name to match image file names
  const normalizedName = categoryName.trim()
  
  // Map of category names to image files
  const imageMap: Record<string, string> = {
    'Accessoires': '/categories/Accessoires.jpeg',
    'Alimentation carburant': '/categories/Alimentation carburant.jpg',
    'Allumage / préchauffage': '/categories/Allumage  préchauffage.jpeg',
    'Allumage préchauffage': '/categories/Allumage  préchauffage.jpeg',
    'Boîte de vitesses': '/categories/Boîte de vitesses.jpeg',
    'Carburation': '/categories/Carburation.jpeg',
    'Carrosserie': '/categories/Carrosserie.jpeg',
    'Chauffage / Ventilation': '/categories/Chauffage  Ventilation.jpeg',
    'Chauffage Ventilation': '/categories/Chauffage  Ventilation.jpeg',
    'Climatisation': '/categories/Climatisation.jpeg',
    'Commande à courroie': '/categories/Commande à courroie.jpeg',
    'Direction': '/categories/Direction.jpeg',
    'Dispositif d\'attelage accessoires': '/categories/Dispositif d\'attelage accessoires.jpeg',
    'Dispositif dattelage accessoires': '/categories/Dispositif d\'attelage accessoires.jpeg',
    'Dispositif de freinage': '/categories/Dispositif de freinage.jpeg',
    'Échappement': '/categories/Échappement.jpeg',
    'Embrayage / composants': '/categories/Embrayage  composants.jpeg',
    'Embrayage composants': '/categories/Embrayage  composants.jpeg',
    'Entraînement des essieux': '/categories/Entraînement des essieux.jpeg',
    'Entraînement des roues': '/categories/Entraînement des roues.jpeg',
    'Entraînement hybride électrique': '/categories/Entraînement hybride électrique.jpeg',
    'Équipement intérieur': '/categories/Équipement intérieur.jpeg',
    'Filtre': '/categories/Filtre.jpeg',
    'Moteur': '/categories/Moteur.jpeg',
    'Nettoyage des phares': '/categories/Nettoyage des phares.jpeg',
    'Nettoyage des vitres': '/categories/Nettoyage des vitres.jpeg',
    'Outils spéciaux': '/categories/Outils spéciaux.jpeg',
    'Pièces de maintenance': '/categories/Pièces de maintenance.jpeg',
    'Portes-bagages': '/categories/Portes-bagages.jpeg',
    'Prise de force': '/categories/Prise de force.jpeg',
    'Refroidissement': '/categories/Refroidissement.jpeg',
    'Roues / Pneus': '/categories/Roues Pneus.jpeg',
    'Roues Pneus': '/categories/Roues Pneus.jpeg',
    'Suspension / Amortissement': '/categories/Suspension Amortissement.jpeg',
    'Suspension Amortissement': '/categories/Suspension Amortissement.jpeg',
    'Suspension d\'essieu / Guidage des roues / Roues': '/categories/Suspension d\'essieu Guidage des roues Roues.jpeg',
    'Suspension dessieu Guidage des roues Roues': '/categories/Suspension d\'essieu Guidage des roues Roues.jpeg',
    'Système d\'information et de communication': '/categories/Système d\'information et de communication.jpeg',
    'Système dinformation et de communication': '/categories/Système d\'information et de communication.jpeg',
    'Système électrique': '/categories/Système électrique.jpeg',
    'Système pneumatique': '/categories/Système pneumatique.jpeg',
    'Systèmes de confort': '/categories/Systèmes de confort.jpeg',
    'Systèmes de sécurité': '/categories/Systèmes de sécurité.jpeg',
    'Verrouillage': '/categories/Verrouillage.jpeg'
  }
  
  // Try exact match first
  if (imageMap[normalizedName]) {
    return imageMap[normalizedName]
  }
  
  // Try with normalized name (remove/replace special characters)
  const normalizedForFile = normalizedName
    .replace(/\//g, ' ')  // Replace / with space
    .replace(/'/g, '')    // Remove apostrophes
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
  
  if (imageMap[normalizedForFile]) {
    return imageMap[normalizedForFile]
  }
  
  // Try fuzzy matching for common variations
  const fuzzyMatches: Record<string, string> = {
    'accessoire': 'Accessoires',
    'moteur': 'Moteur',
    'filtre': 'Filtre',
    'frein': 'Dispositif de freinage',
    'direction': 'Direction',
    'climatisation': 'Climatisation',
    'carrosserie': 'Carrosserie',
    'suspension': 'Suspension Amortissement',
    'embrayage': 'Embrayage composants',
    'échappement': 'Échappement',
    'allumage': 'Allumage préchauffage',
    'chauffage': 'Chauffage Ventilation',
    'roues': 'Roues Pneus',
    'pneus': 'Roues Pneus'
  }
  
  const lowerName = normalizedName.toLowerCase()
  for (const [key, category] of Object.entries(fuzzyMatches)) {
    if (lowerName.includes(key) && imageMap[category]) {
      return imageMap[category]
    }
  }
  
  return null
}

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

interface TreeNode {
  id: string
  text: string
  level: number
  children: TreeNode[]
  categoryCount: number
  isSelectable: boolean
  originalCategory?: Category
}

interface HierarchicalCategoriesProps {
  manufacturerId: number
  vehicleId: number
  onCategorySelect: (categoryId: string, categoryName: string) => void
}

export function HierarchicalCategories({ manufacturerId, vehicleId, onCategorySelect }: HierarchicalCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<TreeNode[]>([])
  const [currentPath, setCurrentPath] = useState<TreeNode[]>([])
  const [currentLevel, setCurrentLevel] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Category[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [manufacturerId, vehicleId])

  useEffect(() => {
    if (categories.length > 0) {
      buildCategoryTree()
    }
  }, [categories])

  useEffect(() => {
    handleSearch()
  }, [searchTerm, categories])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      let categoriesData: Category[] = []

      // Try different API versions
      for (const version of ["v1", "v2", "v3"]) {
        const response = await getCategories(manufacturerId, vehicleId, version)
        
        if (!response.error && (response.data as any)?.[0]?.categories) {
          if (version === "v1") {
            categoriesData = (response.data as any)[0].categories
          } else if (version === "v2") {
            categoriesData = convertV2ToV1Format((response.data as any)[0].categories)
          } else if (version === "v3") {
            categoriesData = convertV3ToV1Format((response.data as any)[0].categories)
          }
          
          if (categoriesData.length > 0) {
            console.log(`[Categories] Using ${version} format:`, categoriesData.length, "categories")
            break
          }
        }
      }

      if (categoriesData.length === 0) {
        setError("Aucune catégorie trouvée pour ce véhicule")
        return
      }

      setCategories(categoriesData)
    } catch (err) {
      setError("Erreur lors du chargement des catégories")
      console.error("Error loading categories:", err)
    } finally {
      setLoading(false)
    }
  }

  // Convert functions from original component
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
        Object.entries(categoryData.children).forEach(([childName, childData]: [string, any]) => {
          if (childData.children && Object.keys(childData.children).length > 0) {
            processCategory(childData, categoryName, categoryId, level + 1)
          } else {
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
        Object.entries(categoryData.children).forEach(([childId, childData]: [string, any]) => {
          if (childData.children && Object.keys(childData.children).length > 0) {
            processCategory(childData, categoryText, categoryId, level + 1)
          } else {
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

  const buildCategoryTree = () => {
    // Create a flat map of all nodes first
    const allNodes: { [key: string]: TreeNode } = {}
    
    // Create all nodes
    categories.forEach(category => {
      const levels = [
        { text: category.levelText_1, id: category.levelId_1 },
        { text: category.levelText_2, id: category.levelId_2 },
        { text: category.levelText_3, id: category.levelId_3 },
        { text: category.levelText_4, id: category.levelId_4 }
      ].filter(level => level.text && level.id)

      levels.forEach((level, index) => {
        const isLast = index === levels.length - 1
        const nodeId = level.id!
        
        if (!allNodes[nodeId]) {
          allNodes[nodeId] = {
            id: nodeId,
            text: level.text!,
            level: index + 1,
            children: [],
            categoryCount: 0,
            isSelectable: false,
            originalCategory: undefined
          }
        }
        
        // Update if this is a selectable leaf node
        if (isLast) {
          allNodes[nodeId].isSelectable = true
          allNodes[nodeId].originalCategory = category
        }
        
        allNodes[nodeId].categoryCount++
      })
    })

    // Build parent-child relationships
    categories.forEach(category => {
      const levels = [
        { text: category.levelText_1, id: category.levelId_1 },
        { text: category.levelText_2, id: category.levelId_2 },
        { text: category.levelText_3, id: category.levelId_3 },
        { text: category.levelText_4, id: category.levelId_4 }
      ].filter(level => level.text && level.id)

      for (let i = 0; i < levels.length - 1; i++) {
        const parentId = levels[i].id!
        const childId = levels[i + 1].id!
        
        const parent = allNodes[parentId]
        const child = allNodes[childId]
        
        if (parent && child) {
          // Add child if not already present
          if (!parent.children.find(c => c.id === childId)) {
            parent.children.push(child)
          }
        }
      }
    })

    // Find root nodes (level 1)
    const rootNodes = Object.values(allNodes).filter(node => node.level === 1)
    
    // Sort all nodes and their children
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.text.localeCompare(b.text))
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children)
        }
      })
    }
    
    sortNodes(rootNodes)
    setCategoryTree(rootNodes)
    setCurrentLevel(rootNodes)
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const filtered = categories.filter(category => {
      const searchText = [
        category.levelText_1,
        category.levelText_2, 
        category.levelText_3,
        category.levelText_4
      ].filter(Boolean).join(" ").toLowerCase()
      
      return searchText.includes(searchTerm.toLowerCase())
    })

    setSearchResults(filtered)
  }

  const navigateToCategory = (node: TreeNode) => {
    if (node.children.length > 0) {
      // Has children, navigate deeper
      setCurrentPath([...currentPath, node])
      setCurrentLevel(node.children)
    } else if (node.isSelectable && node.originalCategory) {
      // Leaf node, select it
      onCategorySelect(node.id, node.text)
    }
  }

  const navigateBack = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1)
      setCurrentPath(newPath)
      
      if (newPath.length === 0) {
        setCurrentLevel(categoryTree)
      } else {
        setCurrentLevel(newPath[newPath.length - 1].children)
      }
    }
  }

  const navigateToRoot = () => {
    setCurrentPath([])
    setCurrentLevel(categoryTree)
    setSearchTerm("")
    setIsSearching(false)
  }

  const getDeepestLevelId = (category: Category): string | null => {
    return category.levelId_4 || category.levelId_3 || category.levelId_2 || category.levelId_1
  }

  const getDeepestLevelText = (category: Category): string => {
    return category.levelText_4 || category.levelText_3 || category.levelText_2 || category.levelText_1 || "Catégorie"
  }

  const getCategoryPath = (category: Category): string => {
    const parts = [
      category.levelText_1,
      category.levelText_2,
      category.levelText_3,
      category.levelText_4
    ].filter(Boolean)
    return parts.join(" → ")
  }

  const handleSearchResultSelect = (category: Category) => {
    const id = getDeepestLevelId(category)
    const text = getDeepestLevelText(category)
    if (id) {
      onCategorySelect(id, text)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Catégories de Pièces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
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
          <CardTitle className="text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Catégories de Pièces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-destructive/50" />
            <p className="text-destructive mb-4 font-medium">{error}</p>
            <Button variant="outline" onClick={loadCategories}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/10 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-primary flex items-center gap-2 text-xl">
          <Package className="h-6 w-6" />
          Catégories de Pièces
        </CardTitle>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            placeholder="Rechercher dans toutes les catégories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 hover:border-primary/50 transition-colors"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm("")}
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {isSearching ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
              <Search className="h-4 w-4" />
              <span>{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}</span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto category-scroll">
              {searchResults.map((category, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="category-card w-full justify-start h-auto p-4 text-left hover:bg-primary/5 border border-border/50 hover:border-primary/30 transition-all slide-in-from-right"
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => handleSearchResultSelect(category)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">{getDeepestLevelText(category)}</div>
                      <div className="text-xs text-muted-foreground">{getCategoryPath(category)}</div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      Niveau {category.level}
                    </Badge>
                  </div>
                </Button>
              ))}
              
              {searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium mb-2">Aucun résultat trouvé</p>
                  <p className="text-sm">Essayez avec des termes différents</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentPath.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={navigateToRoot}
                  className="h-8 px-2 hover:bg-primary/10"
                >
                  <Home className="h-4 w-4" />
                </Button>
                {currentPath.map((node, index) => (
                  <div key={node.id} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-32">{node.text}</span>
                  </div>
                ))}
                {currentPath.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={navigateBack}
                    className="ml-auto h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Retour
                  </Button>
                )}
              </div>
            )}

            {currentPath.length === 0 ? (
                             <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 category-scroll max-h-[600px] overflow-y-auto p-1">
                {currentLevel.map((node, index) => {
                  const categoryImage = getCategoryImage(node.text)
                  return (
                    <Button
                      key={node.id}
                      variant="ghost"
                      className="category-card h-auto p-0 text-left justify-start border-2 border-border/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:scale-105 slide-in-from-bottom rounded-xl overflow-hidden group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigateToCategory(node)}
                    >
                                             <div className="flex flex-col w-full">
                         <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
                          {categoryImage ? (
                            <>
                              <img 
                                src={categoryImage} 
                                alt={node.text}
                                className="w-full h-full object-contain scale-75 sm:scale-90 transition-transform duration-300 group-hover:scale-90 sm:group-hover:scale-100"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const fallback = target.nextElementSibling as HTMLElement
                                  if (fallback) fallback.classList.remove('hidden')
                                }}
                              />
                                                             <div className="hidden w-full h-full flex items-center justify-center">
                                 <div className="p-2 sm:p-4 bg-primary/10 rounded-full">
                                   <Grid3x3 className="h-4 w-4 sm:h-8 sm:w-8 text-primary" />
                                 </div>
                               </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="p-2 sm:p-4 bg-primary/10 rounded-full">
                                <Grid3x3 className="h-4 w-4 sm:h-8 sm:w-8 text-primary" />
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">
                              {node.children.length}
                            </Badge>
                          </div>
                        </div>
                        
                                                 <div className="p-2 sm:p-3 flex-1">
                           <div className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                             {node.text}
                           </div>
                           <div className="flex items-center gap-1 text-xs text-muted-foreground">
                             <Layers className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                             <span className="truncate text-xs">
                               {node.children.length}
                             </span>
                           </div>
                         </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 category-scroll max-h-96 overflow-y-auto p-1">
                {currentLevel.map((node, index) => (
                  <Button
                    key={node.id}
                    variant="ghost"
                    className="category-card h-auto p-4 text-left justify-start border-2 border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md slide-in-from-bottom"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigateToCategory(node)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {node.children.length > 0 ? (
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Grid3x3 className="h-4 w-4 text-primary" />
                        </div>
                      ) : (
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-1 truncate">{node.text}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Layers className="h-3 w-3" />
                          {node.children.length > 0 ? (
                            <span>{node.children.length} sous-catégorie{node.children.length > 1 ? 's' : ''}</span>
                          ) : (
                            <span>Catégorie finale</span>
                          )}
                        </div>
                      </div>
                      
                      {node.children.length > 0 ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {currentLevel.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium mb-2">Aucune catégorie disponible</p>
                <p className="text-sm">Ce niveau ne contient pas de catégories</p>
                {currentPath.length > 0 && (
                  <Button variant="outline" className="mt-4" onClick={navigateBack}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Retour au niveau précédent
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
