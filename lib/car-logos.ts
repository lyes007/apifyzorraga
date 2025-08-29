/**
 * Car manufacturer logo mappings using optimized logos from GitHub
 * Source: https://github.com/filippofilip95/car-logos-dataset
 */

const GITHUB_LOGOS_BASE_URL = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

// Comprehensive mapping of TecDoc manufacturer names to logo filenames
const MANUFACTURER_LOGO_MAP: Record<string, string> = {
  // Popular brands
  "TOYOTA": "toyota.png",
  "VOLKSWAGEN": "volkswagen.png",
  "FORD": "ford.png",
  "HONDA": "honda.png",
  "CHEVROLET": "chevrolet.png",
  "NISSAN": "nissan.png",
  "BMW": "bmw.png",
  "MERCEDES-BENZ": "mercedes-benz.png",
  "AUDI": "audi.png",
  "HYUNDAI": "hyundai.png",
  "KIA": "kia.png",
  "MAZDA": "mazda.png",
  "SUBARU": "subaru.png",
  "LEXUS": "lexus.png",
  "VOLVO": "volvo.png",
  "JAGUAR": "jaguar.png",
  "PORSCHE": "porsche.png",
  "LAND ROVER": "land-rover.png",
  "JEEP": "jeep.png",
  "DODGE": "dodge.png",
  "CHRYSLER": "chrysler.png",
  "CADILLAC": "cadillac.png",
  "BUICK": "buick.png",
  "GMC": "gmc.png",
  "LINCOLN": "lincoln.png",
  "ACURA": "acura.png",
  "INFINITI": "infiniti.png",
  
  // European brands
  "RENAULT": "renault.png",
  "PEUGEOT": "peugeot.png",
  "CITROEN": "citroen.png",
  "FIAT": "fiat.png",
  "ALFA ROMEO": "alfa-romeo.png",
  "LANCIA": "lancia.png",
  "FERRARI": "ferrari.png",
  "LAMBORGHINI": "lamborghini.png",
  "MASERATI": "maserati.png",
  "BENTLEY": "bentley.png",
  "ROLLS-ROYCE": "rolls-royce.png",
  "ASTON MARTIN": "aston-martin.png",
  "MINI": "mini.png",
  "SMART": "smart.png",
  "OPEL": "opel.png",
  "VAUXHALL": "vauxhall.png",
  "SEAT": "seat.png",
  "SKODA": "skoda.png",
  "DACIA": "dacia.png",
  
  // Asian brands
  "MITSUBISHI": "mitsubishi.png",
  "SUZUKI": "suzuki.png",
  "ISUZU": "isuzu.png",
  "DAIHATSU": "daihatsu.png",
  "SSANGYONG": "ssangyong.png",
  "DAEWOO": "daewoo.png",
  "PROTON": "proton.png",
  "PERODUA": "perodua.png",
  "TATA": "tata.png",
  "MAHINDRA": "mahindra.png",
  
  // Luxury & Sports brands
  "MCLAREN": "mclaren.png",
  "LOTUS": "lotus.png",
  "MORGAN": "morgan.png",
  "CATERHAM": "caterham.png",
  "KOENIGSEGG": "koenigsegg.png",
  "PAGANI": "pagani.png",
  "BUGATTI": "bugatti.png",
  
  // Commercial vehicles
  "MERCEDES": "mercedes-benz.png", // Alternative naming
  "IVECO": "iveco.png",
  "MAN": "man.png",
  "SCANIA": "scania.png",
  "DAF": "daf.png",
  "VOLVO TRUCKS": "volvo.png",
  
  // Alternative namings and variations
  "VW": "volkswagen.png",
  "BENZ": "mercedes-benz.png",
  "MERC": "mercedes-benz.png",
  "BEEMER": "bmw.png",
  "RANGE ROVER": "land-rover.png",
  "ALFA": "alfa-romeo.png",
  "ROMEO": "alfa-romeo.png",
  
  // Electric & New brands
  "TESLA": "tesla.png",
  "RIVIAN": "rivian.png",
  "LUCID": "lucid.png",
  "POLESTAR": "polestar.png",
  
  // Chinese brands
  "BYD": "byd.png",
  "GEELY": "geely.png",
  "CHERY": "chery.png",
  "GAC": "gac.png",
  "GREATWALL": "greatwall.png",
  "HAVAL": "haval.png",
  "MG": "mg.png",
  
  // Additional mappings for common variations
  "LANDROVER": "land-rover.png",
  "LANDOVER": "land-rover.png",
  "MERCEDESBENZ": "mercedes-benz.png",
  "ALFAROMEO": "alfa-romeo.png",
  "ROLLSROYCE": "rolls-royce.png",
  "ASTONMARTIN": "aston-martin.png",
};

/**
 * Gets the logo URL for a manufacturer
 * @param manufacturerName - The name of the manufacturer
 * @returns The complete URL to the logo image or null if not found
 */
export function getManufacturerLogo(manufacturerName: string): string | null {
  if (!manufacturerName) return null;
  
  // Clean and normalize the manufacturer name
  const cleanName = manufacturerName
    .toUpperCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, ' '); // Normalize spaces
  
  // Try exact match first
  if (MANUFACTURER_LOGO_MAP[cleanName]) {
    return `${GITHUB_LOGOS_BASE_URL}/${MANUFACTURER_LOGO_MAP[cleanName]}`;
  }
  
  // Try partial matches for compound names
  const words = cleanName.split(' ');
  for (const word of words) {
    if (word.length > 2 && MANUFACTURER_LOGO_MAP[word]) {
      return `${GITHUB_LOGOS_BASE_URL}/${MANUFACTURER_LOGO_MAP[word]}`;
    }
  }
  
  // Try without spaces
  const noSpaceName = cleanName.replace(/\s/g, '');
  if (MANUFACTURER_LOGO_MAP[noSpaceName]) {
    return `${GITHUB_LOGOS_BASE_URL}/${MANUFACTURER_LOGO_MAP[noSpaceName]}`;
  }
  
  // Try with hyphens instead of spaces
  const hyphenatedName = cleanName.replace(/\s/g, '-');
  if (MANUFACTURER_LOGO_MAP[hyphenatedName]) {
    return `${GITHUB_LOGOS_BASE_URL}/${MANUFACTURER_LOGO_MAP[hyphenatedName]}`;
  }
  
  console.log(`Logo not found for manufacturer: "${manufacturerName}" (cleaned: "${cleanName}")`);
  return null;
}

/**
 * Gets all available manufacturer logos
 * @returns Array of all manufacturer names that have logos
 */
export function getAvailableManufacturers(): string[] {
  return Object.keys(MANUFACTURER_LOGO_MAP);
}

/**
 * Preload a manufacturer logo
 * @param manufacturerName - The name of the manufacturer
 */
export function preloadManufacturerLogo(manufacturerName: string): void {
  const logoUrl = getManufacturerLogo(manufacturerName);
  if (logoUrl) {
    const img = new Image();
    img.src = logoUrl;
  }
}
