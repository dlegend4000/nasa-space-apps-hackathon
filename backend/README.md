# QuickSat Backend

This backend provides Firebase Functions for satellite data APIs, integrating with NASA and USGS data sources.

## 📁 Structure

```
backend/
├── functions/           # Firebase Functions
│   ├── src/
│   │   ├── index.ts    # Main functions entry point
│   │   └── services/
│   │       └── nasa-apis.ts  # NASA/USGS API services
│   ├── package.json
│   └── tsconfig.json
├── env.example         # Environment variables template
└── package.json        # Backend package configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
```

### 2. Set Up Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your actual values
# Then set Firebase Functions config:
firebase functions:config:set nasa.earthdata_token="your_token"
firebase functions:config:set usgs.api_key="your_key"
```

### 3. Development

```bash
# Start Firebase emulators
firebase emulators:start --only functions

# Or build and serve functions
npm run serve
```

### 4. Deployment

```bash
# Deploy to Firebase
npm run deploy
```

## 📡 Available Functions

- `healthCheck` - API health and configuration status
- `getSatellites` - List of available satellites
- `getSatelliteDataForLocation` - Data for specific coordinates
- `getDataForSatellite` - Data for specific satellite
- `getRecentSatelliteData` - Recent data (last 7 days)

## 🛰️ Supported Satellites

- **Landsat-8/9**: Earth imaging (USGS API)
- **OCO-2/3**: Atmospheric CO₂ (NASA Earthdata)
- **GPM**: Precipitation data (NASA Earthdata)
- **SMAP**: Soil moisture (NASA Earthdata)

## 🔧 Environment Variables

See `env.example` for all required environment variables and API registration links.

## 📚 Documentation

For detailed setup instructions, see the main project `FIREBASE-FUNCTIONS-SETUP.md` file.
