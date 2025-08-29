"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { getManufacturers, getModels, getVehicles } from "@/lib/apify-api"
import { CategoriesDisplay } from "./categories-display"
import { ArticlesList } from "./articles-list"
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

  const [error, setError] = useState<string | null>(null)

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
      setVehicles([])
      loadVehicles(selectedBrand.manufacturerId, model.modelId)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.vehicleId.toString() === vehicleId)
    if (vehicle) {
      setSelectedVehicle(vehicle)
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Sélection du Véhicule</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marque</label>
              {loadingManufacturers ? (
                <div className="h-10 bg-muted rounded-md flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select onValueChange={handleBrandChange} value={selectedBrand?.manufacturerId.toString() || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.manufacturerId} value={manufacturer.manufacturerId.toString()}>
                        {manufacturer.brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modèle</label>
              {loadingModels ? (
                <div className="h-10 bg-muted rounded-md flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select
                  onValueChange={handleModelChange}
                  value={selectedModel?.modelId.toString() || ""}
                  disabled={!selectedBrand || models.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedBrand ? "Sélectionnez un modèle" : "Sélectionnez une marque"} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.modelId} value={model.modelId.toString()}>
                        {model.modelName} ({model.modelYearFrom ? model.modelYearFrom.split("-")[0] : "N/A"} -{" "}
                        {model.modelYearTo ? model.modelYearTo.split("-")[0] : "présent"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Motorisation</label>
              {loadingVehicles ? (
                <div className="h-10 bg-muted rounded-md flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select
                  onValueChange={handleVehicleChange}
                  value={selectedVehicle?.vehicleId.toString() || ""}
                  disabled={!selectedModel || vehicles.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={selectedModel ? "Sélectionnez une motorisation" : "Sélectionnez un modèle"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId.toString()}>
                        {vehicle.typeEngineName} - {vehicle.powerPs}ch ({vehicle.powerKw}
                        kW)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {selectedVehicle && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-md">
              <h3 className="font-medium text-primary mb-2">Véhicule sélectionné:</h3>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-medium">Marque:</span> {selectedVehicle.manufacturerName}
                </div>
                <div>
                  <span className="font-medium">Modèle:</span> {selectedVehicle.modelName}
                </div>
                <div>
                  <span className="font-medium">Motorisation:</span> {selectedVehicle.typeEngineName}
                </div>
                <div>
                  <span className="font-medium">Puissance:</span> {selectedVehicle.powerPs}ch ({selectedVehicle.powerKw}
                  kW)
                </div>
                <div>
                  <span className="font-medium">Carburant:</span> {selectedVehicle.fuelType}
                </div>
                <div>
                  <span className="font-medium">Carrosserie:</span> {selectedVehicle.bodyType}
                </div>
                <div>
                  <span className="font-medium">Période:</span>{" "}
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
          )}
        </CardContent>
      </Card>

      {selectedVehicle && selectedBrand && (
        <CategoriesDisplay
          manufacturerId={selectedBrand.manufacturerId}
          vehicleId={selectedVehicle.vehicleId}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {selectedCategory && selectedBrand && selectedVehicle && !selectedArticle && (
        <ArticlesList
          manufacturerId={selectedBrand.manufacturerId}
          vehicleId={selectedVehicle.vehicleId}
          productGroupId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onArticleSelect={handleArticleSelect}
        />
      )}

      {selectedArticle && <ArticleDetails articleId={selectedArticle} onBack={handleBackFromArticle} />}
    </div>
  )
}
