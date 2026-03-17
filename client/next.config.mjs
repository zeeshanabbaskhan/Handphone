/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['fdn2.gsmarena.com', 'res.cloudinary.com', 'images.unsplash.com'],
    },

    eslint: {
        ignoreDuringBuilds: true,
    },

};


export default nextConfig;
