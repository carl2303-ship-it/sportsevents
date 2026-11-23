import type { NextConfig } from "next";

/** Skip redirects that would fight store.padel1.app public paths (proxy rewrites those). */
const notStoreHost = {
  missing: [{ type: "host" as const, value: "store.padel1.app" }],
};

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
  // Compat: fase 1 usou /loja — canónico público é store.padel1.app (sem /store)
  // + aliases HTML do Boost (ebook-landing / funnel) para landings SE
  async redirects() {
    return [
      // EN alias → canonical PT path /eventos
      {
        source: "/events",
        destination: "/eventos",
        permanent: true,
      },
      {
        source: "/events/:path*",
        destination: "/eventos/:path*",
        permanent: true,
      },
      {
        source: "/pt/events",
        destination: "/pt/eventos",
        permanent: true,
      },
      {
        source: "/pt/events/:path*",
        destination: "/pt/eventos/:path*",
        permanent: true,
      },
      {
        source: "/es/events",
        destination: "/es/eventos",
        permanent: true,
      },
      {
        source: "/es/events/:path*",
        destination: "/es/eventos/:path*",
        permanent: true,
      },
      {
        source: "/fr/events",
        destination: "/fr/eventos",
        permanent: true,
      },
      {
        source: "/fr/events/:path*",
        destination: "/fr/eventos/:path*",
        permanent: true,
      },
      {
        source: "/de/events",
        destination: "/de/eventos",
        permanent: true,
      },
      {
        source: "/de/events/:path*",
        destination: "/de/eventos/:path*",
        permanent: true,
      },
      // Legacy /loja → internal /store on SE only (store host uses public paths)
      {
        source: "/loja",
        destination: "/store",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/loja/checkout",
        destination: "/store/checkout",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/loja/funnel",
        destination: "/store/funnel",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/loja/funnel/upsell",
        destination: "/store/funnel/upsell",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/loja/funnel/thank-you",
        destination: "/store/funnel/thank-you",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/loja/ebook-landing",
        destination: "/store/ebook-landing",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/loja/:id",
        destination: "/store/:id",
        permanent: true,
        ...notStoreHost,
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
        ...notStoreHost,
      },
      {
        source: "/ebook-landing.html",
        destination: "/store/ebook-landing",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/smartpadelstrategy",
        destination: "/store/funnel?slug=smartpadelstrategy",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/smartpadelstrategy.html",
        destination: "/store/funnel?slug=smartpadelstrategy",
        permanent: true,
        ...notStoreHost,
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
        ...notStoreHost,
      },
      {
        source: "/tour.html",
        destination: "/store/tour",
        permanent: true,
        ...notStoreHost,
      },
      {
        source: "/loja/tour",
        destination: "/store/tour",
        permanent: true,
        ...notStoreHost,
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
        ...notStoreHost,
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
      // sportsevents.app/store → canonical store host (also in proxy.ts)
      {
        source: "/store",
        has: [{ type: "host", value: "sportsevents.app" }],
        destination: "https://store.padel1.app/",
        permanent: true,
      },
      {
        source: "/store/:path*",
        has: [{ type: "host", value: "sportsevents.app" }],
        destination: "https://store.padel1.app/:path*",
        permanent: true,
      },
      {
        source: "/store",
        has: [{ type: "host", value: "www.sportsevents.app" }],
        destination: "https://store.padel1.app/",
        permanent: true,
      },
      {
        source: "/store/:path*",
        has: [{ type: "host", value: "www.sportsevents.app" }],
        destination: "https://store.padel1.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
