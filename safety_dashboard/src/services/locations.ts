// Nigerian States and Major Cities with their coordinates
export interface NigerianLocation {
  state: string;
  city: string;
  localGovernment: string;
  latitude: number;
  longitude: number;
  region: 'North Central' | 'North East' | 'North West' | 'South East' | 'South South' | 'South West';
}

export const NIGERIAN_LOCATIONS: NigerianLocation[] = [
  // Lagos State
  { state: 'Lagos', city: 'Victoria Island', localGovernment: 'Lagos Island', latitude: 6.4281, longitude: 3.4219, region: 'South West' },
  { state: 'Lagos', city: 'Ikeja', localGovernment: 'Ikeja', latitude: 6.5954, longitude: 3.3364, region: 'South West' },
  { state: 'Lagos', city: 'Surulere', localGovernment: 'Surulere', latitude: 6.4969, longitude: 3.3614, region: 'South West' },
  { state: 'Lagos', city: 'Lekki', localGovernment: 'Eti-Osa', latitude: 6.4474, longitude: 3.4547, region: 'South West' },
  { state: 'Lagos', city: 'Ikoyi', localGovernment: 'Lagos Island', latitude: 6.4550, longitude: 3.4353, region: 'South West' },
  { state: 'Lagos', city: 'Yaba', localGovernment: 'Lagos Mainland', latitude: 6.5158, longitude: 3.3712, region: 'South West' },

  // Abuja (FCT)
  { state: 'FCT', city: 'Garki', localGovernment: 'Abuja Municipal', latitude: 9.0479, longitude: 7.4951, region: 'North Central' },
  { state: 'FCT', city: 'Wuse', localGovernment: 'Abuja Municipal', latitude: 9.0579, longitude: 7.4951, region: 'North Central' },
  { state: 'FCT', city: 'Asokoro', localGovernment: 'Abuja Municipal', latitude: 9.0364, longitude: 7.5243, region: 'North Central' },
  { state: 'FCT', city: 'Maitama', localGovernment: 'Abuja Municipal', latitude: 9.0873, longitude: 7.4901, region: 'North Central' },
  { state: 'FCT', city: 'Gwarimpa', localGovernment: 'Abuja Municipal', latitude: 9.1222, longitude: 7.4145, region: 'North Central' },

  // Kano State
  { state: 'Kano', city: 'Kano City', localGovernment: 'Kano Municipal', latitude: 12.0022, longitude: 8.5919, region: 'North West' },
  { state: 'Kano', city: 'Fagge', localGovernment: 'Fagge', latitude: 12.0085, longitude: 8.5137, region: 'North West' },
  { state: 'Kano', city: 'Nassarawa', localGovernment: 'Nassarawa', latitude: 11.9781, longitude: 8.5449, region: 'North West' },

  // Rivers State
  { state: 'Rivers', city: 'Port Harcourt', localGovernment: 'Port Harcourt', latitude: 4.8156, longitude: 7.0498, region: 'South South' },
  { state: 'Rivers', city: 'Obio-Akpor', localGovernment: 'Obio-Akpor', latitude: 4.8396, longitude: 7.0123, region: 'South South' },
  { state: 'Rivers', city: 'Eleme', localGovernment: 'Eleme', latitude: 4.7892, longitude: 7.1575, region: 'South South' },

  // Oyo State
  { state: 'Oyo', city: 'Ibadan', localGovernment: 'Ibadan North', latitude: 7.3775, longitude: 3.9470, region: 'South West' },
  { state: 'Oyo', city: 'Ogbomoso', localGovernment: 'Ogbomoso North', latitude: 8.1335, longitude: 4.2670, region: 'South West' },

  // Kaduna State
  { state: 'Kaduna', city: 'Kaduna', localGovernment: 'Kaduna North', latitude: 10.5222, longitude: 7.4383, region: 'North West' },
  { state: 'Kaduna', city: 'Zaria', localGovernment: 'Zaria', latitude: 11.0804, longitude: 7.7076, region: 'North West' },

  // Anambra State
  { state: 'Anambra', city: 'Awka', localGovernment: 'Awka South', latitude: 6.2120, longitude: 7.0720, region: 'South East' },
  { state: 'Anambra', city: 'Onitsha', localGovernment: 'Onitsha North', latitude: 6.1736, longitude: 6.7882, region: 'South East' },
  { state: 'Anambra', city: 'Nnewi', localGovernment: 'Nnewi North', latitude: 6.0177, longitude: 6.9165, region: 'South East' },

  // Enugu State
  { state: 'Enugu', city: 'Enugu', localGovernment: 'Enugu North', latitude: 6.4403, longitude: 7.4966, region: 'South East' },
  { state: 'Enugu', city: 'Nsukka', localGovernment: 'Nsukka', latitude: 6.8568, longitude: 7.3958, region: 'South East' },

  // Imo State
  { state: 'Imo', city: 'Owerri', localGovernment: 'Owerri Municipal', latitude: 5.4840, longitude: 7.0351, region: 'South East' },

  // Abia State
  { state: 'Abia', city: 'Umuahia', localGovernment: 'Umuahia North', latitude: 5.5252, longitude: 7.4944, region: 'South East' },
  { state: 'Abia', city: 'Aba', localGovernment: 'Aba North', latitude: 5.1066, longitude: 7.3667, region: 'South East' },

  // Delta State
  { state: 'Delta', city: 'Asaba', localGovernment: 'Oshimili South', latitude: 6.1986, longitude: 6.7337, region: 'South South' },
  { state: 'Delta', city: 'Warri', localGovernment: 'Warri South', latitude: 5.5160, longitude: 5.7500, region: 'South South' },

  // Edo State
  { state: 'Edo', city: 'Benin City', localGovernment: 'Oredo', latitude: 6.3350, longitude: 5.6037, region: 'South South' },

  // Cross River State
  { state: 'Cross River', city: 'Calabar', localGovernment: 'Calabar Municipal', latitude: 4.9517, longitude: 8.3229, region: 'South South' },

  // Akwa Ibom State
  { state: 'Akwa Ibom', city: 'Uyo', localGovernment: 'Uyo', latitude: 5.0378, longitude: 7.9076, region: 'South South' },

  // Plateau State
  { state: 'Plateau', city: 'Jos', localGovernment: 'Jos North', latitude: 9.8965, longitude: 8.8583, region: 'North Central' },

  // Benue State
  { state: 'Benue', city: 'Makurdi', localGovernment: 'Makurdi', latitude: 7.7319, longitude: 8.5217, region: 'North Central' },

  // Niger State
  { state: 'Niger', city: 'Minna', localGovernment: 'Chanchaga', latitude: 9.6177, longitude: 6.5569, region: 'North Central' },

  // Kwara State
  { state: 'Kwara', city: 'Ilorin', localGovernment: 'Ilorin West', latitude: 8.5371, longitude: 4.5756, region: 'North Central' },

  // Osun State
  { state: 'Osun', city: 'Osogbo', localGovernment: 'Osogbo', latitude: 7.7719, longitude: 4.5561, region: 'South West' },

  // Ondo State
  { state: 'Ondo', city: 'Akure', localGovernment: 'Akure South', latitude: 7.2571, longitude: 5.2058, region: 'South West' },

  // Ogun State
  { state: 'Ogun', city: 'Abeokuta', localGovernment: 'Abeokuta South', latitude: 7.1475, longitude: 3.3619, region: 'South West' },

  // Ekiti State
  { state: 'Ekiti', city: 'Ado-Ekiti', localGovernment: 'Ado-Ekiti', latitude: 7.6210, longitude: 5.2200, region: 'South West' },

  // Bauchi State
  { state: 'Bauchi', city: 'Bauchi', localGovernment: 'Bauchi', latitude: 10.3158, longitude: 9.8442, region: 'North East' },

  // Gombe State
  { state: 'Gombe', city: 'Gombe', localGovernment: 'Gombe', latitude: 10.2897, longitude: 11.1661, region: 'North East' },

  // Adamawa State
  { state: 'Adamawa', city: 'Yola', localGovernment: 'Yola North', latitude: 9.2084, longitude: 12.4788, region: 'North East' },

  // Taraba State
  { state: 'Taraba', city: 'Jalingo', localGovernment: 'Jalingo', latitude: 8.8833, longitude: 11.3667, region: 'North East' },

  // Borno State
  { state: 'Borno', city: 'Maiduguri', localGovernment: 'Maiduguri', latitude: 11.8469, longitude: 13.1571, region: 'North East' },

  // Yobe State
  { state: 'Yobe', city: 'Damaturu', localGovernment: 'Damaturu', latitude: 11.7470, longitude: 11.9610, region: 'North East' },

  // Jigawa State
  { state: 'Jigawa', city: 'Dutse', localGovernment: 'Dutse', latitude: 11.7564, longitude: 9.3453, region: 'North West' },

  // Katsina State
  { state: 'Katsina', city: 'Katsina', localGovernment: 'Katsina', latitude: 12.9908, longitude: 7.6018, region: 'North West' },

  // Sokoto State
  { state: 'Sokoto', city: 'Sokoto', localGovernment: 'Sokoto North', latitude: 13.0627, longitude: 5.2433, region: 'North West' },

  // Zamfara State
  { state: 'Zamfara', city: 'Gusau', localGovernment: 'Gusau', latitude: 12.1704, longitude: 6.6641, region: 'North West' },

  // Kebbi State
  { state: 'Kebbi', city: 'Birnin Kebbi', localGovernment: 'Birnin Kebbi', latitude: 12.4539, longitude: 4.1975, region: 'North West' },

  // Nasarawa State
  { state: 'Nasarawa', city: 'Lafia', localGovernment: 'Lafia', latitude: 8.4934, longitude: 8.5201, region: 'North Central' },

  // Kogi State
  { state: 'Kogi', city: 'Lokoja', localGovernment: 'Lokoja', latitude: 7.8023, longitude: 6.7319, region: 'North Central' },

  // Bayelsa State
  { state: 'Bayelsa', city: 'Yenagoa', localGovernment: 'Yenagoa', latitude: 4.9267, longitude: 6.2676, region: 'South South' },

  // Ebonyi State
  { state: 'Ebonyi', city: 'Abakaliki', localGovernment: 'Abakaliki', latitude: 6.3350, longitude: 8.1137, region: 'South East' }
];

export class LocationService {
  /**
   * Find the closest Nigerian location to given coordinates
   */
  static findClosestLocation(latitude: number, longitude: number): NigerianLocation {
    let closestLocation = NIGERIAN_LOCATIONS[0];
    let minDistance = this.calculateDistance(latitude, longitude, closestLocation.latitude, closestLocation.longitude);

    for (const location of NIGERIAN_LOCATIONS) {
      const distance = this.calculateDistance(latitude, longitude, location.latitude, location.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = location;
      }
    }

    return closestLocation;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  /**
   * Get random Nigerian location (for generating mock data)
   */
  static getRandomLocation(): NigerianLocation {
    return NIGERIAN_LOCATIONS[Math.floor(Math.random() * NIGERIAN_LOCATIONS.length)];
  }

  /**
   * Get locations by state
   */
  static getLocationsByState(state: string): NigerianLocation[] {
    return NIGERIAN_LOCATIONS.filter(loc => loc.state === state);
  }

  /**
   * Get all states
   */
  static getAllStates(): string[] {
    return [...new Set(NIGERIAN_LOCATIONS.map(loc => loc.state))].sort();
  }

  /**
   * Get all regions
   */
  static getAllRegions(): string[] {
    return ['North Central', 'North East', 'North West', 'South East', 'South South', 'South West'];
  }

  /**
   * Format location as readable string
   */
  static formatLocation(location: NigerianLocation): string {
    return `${location.city}, ${location.localGovernment} LGA, ${location.state} State`;
  }

  /**
   * Format location with coordinates
   */
  static formatLocationWithCoords(location: NigerianLocation): string {
    return `${this.formatLocation(location)} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`;
  }

  /**
   * Get location info from coordinates
   */
  static getLocationInfo(latitude: number, longitude: number): {
    location: NigerianLocation;
    formatted: string;
    distance: number;
  } {
    const closest = this.findClosestLocation(latitude, longitude);
    const distance = this.calculateDistance(latitude, longitude, closest.latitude, closest.longitude);
    
    return {
      location: closest,
      formatted: this.formatLocation(closest),
      distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
    };
  }
}
