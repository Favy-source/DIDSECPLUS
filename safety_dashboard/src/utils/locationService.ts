// Location API services for Nigerian data
import axios from 'axios';

// Base URLs for different location APIs
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

// Interface definitions
export interface LocationData {
  name: string;
  state: string;
  lga?: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'state' | 'lga' | 'city' | 'town';
  population?: number;
  area?: number;
  adminLevel?: number;
}

export interface NigerianState {
  name: string;
  capital: string;
  coordinates: [number, number];
  lgas: string[];
  population: number;
  area: number; // in km²
  geopoliticalZone: string;
  createdDate: string;
}

export interface NigerianLGA {
  name: string;
  state: string;
  coordinates: [number, number];
  population?: number;
  area?: number;
  wards?: string[];
  headquarters?: string;
}

// OpenStreetMap/Nominatim API response interface
interface NominatimResponse {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address: NominatimAddress;
  extratags?: {
    population?: string;
    admin_level?: string;
  };
}

interface NominatimAddress {
  state?: string;
  region?: string;
  province?: string;
  county?: string;
  local_government?: string;
  district?: string;
}

// Nigerian States data (official data)
export const nigerianStatesData: NigerianState[] = [
  {
    name: "Lagos",
    capital: "Ikeja",
    coordinates: [3.3792, 6.5244],
    population: 15946991,
    area: 3345,
    geopoliticalZone: "South West",
    createdDate: "1967-05-27",
    lgas: [
      "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
      "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
      "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
      "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
    ]
  },
  {
    name: "Federal Capital Territory",
    capital: "Abuja",
    coordinates: [7.3986, 9.0765],
    population: 3564126,
    area: 7315,
    geopoliticalZone: "North Central",
    createdDate: "1976-02-03",
    lgas: [
      "Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"
    ]
  },
  {
    name: "Kano",
    capital: "Kano",
    coordinates: [8.5167, 12.0000],
    population: 13076892,
    area: 20131,
    geopoliticalZone: "North West",
    createdDate: "1967-05-27",
    lgas: [
      "Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure",
      "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa",
      "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa",
      "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya",
      "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda",
      "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono",
      "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada",
      "Ungogo", "Warawa", "Wudil"
    ]
  },
  {
    name: "Rivers",
    capital: "Port Harcourt",
    coordinates: [6.9326, 4.8156],
    population: 7303924,
    area: 11077,
    geopoliticalZone: "South South",
    createdDate: "1967-05-27",
    lgas: [
      "Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni",
      "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche",
      "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni",
      "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo",
      "Port Harcourt", "Tai"
    ]
  },
  {
    name: "Kaduna",
    capital: "Kaduna",
    coordinates: [7.4406, 10.5264],
    population: 8252366,
    area: 46053,
    geopoliticalZone: "North West",
    createdDate: "1967-05-27",
    lgas: [
      "Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba",
      "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko",
      "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi",
      "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"
    ]
  }
];

class LocationService {
  private static instance: LocationService;
  private cache: Map<string, LocationData[] | NigerianState[] | NigerianLGA[]> = new Map();

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Search for locations in Nigeria using Nominatim
  async searchLocation(query: string, limit: number = 10): Promise<LocationData[]> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0 && 'coordinates' in cached[0]) {
      return cached as LocationData[];
    }

    try {
      const response = await axios.get(NOMINATIM_API, {
        params: {
          q: `${query}, Nigeria`,
          format: 'json',
          limit,
          countrycodes: 'ng',
          addressdetails: 1,
          extratags: 1
        },
        timeout: 10000
      });

      const locations: LocationData[] = response.data.map((item: NominatimResponse) => ({
        name: item.display_name.split(',')[0],
        state: this.extractState(item.address),
        lga: this.extractLGA(item.address),
        country: 'Nigeria',
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
        type: this.determineType(item.type, item.class),
        population: item.extratags?.population ? parseInt(item.extratags.population) : undefined,
        adminLevel: item.extratags?.admin_level ? parseInt(item.extratags.admin_level) : undefined
      }));

      this.cache.set(cacheKey, locations);
      return locations;
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }

  // Get detailed information about a specific location
  async getLocationDetails(name: string, state?: string): Promise<LocationData | null> {
    const searchQuery = state ? `${name}, ${state}` : name;
    const locations = await this.searchLocation(searchQuery, 1);
    return locations.length > 0 ? locations[0] : null;
  }

  // Get Nigerian states with real coordinates
  async getNigerianStates(): Promise<NigerianState[]> {
    const cacheKey = 'nigerian_states';
    const cached = this.cache.get(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0 && 'geopoliticalZone' in cached[0]) {
      return cached as NigerianState[];
    }

    // Update coordinates with real data where needed
    const statesWithCoordinates: NigerianState[] = [];
    
    for (const state of nigerianStatesData) {
      try {
        const locationData = await this.getLocationDetails(state.capital, state.name);
        statesWithCoordinates.push({
          ...state,
          coordinates: locationData?.coordinates || state.coordinates
        });
      } catch (error) {
        console.error(`Error getting coordinates for ${state.name}:`, error);
        statesWithCoordinates.push(state);
      }
    }

    this.cache.set(cacheKey, statesWithCoordinates);
    return statesWithCoordinates;
  }

  // Get LGAs for a specific state with coordinates
  async getLGAsForState(stateName: string): Promise<NigerianLGA[]> {
    const cacheKey = `lgas_${stateName}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0 && 'state' in cached[0] && !('geopoliticalZone' in cached[0])) {
      return cached as NigerianLGA[];
    }

    const state = nigerianStatesData.find(s => s.name === stateName);
    if (!state) return [];

    const lgasWithCoordinates: NigerianLGA[] = [];

    for (const lgaName of state.lgas) {
      try {
        const locationData = await this.getLocationDetails(lgaName, stateName);
        lgasWithCoordinates.push({
          name: lgaName,
          state: stateName,
          coordinates: locationData?.coordinates || [0, 0],
          population: locationData?.population,
          area: locationData?.area,
          headquarters: lgaName // Usually LGA name is the headquarters
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error getting coordinates for ${lgaName}:`, error);
        lgasWithCoordinates.push({
          name: lgaName,
          state: stateName,
          coordinates: [0, 0]
        });
      }
    }

    this.cache.set(cacheKey, lgasWithCoordinates);
    return lgasWithCoordinates;
  }

  // Get nearby locations within a radius
  async getNearbyLocations(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50
  ): Promise<LocationData[]> {
    try {
      const response = await axios.get(NOMINATIM_API, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          limit: 20,
          countrycodes: 'ng',
          addressdetails: 1
        },
        timeout: 10000
      });

      return response.data.map((item: NominatimResponse) => ({
        name: item.display_name.split(',')[0],
        state: this.extractState(item.address),
        country: 'Nigeria',
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
        type: this.determineType(item.type, item.class)
      }));
    } catch (error) {
      console.error('Error getting nearby locations:', error);
      return [];
    }
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address: string): Promise<LocationData | null> {
    try {
      const response = await axios.get(NOMINATIM_API, {
        params: {
          q: `${address}, Nigeria`,
          format: 'json',
          limit: 1,
          countrycodes: 'ng',
          addressdetails: 1
        },
        timeout: 10000
      });

      if (response.data.length === 0) return null;

      const item = response.data[0];
      return {
        name: item.display_name.split(',')[0],
        state: this.extractState(item.address),
        country: 'Nigeria',
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
        type: this.determineType(item.type, item.class)
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to get address
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData | null> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          countrycodes: 'ng',
          addressdetails: 1
        },
        timeout: 10000
      });

      if (!response.data) return null;

      const item = response.data;
      return {
        name: item.display_name.split(',')[0],
        state: this.extractState(item.address),
        country: 'Nigeria',
        coordinates: [longitude, latitude],
        type: this.determineType(item.type, item.class)
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  private extractState(address: NominatimAddress): string {
    return address?.state || address?.region || address?.province || 'Unknown';
  }

  private extractLGA(address: NominatimAddress): string | undefined {
    return address?.county || address?.local_government || address?.district;
  }

  private determineType(type: string, className: string): 'state' | 'lga' | 'city' | 'town' {
    if (className === 'boundary' && type === 'administrative') {
      return 'state';
    }
    if (className === 'place') {
      if (type === 'city') return 'city';
      if (type === 'town') return 'town';
      if (type === 'village') return 'town';
    }
    return 'town';
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const locationService = LocationService.getInstance();

// Utility functions
export const formatCoordinates = (coordinates: [number, number]): string => {
  const [lng, lat] = coordinates;
  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
};

export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in kilometers
};
