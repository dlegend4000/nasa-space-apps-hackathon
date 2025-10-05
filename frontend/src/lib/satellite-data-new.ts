import * as satellite from 'satellite.js';

// NASA Satellite NORAD IDs from CelesTrak
export const NASA_SATELLITE_IDS = {
  'LANDSAT-8': 39084,
  'LANDSAT-9': 49260,
  'OCO-2': 40023,
  'OCO-3': 44328,
  'GPM': 39570,
  'SMAP': 40379,
  'MODIS': 27424, // Terra
  'MODIS-AQUA': 27424, // Aqua
  'ICESAT-2': 43613,
  'CYGNSS': 41884,
  'SENTINEL-6': 46984,
  'GRACE-FO': 43477,
  'EMIT': 52884,
  'AURA': 28376,
  'TERRA': 25994,
  'AQUA': 27424,
  'SUOMI-NPP': 37849,
  'NOAA-20': 43013,
  'METOP-A': 29499,
  'METOP-B': 38771,
  'METOP-C': 43689,
};

export interface SatelliteService {
  id: string;
  name: string;
  description: string;
  basePricePerHour: number;
  dataType: string;
  resolution: string;
  coverage: string;
}

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
  status: string;
  dataTypes: string[];
  openData: boolean;
  dataSources: string[];
  apis: string[];
  industry: string[];
  services: SatelliteService[];
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
    apis: ['USGS Machine-to-Machine API', 'Earth Engine APIs'],
    industry: ['agriculture', 'carbon_markets', 'real_estate'],
    services: [
      {
        id: 'landsat8-yield',
        name: 'Yield Prediction',
        description: 'Crop yield estimation using vegetation indices',
        basePricePerHour: 200,
        dataType: 'Vegetation Index',
        resolution: '30m',
        coverage: 'Agricultural Areas'
      },
      {
        id: 'landsat8-irrigation',
        name: 'Irrigation Optimization',
        description: 'Soil moisture and crop stress monitoring',
        basePricePerHour: 180,
        dataType: 'Thermal Imagery',
        resolution: '100m',
        coverage: 'Agricultural Areas'
      },
      {
        id: 'landsat8-property',
        name: 'Property Valuation',
        description: 'Land use classification and property assessment',
        basePricePerHour: 250,
        dataType: 'Land Cover',
        resolution: '30m',
        coverage: 'Global'
      }
    ]
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
    apis: ['USGS Machine-to-Machine API', 'Earth Engine APIs'],
    industry: ['agriculture', 'carbon_markets', 'real_estate'],
    services: [
      {
        id: 'landsat9-yield',
        name: 'Enhanced Yield Prediction',
        description: 'Improved crop yield estimation with better accuracy',
        basePricePerHour: 220,
        dataType: 'Vegetation Index',
        resolution: '30m',
        coverage: 'Agricultural Areas'
      },
      {
        id: 'landsat9-forest',
        name: 'Forest Carbon Monitoring',
        description: 'Forest biomass and carbon stock assessment',
        basePricePerHour: 300,
        dataType: 'Land Cover',
        resolution: '30m',
        coverage: 'Forest Areas'
      },
      {
        id: 'landsat9-flood',
        name: 'Flood Risk Assessment',
        description: 'Historical flood mapping and risk analysis',
        basePricePerHour: 280,
        dataType: 'Surface Water',
        resolution: '30m',
        coverage: 'Global'
      }
    ]
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
    apis: ['Earthdata GES DISC APIs'],
    industry: ['carbon_markets', 'environmental_compliance'],
    services: [
      {
        id: 'oco2-emission',
        name: 'Emission Verification',
        description: 'Point source CO₂ emission detection and quantification',
        basePricePerHour: 450,
        dataType: 'CO₂ Concentration',
        resolution: '2.25km',
        coverage: 'Global'
      },
      {
        id: 'oco2-offset',
        name: 'Offset Validation',
        description: 'Carbon offset project verification and monitoring',
        basePricePerHour: 400,
        dataType: 'CO₂ Concentration',
        resolution: '2.25km',
        coverage: 'Global'
      },
      {
        id: 'oco2-monitoring',
        name: 'Emission Monitoring',
        description: 'Industrial facility emission monitoring',
        basePricePerHour: 500,
        dataType: 'CO₂ Concentration',
        resolution: '2.25km',
        coverage: 'Industrial Areas'
      }
    ]
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
    apis: ['Earthdata GES DISC APIs'],
    industry: ['carbon_markets', 'environmental_compliance'],
    services: [
      {
        id: 'oco3-urban',
        name: 'Urban Emission Tracking',
        description: 'High-resolution urban CO₂ emission monitoring',
        basePricePerHour: 480,
        dataType: 'CO₂ Concentration',
        resolution: '1.5km',
        coverage: 'Urban Areas'
      },
      {
        id: 'oco3-leak',
        name: 'Leak Detection',
        description: 'Methane and CO₂ leak detection from facilities',
        basePricePerHour: 520,
        dataType: 'CO₂ Concentration',
        resolution: '1.5km',
        coverage: 'Industrial Areas'
      },
      {
        id: 'oco3-air',
        name: 'Air Quality Monitoring',
        description: 'Atmospheric composition and air quality assessment',
        basePricePerHour: 420,
        dataType: 'Atmospheric Composition',
        resolution: '1.5km',
        coverage: 'Global'
      }
    ]
  },
  {
    id: '5',
    name: 'GPM',
    noradId: NASA_SATELLITE_IDS['GPM'],
    type: 'Precipitation Monitoring',
    operator: 'NASA + JAXA',
    description: 'Global Precipitation Measurement for weather and climate',
    altitude: '407 km',
    inclination: '65.0°',
    period: '93 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Precipitation', 'Weather Data', 'Climate Data'],
    openData: true,
    dataSources: ['NASA GES DISC', 'JAXA'],
    apis: ['GES DISC OPeNDAP'],
    industry: ['agriculture', 'insurance'],
    services: [
      {
        id: 'gpm-irrigation',
        name: 'Irrigation Optimization',
        description: 'Precipitation-based irrigation scheduling',
        basePricePerHour: 150,
        dataType: 'Precipitation',
        resolution: '10km',
        coverage: 'Global'
      },
      {
        id: 'gpm-risk',
        name: 'Risk Assessment',
        description: 'Flood and drought risk assessment for insurance',
        basePricePerHour: 200,
        dataType: 'Precipitation',
        resolution: '10km',
        coverage: 'Global'
      },
      {
        id: 'gpm-damage',
        name: 'Damage Estimation',
        description: 'Storm damage assessment and flood mapping',
        basePricePerHour: 250,
        dataType: 'Precipitation',
        resolution: '5km',
        coverage: 'Regional'
      }
    ]
  },
  {
    id: '6',
    name: 'SMAP',
    noradId: NASA_SATELLITE_IDS['SMAP'],
    type: 'Soil Moisture',
    operator: 'NASA JPL',
    description: 'Soil Moisture Active Passive for environmental monitoring',
    altitude: '685 km',
    inclination: '98.1°',
    period: '98 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Soil Moisture', 'Freeze/Thaw State', 'Environmental Data'],
    openData: true,
    dataSources: ['NASA NSIDC DAAC'],
    apis: ['NSIDC DAAC API'],
    industry: ['agriculture'],
    services: [
      {
        id: 'smap-irrigation',
        name: 'Irrigation Optimization',
        description: 'Soil moisture-based irrigation management',
        basePricePerHour: 180,
        dataType: 'Soil Moisture',
        resolution: '9km',
        coverage: 'Global'
      },
      {
        id: 'smap-yield',
        name: 'Yield Prediction',
        description: 'Crop yield forecasting using soil moisture data',
        basePricePerHour: 200,
        dataType: 'Soil Moisture',
        resolution: '9km',
        coverage: 'Agricultural Areas'
      },
      {
        id: 'smap-insurance',
        name: 'Crop Insurance',
        description: 'Drought monitoring for crop insurance claims',
        basePricePerHour: 160,
        dataType: 'Soil Moisture',
        resolution: '9km',
        coverage: 'Agricultural Areas'
      }
    ]
  },
  {
    id: '7',
    name: 'MODIS',
    noradId: NASA_SATELLITE_IDS['MODIS'],
    type: 'Earth Imaging',
    operator: 'NASA',
    description: 'Moderate Resolution Imaging Spectroradiometer for land and ocean monitoring',
    altitude: '705 km',
    inclination: '98.2°',
    period: '99 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Land Surface', 'Ocean Color', 'Atmospheric Aerosols'],
    openData: true,
    dataSources: ['NASA LAADS DAAC', 'Google Earth Engine'],
    apis: ['LAADS DAAC API', 'Earth Engine APIs'],
    industry: ['agriculture', 'insurance'],
    services: [
      {
        id: 'modis-yield',
        name: 'Yield Prediction',
        description: 'Vegetation health and crop yield estimation',
        basePricePerHour: 120,
        dataType: 'Vegetation Index',
        resolution: '250m',
        coverage: 'Global'
      },
      {
        id: 'modis-flood',
        name: 'Flood Prediction',
        description: 'Flood risk assessment and early warning',
        basePricePerHour: 140,
        dataType: 'Surface Water',
        resolution: '250m',
        coverage: 'Global'
      },
      {
        id: 'modis-damage',
        name: 'Damage Estimation',
        description: 'Natural disaster damage assessment',
        basePricePerHour: 160,
        dataType: 'Land Surface',
        resolution: '250m',
        coverage: 'Global'
      }
    ]
  },
  {
    id: '8',
    name: 'ICESat-2',
    noradId: NASA_SATELLITE_IDS['ICESAT-2'],
    type: 'Environmental Monitoring',
    operator: 'NASA',
    description: 'Ice, Cloud, and land Elevation Satellite for precise elevation measurements',
    altitude: '496 km',
    inclination: '92.0°',
    period: '95 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Ice Sheet Elevation', 'Forest Height', 'Sea Ice Thickness'],
    openData: true,
    dataSources: ['NASA NSIDC DAAC'],
    apis: ['NSIDC DAAC API'],
    industry: ['carbon_markets', 'real_estate'],
    services: [
      {
        id: 'icesat2-forest',
        name: 'Forest Carbon',
        description: 'Forest biomass and carbon stock measurement',
        basePricePerHour: 350,
        dataType: 'Forest Height',
        resolution: '70m',
        coverage: 'Global'
      },
      {
        id: 'icesat2-offset',
        name: 'Offset Validation',
        description: 'Forest carbon offset project verification',
        basePricePerHour: 400,
        dataType: 'Forest Height',
        resolution: '70m',
        coverage: 'Forest Areas'
      },
      {
        id: 'icesat2-water',
        name: 'Water Availability',
        description: 'Groundwater and surface water level monitoring',
        basePricePerHour: 300,
        dataType: 'Surface Elevation',
        resolution: '70m',
        coverage: 'Global'
      }
    ]
  },
  {
    id: '9',
    name: 'CYGNSS',
    noradId: NASA_SATELLITE_IDS['CYGNSS'],
    type: 'Weather Monitoring',
    operator: 'NASA',
    description: 'Cyclone Global Navigation Satellite System for hurricane monitoring',
    altitude: '510 km',
    inclination: '35.0°',
    period: '95 min',
    coverage: 'Tropical',
    status: 'active',
    dataTypes: ['Ocean Surface Winds', 'Hurricane Intensity', 'Soil Moisture'],
    openData: true,
    dataSources: ['NASA PO.DAAC'],
    apis: ['PO.DAAC API'],
    industry: ['insurance'],
    services: [
      {
        id: 'cygnss-risk',
        name: 'Risk Assessment',
        description: 'Hurricane and storm risk evaluation',
        basePricePerHour: 280,
        dataType: 'Ocean Surface Winds',
        resolution: '25km',
        coverage: 'Tropical Oceans'
      },
      {
        id: 'cygnss-damage',
        name: 'Damage Estimation',
        description: 'Storm damage assessment and flood prediction',
        basePricePerHour: 320,
        dataType: 'Hurricane Intensity',
        resolution: '25km',
        coverage: 'Tropical Cyclones'
      },
      {
        id: 'cygnss-flood',
        name: 'Flood Prediction',
        description: 'Coastal flood risk assessment',
        basePricePerHour: 300,
        dataType: 'Ocean Surface Winds',
        resolution: '25km',
        coverage: 'Coastal Areas'
      }
    ]
  },
  {
    id: '10',
    name: 'Sentinel-6',
    noradId: NASA_SATELLITE_IDS['SENTINEL-6'],
    type: 'Ocean Monitoring',
    operator: 'NASA + ESA',
    description: 'Sea level monitoring and ocean surface topography',
    altitude: '1336 km',
    inclination: '66.0°',
    period: '112 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Sea Level', 'Ocean Surface Topography', 'Atmospheric Profiles'],
    openData: true,
    dataSources: ['NASA PO.DAAC', 'ESA Copernicus'],
    apis: ['PO.DAAC API', 'Copernicus API'],
    industry: ['insurance', 'real_estate'],
    services: [
      {
        id: 'sentinel6-flood',
        name: 'Flood Risk',
        description: 'Sea level rise and coastal flood risk assessment',
        basePricePerHour: 320,
        dataType: 'Sea Level',
        resolution: '1km',
        coverage: 'Coastal Areas'
      },
      {
        id: 'sentinel6-property',
        name: 'Property Valuation',
        description: 'Coastal property risk assessment',
        basePricePerHour: 350,
        dataType: 'Sea Level',
        resolution: '1km',
        coverage: 'Coastal Areas'
      },
      {
        id: 'sentinel6-damage',
        name: 'Damage Estimation',
        description: 'Storm surge damage assessment',
        basePricePerHour: 380,
        dataType: 'Ocean Surface Topography',
        resolution: '1km',
        coverage: 'Coastal Areas'
      }
    ]
  },
  {
    id: '11',
    name: 'GRACE-FO',
    noradId: NASA_SATELLITE_IDS['GRACE-FO'],
    type: 'Gravity Monitoring',
    operator: 'NASA + DLR',
    description: 'Gravity Recovery and Climate Experiment Follow-On for water monitoring',
    altitude: '490 km',
    inclination: '89.0°',
    period: '95 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Groundwater', 'Ice Sheet Mass', 'Ocean Bottom Pressure'],
    openData: true,
    dataSources: ['NASA JPL', 'GFZ Potsdam'],
    apis: ['JPL GRACE API'],
    industry: ['real_estate'],
    services: [
      {
        id: 'grace-water',
        name: 'Water Availability',
        description: 'Groundwater availability and depletion monitoring',
        basePricePerHour: 380,
        dataType: 'Groundwater',
        resolution: '300km',
        coverage: 'Global'
      },
      {
        id: 'grace-property',
        name: 'Property Valuation',
        description: 'Water availability impact on property values',
        basePricePerHour: 400,
        dataType: 'Groundwater',
        resolution: '300km',
        coverage: 'Global'
      },
      {
        id: 'grace-flood',
        name: 'Flood Risk',
        description: 'Groundwater-related flood risk assessment',
        basePricePerHour: 350,
        dataType: 'Groundwater',
        resolution: '300km',
        coverage: 'Global'
      }
    ]
  },
  {
    id: '12',
    name: 'EMIT',
    noradId: NASA_SATELLITE_IDS['EMIT'],
    type: 'Atmospheric Monitoring',
    operator: 'NASA JPL',
    description: 'Earth Surface Mineral Dust Source Investigation for climate research',
    altitude: '410 km',
    inclination: '51.6°',
    period: '93 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Mineral Dust', 'Atmospheric Composition', 'Climate Data'],
    openData: true,
    dataSources: ['NASA JPL'],
    apis: ['JPL EMIT API'],
    industry: ['environmental_compliance'],
    services: [
      {
        id: 'emit-monitoring',
        name: 'Emission Monitoring',
        description: 'Industrial emission source identification',
        basePricePerHour: 450,
        dataType: 'Mineral Dust',
        resolution: '60m',
        coverage: 'Global'
      },
      {
        id: 'emit-leak',
        name: 'Leak Detection',
        description: 'Atmospheric leak detection and monitoring',
        basePricePerHour: 500,
        dataType: 'Atmospheric Composition',
        resolution: '60m',
        coverage: 'Industrial Areas'
      },
      {
        id: 'emit-air',
        name: 'Air Quality',
        description: 'Air quality monitoring and compliance',
        basePricePerHour: 420,
        dataType: 'Atmospheric Composition',
        resolution: '60m',
        coverage: 'Global'
      }
    ]
  },
  {
    id: '13',
    name: 'Aura',
    noradId: NASA_SATELLITE_IDS['AURA'],
    type: 'Atmospheric Monitoring',
    operator: 'NASA',
    description: 'Atmospheric composition monitoring for air quality and climate',
    altitude: '705 km',
    inclination: '98.2°',
    period: '99 min',
    coverage: 'Global',
    status: 'active',
    dataTypes: ['Ozone', 'Air Quality', 'Atmospheric Composition'],
    openData: true,
    dataSources: ['NASA GES DISC'],
    apis: ['GES DISC API'],
    industry: ['environmental_compliance'],
    services: [
      {
        id: 'aura-monitoring',
        name: 'Emission Monitoring',
        description: 'Atmospheric pollutant monitoring and tracking',
        basePricePerHour: 400,
        dataType: 'Air Quality',
        resolution: '13km',
        coverage: 'Global'
      },
      {
        id: 'aura-leak',
        name: 'Leak Detection',
        description: 'Atmospheric leak detection and source identification',
        basePricePerHour: 450,
        dataType: 'Atmospheric Composition',
        resolution: '13km',
        coverage: 'Global'
      },
      {
        id: 'aura-air',
        name: 'Air Quality',
        description: 'Air quality assessment and compliance monitoring',
        basePricePerHour: 380,
        dataType: 'Air Quality',
        resolution: '13km',
        coverage: 'Global'
      }
    ]
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
export function calculateSatellitePosition(tle: TLEData) {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const now = new Date();
    const positionAndVelocity = satellite.propagate(satrec, now);
    
    if (positionAndVelocity && positionAndVelocity.position && positionAndVelocity.velocity) {
      const gmst = satellite.gstime(now);
      const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      
      return {
        latitude: (positionGd.latitude * 180) / Math.PI,
        longitude: (positionGd.longitude * 180) / Math.PI,
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
  'MODIS': { latitude: 25.0, longitude: -90.0, altitude: 705000 },
  'ICESat-2': { latitude: 70.0, longitude: -45.0, altitude: 496000 },
  'CYGNSS': { latitude: 10.0, longitude: -75.0, altitude: 510000 },
  'Sentinel-6': { latitude: 35.0, longitude: -25.0, altitude: 1336000 },
  'GRACE-FO': { latitude: 50.0, longitude: 10.0, altitude: 490000 },
  'EMIT': { latitude: 40.0, longitude: -110.0, altitude: 410000 },
  'Aura': { latitude: 55.0, longitude: -15.0, altitude: 705000 },
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
                 (satName.includes('smap') && tleName.includes('smap')) ||
                 (satName.includes('modis') && tleName.includes('modis')) ||
                 (satName.includes('icesat') && tleName.includes('icesat')) ||
                 (satName.includes('cygnss') && tleName.includes('cygnss')) ||
                 (satName.includes('sentinel') && tleName.includes('sentinel')) ||
                 (satName.includes('grace') && tleName.includes('grace')) ||
                 (satName.includes('emit') && tleName.includes('emit')) ||
                 (satName.includes('aura') && tleName.includes('aura'));
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
