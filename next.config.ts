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
  // Compat: fase 1 usou /loja — canónico é /store
  async redirects() {
    return [
      {
        source: "/loja",
        destination: "/store",
        permanent: true,
      },
      {
        source: "/loja/checkout",
        destination: "/store/checkout",
        permanent: true,
      },
      {
        source: "/loja/:id",
        destination: "/store/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
