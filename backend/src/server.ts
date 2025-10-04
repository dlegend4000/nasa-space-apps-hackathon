import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from './firebase-admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Example protected route
app.get('/api/protected', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    res.json({ 
      message: 'Protected route accessed successfully',
      user: decodedToken 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
