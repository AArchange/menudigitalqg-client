/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // On ajoute cette nouvelle section pour les images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dwaghs8g4/**', // Important: Remplace dwaghs8g4 par TON Cloud Name
      },
    ],
  },
};

export default nextConfig;

