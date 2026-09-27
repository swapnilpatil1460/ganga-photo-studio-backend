import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import serviceRoutes from './routes/services';
import employeeRoutes from './routes/employees';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import scheduleRouter from './routes/schedule';
import settingsRoutes from './routes/settings';
import activityRoutes from './routes/activity';
import salaryRoutes from './routes/salary';
import backupRoutes from './routes/backup';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());

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

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

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
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

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
app.use('/api/activity', activityRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/backup', backupRoutes);

// Centralized error sanitizer (prevents internal stack traces/details from leaking in production)
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[Production Error Handler]', err);
  res.status(statusCode).json({
    message: isProd && statusCode === 500 ? 'Internal Server Error' : (err.message || 'An unexpected error occurred'),
    ...(isProd ? {} : { stack: err.stack })
  });
});

export default app;
