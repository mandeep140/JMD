/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    images: {
        domains: [
            "img.youtube.com",
            "ik.imagekit.io"
        ]
    }
};

export default nextConfig;
