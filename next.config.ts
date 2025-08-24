import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "https://lord-arbiter-backend.fly.dev/api/:path*",
            },
        ];
    },
    images: {
        domains: ['skowt.cc'],
    }
};

export default nextConfig;
