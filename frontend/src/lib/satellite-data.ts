import * as satellite from 'satellite.js';

// NASA Satellite NORAD IDs from CelesTrak
export const NASA_SATELLITE_IDS = {
  'LANDSAT-8': 39084,
  'LANDSAT-9': 49260,
  'OCO-2': 40023,
  'OCO-3': 44328,
  'GPM': 39570,
  'SMAP': 40379,
};

export interface SatelliteData {
  id: string;
  name: string;
  noradId: number;
  type: string;
  operator: string;
  description: string;
  altitude: string;
  inclination: string;
  period: string;
  coverage: string;
  status: 'active' | 'maintenance' | 'offline';
  dataTypes: string[];
  openData: boolean;
  dataSources: string[];
  apis: string[];
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  velocity?: {
    x: number;
    y: number;
    z: number;
  };
}

export const NASA_SATELLITES: SatelliteData[] = [
  {
    id: '1',
    name: 'Landsat-8',
    noradId: NASA_SATELLITE_IDS['LANDSAT-8'],
    type: 'Earth Imaging',
    operator: 'USGS + NASA',
    description: 'Optical imagery and thermal data for land monitoring',
    altitude: '705 km',
    inclination: '98.2°',
    period: '99 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Surface Reflectance', 'Thermal Imagery', 'Land Cover'],
    openData: true,
    dataSources: ['USGS EarthExplorer', 'Google Earth Engine', 'AWS Landsat'],
    apis: ['USGS Machine-to-Machine API', 'Earth Engine APIs']
  },
  {
    id: '2',
    name: 'Landsat-9',
    noradId: NASA_SATELLITE_IDS['LANDSAT-9'],
    type: 'Earth Imaging',
    operator: 'USGS + NASA',
    description: 'Advanced optical imagery and thermal data',
    altitude: '705 km',
    inclination: '98.2°',
    period: '99 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Surface Reflectance', 'Thermal Imagery', 'Land Cover'],
    openData: true,
    dataSources: ['USGS EarthExplorer', 'Google Earth Engine', 'AWS Landsat'],
    apis: ['USGS Machine-to-Machine API', 'Earth Engine APIs']
  },
  {
    id: '3',
    name: 'OCO-2',
    noradId: NASA_SATELLITE_IDS['OCO-2'],
    type: 'Atmospheric Monitoring',
    operator: 'NASA JPL',
    description: 'Atmospheric CO₂ measurements for climate research',
    altitude: '705 km',
    inclination: '98.2°',
    period: '99 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['CO₂ Concentration', 'Atmospheric Data', 'Climate Data'],
    openData: true,
    dataSources: ['NASA Earthdata', 'GES DISC'],
    apis: ['Earthdata GES DISC APIs']
  },
  {
    id: '4',
    name: 'OCO-3',
    noradId: NASA_SATELLITE_IDS['OCO-3'],
    type: 'Atmospheric Monitoring',
    operator: 'NASA JPL',
    description: 'Advanced atmospheric CO₂ measurements',
    altitude: '420 km',
    inclination: '51.6°',
    period: '93 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['CO₂ Concentration', 'Atmospheric Data', 'Climate Data'],
    openData: true,
    dataSources: ['NASA Earthdata', 'GES DISC'],
    apis: ['Earthdata GES DISC APIs']
  },
  {
    id: '5',
    name: 'GPM',
    noradId: NASA_SATELLITE_IDS['GPM'],
    type: 'Weather Monitoring',
    operator: 'NASA + JAXA',
    description: 'Global precipitation measurement and weather monitoring',
    altitude: '407 km',
    inclination: '65.0°',
    period: '93 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Precipitation', 'Rainfall', 'Snowfall', 'Weather Data'],
    openData: true,
    dataSources: ['GES DISC', 'NASA Earthdata'],
    apis: ['GES DISC OPeNDAP APIs']
  },
  {
    id: '6',
    name: 'SMAP',
    noradId: NASA_SATELLITE_IDS['SMAP'],
    type: 'Environmental Monitoring',
    operator: 'NASA JPL',
    description: 'Soil moisture and freeze/thaw state monitoring',
    altitude: '685 km',
    inclination: '98.1°',
    period: '98 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Soil Moisture', 'Freeze/Thaw State', 'Environmental Data'],
    openData: true,
    dataSources: ['NSIDC DAAC', 'NASA Earthdata'],
    apis: ['NSIDC DAAC API']
  }
];

// TLE data structure
export interface TLEData {
  name: string;
  line1: string;
  line2: string;
}

// Fetch TLE data from CelesTrak
export async function fetchTLEData(): Promise<TLEData[]> {
  try {
    const response = await fetch('https://celestrak.org/NORAD/elements/science.txt');
    const text = await response.text();
    
    const lines = text.split('\n').filter(line => line.trim());
    const tleData: TLEData[] = [];
    
    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        tleData.push({
          name: lines[i].trim(),
          line1: lines[i + 1].trim(),
          line2: lines[i + 2].trim()
        });
      }
    }
    
    return tleData;
  } catch (error) {
    console.error('Error fetching TLE data:', error);
    return [];
  }
}

// Calculate satellite position from TLE
export function calculateSatellitePosition(tle: TLEData, date: Date = new Date()) {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const positionAndVelocity = satellite.propagate(satrec, date);
    
    if (positionAndVelocity && positionAndVelocity.position && positionAndVelocity.velocity) {
      const positionEci = positionAndVelocity.position;
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);
      
      return {
        latitude: positionGd.latitude * 180 / Math.PI,
        longitude: positionGd.longitude * 180 / Math.PI,
        altitude: positionGd.height,
        velocity: {
          x: positionAndVelocity.velocity.x,
          y: positionAndVelocity.velocity.y,
          z: positionAndVelocity.velocity.z
        }
      };
    }
  } catch (error) {
    console.error('Error calculating satellite position:', error);
  }
  
  return null;
}

// Fallback positions for satellites when TLE data is not available
const FALLBACK_POSITIONS = {
  'Landsat-8': { latitude: 45.0, longitude: -120.0, altitude: 705000 },
  'Landsat-9': { latitude: 30.0, longitude: -100.0, altitude: 705000 },
  'OCO-2': { latitude: 60.0, longitude: -80.0, altitude: 705000 },
  'OCO-3': { latitude: 20.0, longitude: -60.0, altitude: 420000 },
  'GPM': { latitude: 0.0, longitude: 0.0, altitude: 407000 },
  'SMAP': { latitude: 15.0, longitude: -30.0, altitude: 685000 },
};

// Get satellite data with current positions
export async function getSatellitesWithPositions(): Promise<SatelliteData[]> {
  try {
    const tleData = await fetchTLEData();
    const satellitesWithPositions = NASA_SATELLITES.map(satellite => {
      // Try to find TLE data with multiple matching strategies
      const tle = tleData.find(t => {
        const tleName = t.name.toLowerCase();
        const satName = satellite.name.toLowerCase();
        return tleName.includes(satName) || 
               tleName.includes(satName.replace('-', ' ')) ||
               tleName.includes(satName.replace('-', '')) ||
               (satName.includes('landsat') && tleName.includes('landsat')) ||
               (satName.includes('oco') && tleName.includes('oco')) ||
               (satName.includes('gpm') && tleName.includes('gpm')) ||
               (satName.includes('smap') && tleName.includes('smap'));
      });
      
      if (tle) {
        const position = calculateSatellitePosition(tle);
        return {
          ...satellite,
          position: position ? {
            latitude: position.latitude,
            longitude: position.longitude,
            altitude: position.altitude
          } : FALLBACK_POSITIONS[satellite.name as keyof typeof FALLBACK_POSITIONS],
          velocity: position?.velocity
        };
      }
      
      // Use fallback position if no TLE data found
      return {
        ...satellite,
        position: FALLBACK_POSITIONS[satellite.name as keyof typeof FALLBACK_POSITIONS]
      };
    });
    
    return satellitesWithPositions;
  } catch (error) {
    console.error('Error fetching satellite positions:', error);
    // Return satellites with fallback positions
    return NASA_SATELLITES.map(satellite => ({
      ...satellite,
      position: FALLBACK_POSITIONS[satellite.name as keyof typeof FALLBACK_POSITIONS]
    }));
  }
}
