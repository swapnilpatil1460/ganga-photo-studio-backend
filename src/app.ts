import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import serviceRoutes from './routes/services';
import employeeRoutes from './routes/employees';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import scheduleRouter from './routes/schedule';
import settingsRoutes from './routes/settings';
import rateLimit from 'express-rate-limit';

const app = express();

// Global rate limiter: max 300 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

const allowedOrigins = [
  'http://localhost:5173',
  'https://ganga-photo-studio-frontend-srock.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedule', scheduleRouter);
app.use('/api/settings', settingsRoutes);

export default app;
