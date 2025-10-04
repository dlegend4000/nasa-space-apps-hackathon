# NASA Space Hackathon

A full-stack application built with Next.js frontend and Express.js backend, integrated with Firebase for authentication and data storage.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Firebase Client SDK** - Authentication and real-time database

### Backend
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Firebase Admin SDK** - Server-side Firebase integration
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
nasa-space-hackathon/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   │   └── ui/         # shadcn/ui components
│   │   └── lib/            # Utility functions
│   │       ├── firebase.ts # Firebase client config
│   │       └── utils.ts    # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express.js server
│   ├── src/
│   │   ├── firebase-admin.ts # Firebase Admin config
│   │   └── server.ts        # Express server
│   ├── dist/               # Compiled JavaScript
│   └── package.json
└── package.json            # Root package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### 1. Clone and Install Dependencies

```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all
```

### 2. Firebase Configuration

#### Frontend Configuration
1. Copy the example environment file:
   ```bash
   cp frontend/env.local.example frontend/.env.local
   ```

2. Update `frontend/.env.local` with your Firebase project credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

#### Backend Configuration
1. Copy the example environment file:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Update `backend/.env` with your Firebase Admin SDK credentials:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   PORT=3001
   NODE_ENV=development
   ```

### 3. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Generate a service account key for the backend
4. Add your domain to authorized domains in Firebase Auth settings

## 🚀 Development

### Start Both Servers
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Start Individual Servers

#### Frontend Only
```bash
npm run dev:frontend
```

#### Backend Only
```bash
npm run dev:backend
```

## 🏗️ Build and Production

### Build Both Applications
```bash
npm run build
```

### Start Production Servers
```bash
npm run start
```

## 📝 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications
- `npm run start` - Start both applications in production mode
- `npm run install:all` - Install dependencies for all projects

### Frontend
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start Express server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server

## 🔧 API Endpoints

### Backend API
- `GET /health` - Health check endpoint
- `GET /api/protected` - Protected route (requires Firebase token)

## 🎨 UI Components

The project includes shadcn/ui components:
- Button
- Card
- Input
- Label
- Form

Add more components as needed:
```bash
cd frontend
npx shadcn@latest add [component-name]
```

## 🔐 Authentication

The application is set up for Firebase Authentication. Implement authentication flows in your components using the Firebase client SDK.

## 📊 Database

Firestore is configured for both client and server-side operations. Use the Firebase client SDK in the frontend and Firebase Admin SDK in the backend.

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway, Heroku, etc.)
1. Build the backend: `cd backend && npm run build`
2. Set environment variables in your hosting platform
3. Deploy the `dist` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:
1. Check the Firebase configuration
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check the console for error messages

---

Happy coding! 🚀
