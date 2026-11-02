import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "tprbpeacicadsbmvxcqk.supabase.co",
      },
      {
        protocol: "https",
        hostname: "gmpyjnufuvsoewbtirsg.supabase.co",
      },
    ],
  },
};

export default nextConfig;
