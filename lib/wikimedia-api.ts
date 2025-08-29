interface WikimediaSearchResult {
  title: string
  url: string
  descriptionurl: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
}

interface WikimediaApiResponse {
  query?: {
    pages?: {
      [key: string]: {
        title: string
        imageinfo?: Array<{
          url: string
          descriptionurl: string
          thumburl?: string
          thumbwidth?: number
          thumbheight?: number
        }>
      }
    }
    search?: Array<{
      title: string
      pageid: number
    }>
  }
}

/**
 * Search for car images on Wikimedia Commons
 * @param brand - Car brand (e.g., "Renault")
 * @param model - Car model (e.g., "Clio")
 * @param generation - Optional generation info
 * @returns Promise with image URL and metadata
 */
export async function searchCarImages(
  brand: string, 
  model: string, 
  generation?: string
): Promise<WikimediaSearchResult | null> {
  try {
    // Construct search queries with fallbacks
    const searchQueries = [
      `${brand} ${model}${generation ? ` ${generation}` : ''}`,
      `${brand} ${model}`,
      brand
    ]

    for (const searchQuery of searchQueries) {
      console.log(`Searching Wikimedia for: ${searchQuery}`)
      
      // First, search for relevant pages
      const searchUrl = new URL('https://commons.wikimedia.org/w/api.php')
      searchUrl.searchParams.set('action', 'query')
      searchUrl.searchParams.set('list', 'search')
      searchUrl.searchParams.set('srsearch', `${searchQuery} filetype:bitmap`)
      searchUrl.searchParams.set('srnamespace', '6') // File namespace
      searchUrl.searchParams.set('srlimit', '10')
      searchUrl.searchParams.set('format', 'json')
      searchUrl.searchParams.set('origin', '*') // For CORS

      const searchResponse = await fetch(searchUrl.toString())
      if (!searchResponse.ok) continue

      const searchData: WikimediaApiResponse = await searchResponse.json()
      const pages = searchData.query?.search

      if (!pages || pages.length === 0) continue

      // Get image info for the first relevant result
      for (const page of pages) {
        if (!isCarImage(page.title, brand, model)) continue

        const imageUrl = new URL('https://commons.wikimedia.org/w/api.php')
        imageUrl.searchParams.set('action', 'query')
        imageUrl.searchParams.set('titles', page.title)
        imageUrl.searchParams.set('prop', 'imageinfo')
        imageUrl.searchParams.set('iiprop', 'url|thumburl')
        imageUrl.searchParams.set('iiurlwidth', '400')
        imageUrl.searchParams.set('format', 'json')
        imageUrl.searchParams.set('origin', '*')

        const imageResponse = await fetch(imageUrl.toString())
        if (!imageResponse.ok) continue

        const imageData: WikimediaApiResponse = await imageResponse.json()
        const pageData = Object.values(imageData.query?.pages || {})[0]

        if (pageData?.imageinfo && pageData.imageinfo.length > 0) {
          const imageInfo = pageData.imageinfo[0]
          
          return {
            title: pageData.title,
            url: imageInfo.thumburl || imageInfo.url,
            descriptionurl: imageInfo.descriptionurl,
            thumbnail: imageInfo.thumburl ? {
              source: imageInfo.thumburl,
              width: imageInfo.thumbwidth || 400,
              height: imageInfo.thumbheight || 300
            } : undefined
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching car image from Wikimedia:', error)
    return null
  }
}

/**
 * Check if the image title is relevant to the car model
 */
function isCarImage(title: string, brand: string, model: string): boolean {
  const titleLower = title.toLowerCase()
  const brandLower = brand.toLowerCase()
  const modelLower = model.toLowerCase()

  // Must contain the brand or model
  const containsRelevantTerms = titleLower.includes(brandLower) || titleLower.includes(modelLower)
  
  // Should be an image file
  const isImageFile = /\.(jpg|jpeg|png|webp|svg)$/i.test(title)
  
  // Exclude unwanted content
  const excludeTerms = ['logo', 'emblem', 'badge', 'interior', 'engine', 'wheel', 'part']
  const hasExcludedTerms = excludeTerms.some(term => titleLower.includes(term))
  
  return containsRelevantTerms && isImageFile && !hasExcludedTerms
}

/**
 * Get alternative search terms for better image matching
 */
export function getCarSearchVariants(brand: string, model: string): string[] {
  const variants = [
    `${brand} ${model}`,
    `${brand}_${model}`,
    model,
    brand
  ]

  // Add common generation/version patterns
  const commonSuffixes = ['II', 'III', 'IV', 'V', '2', '3', '4', '5']
  commonSuffixes.forEach(suffix => {
    variants.push(`${brand} ${model} ${suffix}`)
    variants.push(`${model} ${suffix}`)
  })

  return [...new Set(variants)] // Remove duplicates
}
