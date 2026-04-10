
require('dotenv').config();

const fileUpload = require('express-fileupload');
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors');
const userroute = require('./routes/user')
const productroute = require('./routes/product')
const orderroute = require('./routes/order')


const helmet = require('helmet');
// const compression = require('compression');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const hpp = require('hpp');
// const { checkauth } = require('./middlewares/checkauth')
const cookieParser = require('cookie-parser')

mongoose.connect(process.env.Mongo_Url).then(() => {
  console.log('Connected to MongoDB')
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err)
})


const port = process.env.PORT || 5001;

// CORS configuration
app.use(cors({
  origin:  process.env.FRONTEND_URL || 'https://handphone-qalz.vercel.app/',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-stripe-signature']
}));



app.set('trust proxy', 1);



// Security Middleware
app.use(helmet());
// app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stripe webhook endpoint (must be before express.json())
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
// app.use(hpp());





app.use(fileUpload());



app.use(cookieParser())


app.use('/user', userroute)
app.use('/product', productroute)
app.use('/api', orderroute)
app.use('/api/cart', require('./routes/cart'));
// In app.js or server.js
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));



// // Import routes
// const orderRoutes = require('./routes/orders');
// const stripeRoutes = require('./routes/stripe');


// // API Routes
// app.use('/api', orderRoutes);
// app.use('/api', stripeRoutes);


// Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV
//   });
// });



// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err);

//   // Mongoose validation error
//   if (err.name === 'ValidationError') {
//     const errors = Object.values(err.errors).map(e => e.message);
//     return res.status(400).json({
//       error: 'Validation Error',
//       details: errors
//     });
//   }

//   // Mongoose duplicate key error
//   if (err.code === 11000) {
//     const field = Object.keys(err.keyValue)[0];
//     return res.status(400).json({
//       error: `Duplicate ${field}`,
//       details: `${field} already exists`
//     });
//   }

//   // JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({
//       error: 'Invalid token'
//     });
//   }

//   if (err.name === 'TokenExpiredError') {
//     return res.status(401).json({
//       error: 'Token expired'
//     });
//   }

//   // Stripe errors
//   if (err.type === 'StripeCardError') {
//     return res.status(400).json({
//       error: 'Payment failed',
//       details: err.message
//     });
//   }

//   if (err.type === 'StripeInvalidRequestError') {
//     return res.status(400).json({
//       error: 'Invalid payment request',
//       details: err.message
//     });
//   }

//   // Default error
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Route not found',
//     path: req.originalUrl
//   });
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received. Shutting down gracefully...');
//   mongoose.connection.close(() => {
//     console.log('MongoDB connection closed.');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received. Shutting down gracefully...');
//   mongoose.connection.close(() => {
//     console.log('MongoDB connection closed.');
//     process.exit(0);
//   });
// });


app.listen(port, () => console.log(`Server listening on port ${port}`))

