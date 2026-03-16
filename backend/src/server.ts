import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Middleware
import { authenticateToken } from './middleware/auth';
import { requireRoles, blockFisherman } from './middleware/rbac';

// Routes
import authRoutes from './routes/auth';
import weatherRoutes from './routes/weather';
import matsyaRoutes from './routes/matsya';
import iotRoutes from './routes/iot';
import biodiversityRoutes from './routes/biodiversity';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'Sagar Darpan API' });
});

// ─── Auth Routes (public) ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Weather (public / fisherman) ────────────────────────────────────────────
app.use('/api/weather', weatherRoutes);

// ─── Matsya Chatbot (Fisherman + Admin only, NOT researchers) ─────────────────
app.use('/api/matsya',
  authenticateToken,
  requireRoles('FISHERMAN', 'ADMIN'),
  matsyaRoutes
);

// ─── IoT Data (EXPLICITLY blocks FISHERMAN) ──────────────────────────────────
app.use('/api/iot',
  authenticateToken,
  blockFisherman,
  requireRoles('RESEARCHER', 'ADMIN'),
  iotRoutes
);

// ─── Biodiversity (EXPLICITLY blocks FISHERMAN + GENERAL) ────────────────────
app.use('/api/biodiversity',
  authenticateToken,
  blockFisherman,
  requireRoles('RESEARCHER', 'ADMIN'),
  biodiversityRoutes
);

// ─── Analytics (EXPLICITLY blocks FISHERMAN + GENERAL) ───────────────────────
app.use('/api/analytics',
  authenticateToken,
  blockFisherman,
  requireRoles('RESEARCHER', 'ADMIN'),
  analyticsRoutes
);

// ─── Admin (Admin only) ───────────────────────────────────────────────────────
app.use('/api/admin',
  authenticateToken,
  requireRoles('ADMIN'),
  adminRoutes
);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use('*', (_, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌊 Sagar Darpan API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
