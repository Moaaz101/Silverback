import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import fighterRoutes from './routes/fighters.js';
import coachRoutes from './routes/coaches.js';
import attendanceRoutes from './routes/attendance.js';
import paymentRoutes from './routes/payments.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
// TEMPORARY: Setup route - DELETE AFTER CREATING ADMIN
import setupRoutes from './routes/setup.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Test database connection
prisma.$connect()
  .then(() => console.log('Database connected'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Trust Railway's proxy (fixes rate limit X-Forwarded-For warning)
app.set('trust proxy', true);
prisma.$connect()
// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting - Only for authentication endpoints
// General rate limiting removed - small trusted user base + JWT auth provides sufficient protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 in production, 100 in dev
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response time logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;
    
    if (duration > 100) {
      console.warn(`Slow request: ${logMessage}`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`${logMessage}`);
    }
  });
  
  next();
});

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
app.use('/auth', authLimiter, authRoutes);

// TEMPORARY: Admin setup endpoint - DELETE AFTER USE!
app.use('/setup', setupRoutes);

// Protected routes (authentication required)
app.use('/fighters', authenticateToken, fighterRoutes);
app.use('/coaches', authenticateToken, coachRoutes);
app.use('/attendance', authenticateToken, attendanceRoutes);
app.use('/payments', authenticateToken, paymentRoutes);
app.use('/admin', authenticateToken, adminRoutes);

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
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
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