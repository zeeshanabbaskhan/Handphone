
# Ecommerce Client

This is the frontend client for an ecommerce website built with Next.js, React, and Tailwind CSS. It provides a modern shopping experience with features for customers and administrators.

## Features

- Product browsing, filtering, and search
- Shopping cart and checkout flow
- Stripe payment integration
- Order management and history
- Customer profile and support
- Admin dashboard for analytics, product, order, and customer management
- Responsive design with Tailwind CSS
- Protected routes for authentication

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Axios for API requests
- Stripe for payments
- Lucide React icons

## Project Structure

```
client/
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── customers/     # Customer pages (orders, products, cart, checkout, profile, support)
│   │   ├── admin/         # Admin pages (dashboard, analytics, products, orders, customers)
│   │   ├── login/         # Login page
│   │   ├── signup/        # Signup page
│   │   └── ...
│   ├── components/        # Reusable UI components
│   ├── Store/             # State management and API utilities
├── package.json           # Project dependencies and scripts
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Project documentation
```

## Getting Started

1. **Install dependencies:**
	```sh
	npm install
	```
2. **Run the development server:**
	```sh
	npm run dev
	```
3. **Build for production:**
	```sh
	npm run build
	```
4. **Start the production server:**
	```sh
	npm start
	```

## Environment Variables

Create a `.env.local` file for sensitive configuration, such as Stripe keys and API endpoints.

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
```

## Linting & Formatting

- ESLint is configured for Next.js and React best practices.
- Custom rules are set in `eslint.config.js`.

## Deployment

- Ready for deployment on Vercel or any Node.js hosting platform.

## Contributing

Pull requests and issues are welcome! Please follow the code style and add tests where appropriate.

## License

MIT
