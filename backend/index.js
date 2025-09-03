// index.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import fighterRoutes from './routes/fighters.js';
import coachRoutes from './routes/coaches.js';
import attendanceRoutes from './routes/attendance.js';
import paymentRoutes from './routes/payments.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Attach prisma to request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use('/fighters', fighterRoutes);
app.use('/coaches', coachRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
