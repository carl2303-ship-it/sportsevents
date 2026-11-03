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
      {
        source: "/store/tour.html",
        destination: "/store/tour",
        permanent: true,
      },
      {
        source: "/tour",
        destination: "/store/tour",
        permanent: true,
      },
      {
        source: "/tour.html",
        destination: "/store/tour",
        permanent: true,
      },
      {
        source: "/loja/tour",
        destination: "/store/tour",
        permanent: true,
      },
      // Blog Boost mal-rewritten: /store/product.html?id=<uuid> → /store/<uuid>
      {
        source: "/store/product.html",
        has: [{ type: "query", key: "id", value: "(?<id>[0-9a-fA-F-]{36})" }],
        destination: "/store/:id",
        permanent: true,
      },
      {
        source: "/product.html",
        has: [{ type: "query", key: "id", value: "(?<id>[0-9a-fA-F-]{36})" }],
        destination: "/store/:id",
        permanent: true,
      },
      // Host rewrite leftover: /store/store
      {
        source: "/store/store",
        destination: "/store",
        permanent: true,
      },
      {
        source: "/store/store.html",
        destination: "/store",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
