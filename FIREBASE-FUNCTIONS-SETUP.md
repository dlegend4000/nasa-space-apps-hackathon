# Firebase Functions Setup Guide for QuickSat

This guide will help you set up Firebase Functions for your satellite data APIs.

## 📁 Project Structure

```
nasa-space-hackathon/
├── backend/
│   ├── functions/           # Firebase Functions (NEW)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── services/
│   │   │       └── nasa-apis.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── src/                 # Express server (existing)
│   │   ├── server.ts
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── frontend/
│   └── src/
└── firebase.json
```

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install Firebase Functions dependencies
cd backend/functions
npm install

# Install frontend dependencies (if not already done)
cd ../../frontend
npm install
```

### 2. Configure Firebase Project

```bash
# Login to Firebase (if not already logged in)
firebase login

# Set your project ID
firebase use your-project-id-here
```

### 3. Set Environment Variables

```bash
# Set NASA Earthdata token
firebase functions:config:set nasa.earthdata_token="your_nasa_token_here"

# Set USGS API key
firebase functions:config:set usgs.api_key="your_usgs_api_key_here"

# Set Google Earth Engine credentials (optional)
firebase functions:config:set google.earth_engine_api_key="your_google_api_key_here"
firebase functions:config:set google.cloud_project_id="your_google_project_id_here"
```

### 4. Update Frontend Environment

Add to your `frontend/.env.local`:

```env
# Firebase Functions URL (replace with your actual project ID)
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net

# Existing Firebase config...
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## 🧪 Local Development

### Start Firebase Emulators

```bash
# Start all emulators (functions + hosting)
firebase emulators:start

# Or start just functions emulator
firebase emulators:start --only functions
```

### Test Functions Locally

```bash
# Test health check
curl http://localhost:5001/your-project-id/us-central1/healthCheck

# Test satellites list
curl http://localhost:5001/your-project-id/us-central1/getSatellites

# Test satellite data
curl "http://localhost:5001/your-project-id/us-central1/getDataForSatellite/Landsat-8?startDate=2024-01-01&endDate=2024-01-31"
```

## 🚀 Deployment

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:healthCheck
```

### Deploy Frontend

```bash
# Build frontend for production
cd frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Deploy Everything

```bash
# Deploy both functions and hosting
firebase deploy
```

## 📡 Available Functions

### 1. Health Check
- **Function**: `healthCheck`
- **URL**: `https://us-central1-your-project-id.cloudfunctions.net/healthCheck`
- **Purpose**: Check API configuration and health

### 2. Get Satellites
- **Function**: `getSatellites`
- **URL**: `https://us-central1-your-project-id.cloudfunctions.net/getSatellites`
- **Purpose**: Get list of available satellites

### 3. Get Satellite Data for Location
- **Function**: `getSatelliteDataForLocation`
- **URL**: `https://us-central1-your-project-id.cloudfunctions.net/getSatelliteDataForLocation/{lat}/{lon}`
- **Parameters**: `startDate`, `endDate`, `radius`

### 4. Get Data for Specific Satellite
- **Function**: `getDataForSatellite`
- **URL**: `https://us-central1-your-project-id.cloudfunctions.net/getDataForSatellite/{satelliteName}`
- **Parameters**: `startDate`, `endDate`, `lat`, `lon`

### 5. Get Recent Satellite Data
- **Function**: `getRecentSatelliteData`
- **URL**: `https://us-central1-your-project-id.cloudfunctions.net/getRecentSatelliteData/{satelliteName}`
- **Parameters**: `lat`, `lon`

## 🔧 Frontend Integration

### Using the API Service

```typescript
import { satelliteAPIService } from '@/lib/satellite-api';

// Check API health
const health = await satelliteAPIService.checkHealth();

// Get available satellites
const satellites = await satelliteAPIService.getAvailableSatellites();

// Get data for a location
const data = await satelliteAPIService.getSatelliteDataForLocation(
  40.7128, // lat
  -74.0060, // lon
  '2024-01-01', // startDate
  '2024-01-31'  // endDate
);

// Get data for specific satellite
const landsatData = await satelliteAPIService.getDataForSatellite(
  'Landsat-8',
  '2024-01-01',
  '2024-01-31',
  { lat: 40.7128, lon: -74.0060 }
);
```

## 🛰️ API Registration

### NASA Earthdata API
1. Go to [NASA Earthdata](https://urs.earthdata.nasa.gov/)
2. Create free account
3. Generate API token
4. Set: `firebase functions:config:set nasa.earthdata_token="your_token"`

### USGS EarthExplorer API
1. Go to [USGS EarthExplorer](https://earthexplorer.usgs.gov/)
2. Create free account
3. Generate API key
4. Set: `firebase functions:config:set usgs.api_key="your_key"`

## 📊 Environment Variables Summary

### Firebase Functions Config
```bash
firebase functions:config:set nasa.earthdata_token="your_token"
firebase functions:config:set usgs.api_key="your_key"
firebase functions:config:set google.earth_engine_api_key="your_key"
firebase functions:config:set google.cloud_project_id="your_project_id"
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## 🧪 Testing Commands

```bash
# Test locally
firebase emulators:start

# Test health
curl http://localhost:5001/your-project-id/us-central1/healthCheck

# Test satellites
curl http://localhost:5001/your-project-id/us-central1/getSatellites

# Test satellite data
curl "http://localhost:5001/your-project-id/us-central1/getDataForSatellite/Landsat-8"

# Deploy and test production
firebase deploy --only functions
curl https://us-central1-your-project-id.cloudfunctions.net/healthCheck
```

## 🔄 Development Workflow

### Option 1: Use Firebase Functions (Recommended for Production)
```bash
# Work in backend/functions/
cd backend/functions
npm run build
firebase emulators:start --only functions
```

### Option 2: Use Express Server (For Development)
```bash
# Work in backend/src/
cd backend
npm run dev
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Function not found"**: Check function names and deployment
2. **"Config not found"**: Verify Firebase Functions config is set
3. **CORS errors**: Functions include CORS middleware
4. **API errors**: Check NASA/USGS API keys are valid

### Debug Steps:

1. Check function logs: `firebase functions:log`
2. Test locally first: `firebase emulators:start`
3. Verify config: `firebase functions:config:get`
4. Check deployment: `firebase functions:list`

## 📝 Next Steps

1. **Set up API keys** (NASA Earthdata + USGS)
2. **Configure Firebase project** with your project ID
3. **Test locally** with emulators
4. **Deploy to production** when ready
5. **Integrate with frontend** using the API service

Your Firebase Functions are now ready to serve satellite data APIs! 🚀

## 📁 File Locations

- **Functions**: `backend/functions/src/`
- **Express Server**: `backend/src/` (alternative)
- **Frontend**: `frontend/src/`
- **Firebase Config**: `firebase.json`
- **Project Config**: `.firebaserc`