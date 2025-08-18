/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: [
        "*.bakos.lan",
        "*.bakos.me",
        "localhost",
        "192.168.1.0/24",
    ],
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.public.blob.vercel-storage.com",
            },
            {
                protocol: "https",
                hostname: "cdn.brandfetch.io",
            },
        ],
    },
};

module.exports = nextConfig;
