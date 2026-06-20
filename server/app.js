require('./loadEnv');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./db');

const userroute = require('./routes/user');
const productroute = require('./routes/product');
const orderroute = require('./routes/order');

function createApp({ nextHandler } = {}) {
  const app = express();
  const port = parseInt(process.env.PORT, 10) || 5001;

  app.set('trust proxy', 1);

  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL,
        process.env.STRIPE_REDIRECT_BASE_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : null,
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-stripe-signature'],
  }));

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
  app.use('/user/', limiter);
  app.use('/product/', limiter);

  app.use('/api/webhook', express.raw({ type: 'application/json' }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(fileUpload());
  app.use(cookieParser());

  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(503).json({ success: false, message: 'Database unavailable' });
    }
  });

  app.use('/user', userroute);
  app.use('/product', productroute);

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  app.use('/api', orderroute);
  app.use('/api/cart', require('./routes/cart'));
  app.use('/api/analytics', require('./routes/analytics'));
  app.use('/api/admin', require('./routes/admin'));

  if (nextHandler) {
    app.use((req, res) => nextHandler(req, res));
  }

  return app;
}

module.exports = createApp;
