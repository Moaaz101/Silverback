import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Import routes
import fighterRoutes from './routes/fighters.js';
import coachRoutes from './routes/coaches.js';
import attendanceRoutes from './routes/attendance.js';
import paymentRoutes from './routes/payments.js';
import authRoutes from './routes/auth.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Attach Prisma client to request object
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Health check endpoint (public)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Silverback Gym API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Public routes (no authentication required)
app.use('/auth', authRoutes);

// Protected routes (authentication required)
app.use('/fighters', authenticateToken, fighterRoutes);
app.use('/coaches', authenticateToken, coachRoutes);
app.use('/attendance', authenticateToken, attendanceRoutes);
app.use('/payments', authenticateToken, paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});