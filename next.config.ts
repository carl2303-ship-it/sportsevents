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
  // + aliases HTML do Boost (ebook-landing / funnel) para landings SE
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
        source: "/loja/funnel",
        destination: "/store/funnel",
        permanent: true,
      },
      {
        source: "/loja/funnel/upsell",
        destination: "/store/funnel/upsell",
        permanent: true,
      },
      {
        source: "/loja/funnel/thank-you",
        destination: "/store/funnel/thank-you",
        permanent: true,
      },
      {
        source: "/loja/ebook-landing",
        destination: "/store/ebook-landing",
        permanent: true,
      },
      {
        source: "/loja/:id",
        destination: "/store/:id",
        permanent: true,
      },
      {
        source: "/store/ebook-landing.html",
        destination: "/store/ebook-landing",
        permanent: true,
      },
      {
        source: "/ebook-landing",
        destination: "/store/ebook-landing",
        permanent: true,
      },
      {
        source: "/ebook-landing.html",
        destination: "/store/ebook-landing",
        permanent: true,
      },
      {
        source: "/smartpadelstrategy",
        destination: "/store/funnel?slug=smartpadelstrategy",
        permanent: true,
      },
      {
        source: "/smartpadelstrategy.html",
        destination: "/store/funnel?slug=smartpadelstrategy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
