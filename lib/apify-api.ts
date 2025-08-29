export interface ApiResponse<T> {
  data: T
  error?: string
}

async function callApifyActor<T>(input: any): Promise<ApiResponse<T>> {
  try {
    console.log("[v0] Starting Apify actor with input:", input)

    const runResponse = await fetch('/api/apify', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })

    console.log("[v0] Run response status:", runResponse.status)

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`Failed to run actor: ${runResponse.status} ${runResponse.statusText}`)
    }

    const responseText = await runResponse.text()
    console.log("[v0] Raw response text length:", responseText.length)

    if (!responseText || responseText.trim() === "") {
      console.log("[v0] Empty response received")
      return { data: [] as T }
    }

    let results
    try {
      results = JSON.parse(responseText)
      console.log("[v0] Parsed results:", results)
    } catch (parseError) {
      console.error("[v0] JSON Parse Error:", parseError)
      console.error("[v0] Response text:", responseText)
      throw new Error(`Invalid JSON response: ${parseError}`)
    }

    return { data: results }
  } catch (error) {
    console.error("[v0] Apify API Error:", error)
    return {
      data: [] as T,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// API Functions for each endpoint
export async function getManufacturers() {
  return callApifyActor({
    selectPageType: "get-manufacturers-by-type-id-lang-id-country-id",
    typeId: 1,
    langId: 6,
    countryId: 6,
  })
}

export async function getModels(manufacturerId: number) {
  return callApifyActor({
    selectPageType: "get-models",
    typeId: 1,
    langId: 6,
    countryId: 6,
    manufacturerId,
  })
}

export async function getVehicles(manufacturerId: number, modelId: number) {
  return callApifyActor({
    selectPageType: "get-all-vehicle-engine-types",
    typeId: 1,
    langId: 6,
    countryId: 6,
    manufacturerId,
    modelId,
  })
}

export async function getCategories(manufacturerId: number, vehicleId: number, version: "v1" | "v2" | "v3" = "v1") {
  return callApifyActor({
    selectPageType: `get-categories-${version}`,
    typeId: 1,
    langId: 6,
    countryId: 6,
    manufacturerId,
    vehicleId,
  })
}

export async function getArticles(manufacturerId: number, vehicleId: number, productGroupId: number) {
  return callApifyActor({
    selectPageType: "get-article-list",
    typeId: 1,
    langId: 6,
    countryId: 6,
    manufacturerId,
    vehicleId,
    productGroupId,
  })
}

export async function getArticleDetails(articleId: number) {
  return callApifyActor({
    selectPageType: "get-article-details-by-article-id",
    langId: 6,
    countryId: 6,
    articleId,
  })
}

export async function searchArticlesByNumber(articleNo: string) {
  return callApifyActor({
    selectPageType: "search-articles-by-article-number",
    articleNo,
    langId: 4,
    countryId: 62,
  })
}

export async function searchArticlesByNumberAndSupplier(articleNo: string, supplierId: number) {
  return callApifyActor({
    selectPageType: "search-articles-by-article-number-and-supplier",
    articleNo,
    supplierId,
    langId: 4,
    countryId: 62,
  })
}
