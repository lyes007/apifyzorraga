"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Loader2, Car, Calendar, Fuel, Cog, CheckCircle } from "lucide-react"
import { getManufacturers, getModels, getVehicles } from "@/lib/apify-api"
import { searchCarImages } from "@/lib/wikimedia-api"
import { getManufacturerLogo } from "@/lib/car-logos"
import { HierarchicalCategories } from "./hierarchical-categories"
import { ModernArticlesList } from "./modern-articles-list"
import { ArticleDetails } from "./article-details"

interface Manufacturer {
  manufacturerId: number
  brand: string
}

interface Model {
  modelId: number
  modelName: string
  modelYearFrom: string
  modelYearTo: string | null
}

interface Vehicle {
  vehicleId: number
  manufacturerName: string
  modelName: string
  typeEngineName: string
  powerKw: string
  powerPs: string
  fuelType: string
  bodyType: string
  constructionIntervalStart: string
  constructionIntervalEnd: string | null
}

export function VehicleSelector() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [selectedBrand, setSelectedBrand] = useState<Manufacturer | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null)

  const [loadingManufacturers, setLoadingManufacturers] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [loadingCarImage, setLoadingCarImage] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [carImage, setCarImage] = useState<{
    url: string
    title: string
    descriptionurl: string
  } | null>(null)

  useEffect(() => {
    loadManufacturers()
  }, [])

  const loadManufacturers = async () => {
    try {
      setLoadingManufacturers(true)
      setError(null)
      const response = await getManufacturers()

      if (response.error) {
        setError(response.error)
        return
      }

      const manufacturersData = (response.data as any)?.[0]?.manufacturers || []
      console.log("[v0] Full response:", response)
      console.log("[v0] Response data:", response.data)
      console.log("[v0] Extracted manufacturers:", manufacturersData)
      setManufacturers(manufacturersData)
    } catch (err) {
      setError("Erreur lors du chargement des marques")
      console.error("Error loading manufacturers:", err)
    } finally {
      setLoadingManufacturers(false)
    }
  }

  const loadModels = async (manufacturerId: number) => {
    try {
      setLoadingModels(true)
      setError(null)
      const response = await getModels(manufacturerId)

      if (response.error) {
        setError(response.error)
        return
      }

      const modelsData = (response.data as any)?.[0]?.models || []
      console.log("[v0] Extracted models:", modelsData)
      setModels(modelsData)
    } catch (err) {
      setError("Erreur lors du chargement des modèles")
      console.error("Error loading models:", err)
    } finally {
      setLoadingModels(false)
    }
  }

  const loadVehicles = async (manufacturerId: number, modelId: number) => {
    try {
      setLoadingVehicles(true)
      setError(null)
      const response = await getVehicles(manufacturerId, modelId)

      if (response.error) {
        setError(response.error)
        return
      }

      const vehiclesData = (response.data as any)?.[0]?.modelTypes || []
      console.log("[v0] Extracted vehicles:", vehiclesData)
      setVehicles(vehiclesData)
    } catch (err) {
      setError("Erreur lors du chargement des motorisations")
      console.error("Error loading vehicles:", err)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleBrandChange = (brandId: string) => {
    const brand = manufacturers.find((m) => m.manufacturerId.toString() === brandId)
    if (brand) {
      setSelectedBrand(brand)
      setSelectedModel(null)
      setSelectedVehicle(null)
      setSelectedCategory(null)
      setSelectedArticle(null)
      setCarImage(null)
      setModels([])
      setVehicles([])
      loadModels(brand.manufacturerId)
    }
  }

  const handleModelChange = (modelId: string) => {
    const model = models.find((m) => m.modelId.toString() === modelId)
    if (model && selectedBrand) {
      setSelectedModel(model)
      setSelectedVehicle(null)
      setSelectedCategory(null)
      setSelectedArticle(null)
      setCarImage(null)
      setVehicles([])
      loadVehicles(selectedBrand.manufacturerId, model.modelId)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.vehicleId.toString() === vehicleId)
    if (vehicle) {
      setSelectedVehicle(vehicle)
      loadCarImage(vehicle.manufacturerName, vehicle.modelName)
    }
  }

  const loadCarImage = async (brand: string, model: string) => {
    try {
      setLoadingCarImage(true)
      setCarImage(null)
      
      console.log(`[CarImage] Searching for: ${brand} ${model}`)
      const imageResult = await searchCarImages(brand, model)
      
      if (imageResult) {
        console.log(`[CarImage] Found image:`, imageResult)
        setCarImage({
          url: imageResult.url,
          title: imageResult.title,
          descriptionurl: imageResult.descriptionurl
        })
      } else {
        console.log(`[CarImage] No image found for: ${brand} ${model}`)
      }
    } catch (error) {
      console.error(`[CarImage] Error loading image for ${brand} ${model}:`, error)
    } finally {
      setLoadingCarImage(false)
    }
  }

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName })
    setSelectedArticle(null)
  }

  const handleArticleSelect = (articleId: number) => {
    setSelectedArticle(articleId)
  }

  const handleBackFromArticle = () => {
    setSelectedArticle(null)
  }

  // Format data for SimpleSelect components
  const formatManufacturersOptions = () => {
    const options = manufacturers.map(manufacturer => ({
      value: manufacturer.manufacturerId.toString(),
      label: manufacturer.brand,
      logo: getManufacturerLogo(manufacturer.brand)
    }))
    console.log("Formatted manufacturers options:", options.length, options.slice(0, 5))
    return options
  }

  const formatModelsOptions = () => {
    return models.map(model => ({
      value: model.modelId.toString(),
      label: model.modelName,
      sublabel: `${model.modelYearFrom ? model.modelYearFrom.split("-")[0] : "N/A"} - ${model.modelYearTo ? model.modelYearTo.split("-")[0] : "présent"}`
    }))
  }

  const formatVehiclesOptions = () => {
    return vehicles.map(vehicle => ({
      value: vehicle.vehicleId.toString(),
      label: vehicle.typeEngineName,
      sublabel: `${vehicle.powerPs}ch (${vehicle.powerKw}kW) • ${vehicle.fuelType}`
    }))
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-8 animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-2 mb-4">
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Trouvez vos Pièces Auto
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Sélectionnez votre véhicule en 3 étapes simples pour découvrir toutes les pièces compatibles
        </p>
      </div>

      {/* Vehicle Selection Card */}
      <Card className="border-2 border-primary/10 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-in slide-in-from-bottom duration-700 delay-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Cog className="h-6 w-6 text-primary animate-pulse" />
            Configuration de votre véhicule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in duration-300">
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-8 px-4">
            <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-500 ${selectedBrand ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                selectedBrand ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
              }`}>
                {selectedBrand ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-xs sm:text-sm font-medium text-center">Marque</span>
            </div>
            <div className={`w-4 sm:w-8 h-1 rounded transition-all duration-500 ${selectedBrand ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-500 ${selectedModel ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                selectedModel ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
              }`}>
                {selectedModel ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-xs sm:text-sm font-medium text-center">Modèle</span>
            </div>
            <div className={`w-4 sm:w-8 h-1 rounded transition-all duration-500 ${selectedModel ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-500 ${selectedVehicle ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                selectedVehicle ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
              }`}>
                {selectedVehicle ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <span className="text-xs sm:text-sm font-medium text-center">Motorisation</span>
            </div>
          </div>

          {/* Selection Form */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brand Selection */}
            <div className="space-y-3 group">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Marque du véhicule
              </label>
              {loadingManufacturers ? (
                <div className="h-12 bg-gradient-to-r from-muted/50 to-muted rounded-lg flex items-center justify-center animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <SimpleSelect
                  options={formatManufacturersOptions()}
                  value={selectedBrand?.manufacturerId.toString() || ""}
                  onValueChange={handleBrandChange}
                  placeholder="Choisissez votre marque"
                  searchPlaceholder="Rechercher une marque..."
                  emptyMessage="Aucune marque trouvée"
                  className="group-hover:shadow-md transition-shadow duration-300"
                />
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-3 group">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Modèle et année
              </label>
              {loadingModels ? (
                <div className="h-12 bg-gradient-to-r from-muted/50 to-muted rounded-lg flex items-center justify-center animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <SimpleSelect
                  options={formatModelsOptions()}
                  value={selectedModel?.modelId.toString() || ""}
                  onValueChange={handleModelChange}
                  placeholder={selectedBrand ? "Sélectionnez le modèle" : "Choisissez d'abord une marque"}
                  searchPlaceholder="Rechercher un modèle..."
                  emptyMessage="Aucun modèle trouvé"
                  disabled={!selectedBrand || models.length === 0}
                  className="group-hover:shadow-md transition-shadow duration-300"
                />
              )}
            </div>

            {/* Engine Selection */}
            <div className="space-y-3 group">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Fuel className="h-4 w-4 text-primary" />
                Motorisation
              </label>
              {loadingVehicles ? (
                <div className="h-12 bg-gradient-to-r from-muted/50 to-muted rounded-lg flex items-center justify-center animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <SimpleSelect
                  options={formatVehiclesOptions()}
                  value={selectedVehicle?.vehicleId.toString() || ""}
                  onValueChange={handleVehicleChange}
                  placeholder={selectedModel ? "Sélectionnez la motorisation" : "Choisissez d'abord un modèle"}
                  searchPlaceholder="Rechercher une motorisation..."
                  emptyMessage="Aucune motorisation trouvée"
                  disabled={!selectedModel || vehicles.length === 0}
                  className="group-hover:shadow-md transition-shadow duration-300"
                />
              )}
            </div>
          </div>

          {/* Selected Vehicle Summary */}
          {selectedVehicle && (
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl animate-in slide-in-from-bottom duration-500 delay-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary">Véhicule sélectionné</h3>
              </div>
              
              {/* Vehicle Details and Image Layout */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Vehicle Information */}
                <div className="lg:col-span-2 grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="bg-background/60 p-3 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">MARQUE & MODÈLE</div>
                    <div className="font-semibold">{selectedVehicle.manufacturerName} {selectedVehicle.modelName}</div>
                  </div>
                  <div className="bg-background/60 p-3 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">MOTORISATION</div>
                    <div className="font-semibold">{selectedVehicle.typeEngineName}</div>
                  </div>
                  <div className="bg-background/60 p-3 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">PUISSANCE</div>
                    <div className="font-semibold">{selectedVehicle.powerPs}ch ({selectedVehicle.powerKw}kW)</div>
                  </div>
                  <div className="bg-background/60 p-3 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">CARBURANT</div>
                    <div className="font-semibold">{selectedVehicle.fuelType}</div>
                  </div>
                  <div className="bg-background/60 p-3 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">CARROSSERIE</div>
                    <div className="font-semibold">{selectedVehicle.bodyType}</div>
                  </div>
                  <div className="bg-background/60 p-3 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">PÉRIODE</div>
                    <div className="font-semibold">
                      {selectedVehicle.constructionIntervalStart
                        ? selectedVehicle.constructionIntervalStart.split("-")[0]
                        : "N/A"}{" "}
                      -{" "}
                      {selectedVehicle.constructionIntervalEnd
                        ? selectedVehicle.constructionIntervalEnd.split("-")[0]
                        : "présent"}
                    </div>
                  </div>
                </div>

                {/* Car Image */}
                <div className="lg:col-span-1">
                  <div className="bg-background/60 p-4 rounded-lg h-full">
                    <div className="text-xs font-medium text-muted-foreground mb-3 text-center">APERÇU DU VÉHICULE</div>
                    <div className="flex items-center justify-center h-48 lg:h-full min-h-[200px]">
                      {loadingCarImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Recherche d'image...</p>
                        </div>
                      ) : carImage ? (
                        <div className="group relative w-full h-full">
                          <img
                            src={carImage.url}
                            alt={`${selectedVehicle.manufacturerName} ${selectedVehicle.modelName}`}
                            className="w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                          <div className="hidden flex-col items-center gap-2 text-center">
                            <Car className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Image non disponible</p>
                          </div>
                          {carImage.descriptionurl && (
                            <a
                              href={carImage.descriptionurl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              Source: Wikimedia
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Car className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">Aucune image trouvée</p>
                          <p className="text-xs text-muted-foreground/70">
                            Pour {selectedVehicle.manufacturerName} {selectedVehicle.modelName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Section */}
      {selectedVehicle && selectedBrand && (
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <HierarchicalCategories
            manufacturerId={selectedBrand.manufacturerId}
            vehicleId={selectedVehicle.vehicleId}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      )}

      {/* Articles List */}
      {selectedCategory && selectedBrand && selectedVehicle && !selectedArticle && (
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-400">
          <ModernArticlesList
            manufacturerId={selectedBrand.manufacturerId}
            vehicleId={selectedVehicle.vehicleId}
            productGroupId={selectedCategory.id}
            categoryName={selectedCategory.name}
            onArticleSelect={handleArticleSelect}
          />
        </div>
      )}

      {/* Article Details */}
      {selectedArticle && (
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <ArticleDetails articleId={selectedArticle} onBack={handleBackFromArticle} />
        </div>
      )}
    </div>
  )
}
