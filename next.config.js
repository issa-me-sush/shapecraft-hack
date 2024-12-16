/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'maps.googleapis.com',
      'lh3.googleusercontent.com',
      'api.mapbox.com'
    ],
  },
  reactStrictMode: true,
}

module.exports = nextConfig 