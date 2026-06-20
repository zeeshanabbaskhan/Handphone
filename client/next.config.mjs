/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['fdn2.gsmarena.com', 'res.cloudinary.com', 'images.unsplash.com'],
    },

    eslint: {
        ignoreDuringBuilds: true,
    },

    env: {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
};


export default nextConfig;
