// Countries API service for shipment destinations

export interface Country {
  name: string;
  code: string;
  flag: string;
  region: string;
  subregion: string;
  capital?: string;
  population?: number;
  currencies?: Record<string, { name: string; symbol: string }>;
}

// Cache for countries data
let countriesCache: Country[] | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let cacheTimestamp: number | null = null;

/**
 * Fetch countries from REST Countries API
 * Uses caching to avoid repeated API calls
 */
export async function fetchCountries(): Promise<Country[]> {
  // Check if we have valid cached data
  if (
    countriesCache && 
    cacheTimestamp && 
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return countriesCache;
  }

  try {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,cca2,flag,region,subregion,capital,population,currencies'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to our interface
    const countries: Country[] = data
      .map((country: any) => ({
        name: country.name?.common || 'Unknown',
        code: country.cca2 || '',
        flag: country.flag || '',
        region: country.region || '',
        subregion: country.subregion || '',
        capital: country.capital?.[0] || undefined,
        population: country.population || undefined,
        currencies: country.currencies || undefined,
      }))
      .filter((country: Country) => country.name && country.code)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

    // Cache the results
    countriesCache = countries;
    cacheTimestamp = Date.now();

    return countries;
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    
    // Return fallback list of major countries if API fails
    return getFallbackCountries();
  }
}

/**
 * Get countries by region
 */
export async function getCountriesByRegion(region: string): Promise<Country[]> {
  const countries = await fetchCountries();
  return countries.filter(country => 
    country.region.toLowerCase() === region.toLowerCase()
  );
}

/**
 * Search countries by name
 */
export async function searchCountries(query: string): Promise<Country[]> {
  const countries = await fetchCountries();
  const searchTerm = query.toLowerCase();
  
  return countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get popular shipping destinations
 */
export async function getPopularShippingDestinations(): Promise<Country[]> {
  const countries = await fetchCountries();
  
  // List of popular shipping destinations for agricultural products
  const popularCodes = [
    'US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT',
    'CA', 'AU', 'JP', 'KR', 'SG', 'HK', 'AE', 'SA', 'QA', 'KW',
    'BR', 'MX', 'AR', 'CL', 'PE', 'CO', 'ZA', 'EG', 'MA', 'NG',
    'CN', 'TH', 'VN', 'MY', 'ID', 'PH', 'BD', 'PK', 'LK', 'NP'
  ];

  return countries.filter(country => 
    popularCodes.includes(country.code)
  );
}

/**
 * Fallback countries list if API fails
 */
function getFallbackCountries(): Country[] {
  return [
    { name: 'United States', code: 'US', flag: '🇺🇸', region: 'Americas', subregion: 'North America' },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe', subregion: 'Northern Europe' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe', subregion: 'Western Europe' },
    { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe', subregion: 'Western Europe' },
    { name: 'Italy', code: 'IT', flag: '🇮🇹', region: 'Europe', subregion: 'Southern Europe' },
    { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe', subregion: 'Southern Europe' },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱', region: 'Europe', subregion: 'Western Europe' },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'Americas', subregion: 'North America' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania', subregion: 'Australia and New Zealand' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia', subregion: 'Eastern Asia' },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷', region: 'Asia', subregion: 'Eastern Asia' },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'Asia', subregion: 'South-Eastern Asia' },
    { name: 'Hong Kong', code: 'HK', flag: '🇭🇰', region: 'Asia', subregion: 'Eastern Asia' },
    { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', region: 'Asia', subregion: 'Western Asia' },
    { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Asia', subregion: 'Western Asia' },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷', region: 'Americas', subregion: 'South America' },
    { name: 'Mexico', code: 'MX', flag: '🇲🇽', region: 'Americas', subregion: 'North America' },
    { name: 'China', code: 'CN', flag: '🇨🇳', region: 'Asia', subregion: 'Eastern Asia' },
    { name: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'Asia', subregion: 'South-Eastern Asia' },
    { name: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'Asia', subregion: 'South-Eastern Asia' },
    { name: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Asia', subregion: 'South-Eastern Asia' },
    { name: 'Vietnam', code: 'VN', flag: '🇻🇳', region: 'Asia', subregion: 'South-Eastern Asia' },
    { name: 'Philippines', code: 'PH', flag: '🇵🇭', region: 'Asia', subregion: 'South-Eastern Asia' },
    { name: 'South Africa', code: 'ZA', flag: '🇿🇦', region: 'Africa', subregion: 'Southern Africa' },
    { name: 'Egypt', code: 'EG', flag: '🇪🇬', region: 'Africa', subregion: 'Northern Africa' },
    { name: 'Nigeria', code: 'NG', flag: '🇳🇬', region: 'Africa', subregion: 'Western Africa' },
    { name: 'Bangladesh', code: 'BD', flag: '🇧🇩', region: 'Asia', subregion: 'Southern Asia' },
    { name: 'Pakistan', code: 'PK', flag: '🇵🇰', region: 'Asia', subregion: 'Southern Asia' },
    { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', region: 'Asia', subregion: 'Southern Asia' },
    { name: 'Nepal', code: 'NP', flag: '🇳🇵', region: 'Asia', subregion: 'Southern Asia' },
  ].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get country by code
 */
export async function getCountryByCode(code: string): Promise<Country | null> {
  const countries = await fetchCountries();
  return countries.find(country => 
    country.code.toLowerCase() === code.toLowerCase()
  ) || null;
}

/**
 * Format country for display
 */
export function formatCountryDisplay(country: Country): string {
  return `${country.flag} ${country.name}`;
}

/**
 * Get shipping regions for grouping
 */
export function getShippingRegions(): string[] {
  return [
    'Europe',
    'North America', 
    'Asia',
    'Middle East',
    'Africa',
    'South America',
    'Oceania'
  ];
}