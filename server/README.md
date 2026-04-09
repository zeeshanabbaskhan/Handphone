# Ecommerce Server

This is the backend server for the Ecommerce web application. It is built with Node.js, Express, and MongoDB.

## Features
- User authentication and registration
- Product management
- Order processing and payment integration (Stripe, mobile payments)
- Cart management
- Analytics and admin dashboard
- Secure API endpoints with JWT and middleware
- Rate limiting, security headers, and data sanitization

## Project Structure
```
server/
├── index.js                # Main server file
├── package.json            # Project dependencies
├── controllers/            # Route controllers
├── middlewares/            # Custom middleware (auth, etc.)
├── models/                 # Mongoose models (User, Product, Order, etc.)
├── public/                 # Static files
├── routes/                 # Express route definitions
├── services/               # Service logic (authentication, cloudinary, socket)
```

## Getting Started
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your environment variables:
   ```env
   Mongo_Url=<your-mongodb-connection-string>
   STRIPE_SECRET_KEY=<your-stripe-key>
   FRONTEND_URL=<your-frontend-url>
   NODE_ENV=production
   PORT=5001
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints
- `/user/sign-up` - Register a new user
- `/user/login` - User login
- `/user/logout` - User logout
- `/product` - Product management
- `/api` - Order management
- `/api/cart` - Cart operations
- `/api/analytics` - Analytics data
- `/api/admin` - Admin dashboard

## Security
- Helmet for HTTP headers
- Rate limiting
- JWT authentication
- CORS configuration

## Deployment
- Ready for deployment on Heroku, Vercel, or any Node.js hosting platform


