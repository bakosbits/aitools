// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.brandfetch.io",
                port: "",
                pathname: "/**", // This is crucial: allows all paths
            },
        ],
    },
};

module.exports = nextConfig;
