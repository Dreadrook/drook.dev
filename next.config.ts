import type { NextConfig } from "next";

/**
 * The admin panel is intentionally dev-only. Its page and API route files are
 * named `*.dev.tsx` / `*.dev.ts`, and those extensions are only registered as
 * routes when NODE_ENV is not production — i.e. under `next dev`.
 *
 * `next build` therefore cannot emit them, so the static bundle Azure serves
 * contains no admin page and no write endpoints at all. Edit content locally,
 * then commit to publish.
 */
const includeDevOnlyRoutes = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Static export is what Azure serves, but the flag also makes `next dev`
  // reject the admin's GET route handlers ("export const dynamic ... not
  // configured"). Production builds still export; dev runs as a normal server.
  output: includeDevOnlyRoutes ? undefined : "export",
  // Azure Static Web Apps serves `/projects/foo/` from `projects/foo/index.html`.
  // Without this, exported sub-routes emit `projects/foo.html` and 404 in prod.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  pageExtensions: includeDevOnlyRoutes
    ? ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
