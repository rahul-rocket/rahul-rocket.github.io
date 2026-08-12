/**
 * @type {import('next').NextConfig}
 *
 * This app is published to the APEX of the user Pages site
 * (https://rahul-rocket.github.io/), with `apps/web-v2` under /v2. GitHub Pages
 * serves files and nothing else, which is why the server-only options this
 * config used to carry are gone rather than merely inert — see the notes below.
 */
const nextConfig = {
  // No server. Emits a fully static tree into out/, which the deploy workflow
  // copies to the root of the Pages artifact.
  output: 'export',

  // GitHub Pages resolves a directory as `dir/index.html` and will not redirect
  // to add a missing trailing slash. Without this, `/blog` is served but every
  // relative asset inside it resolves one level too shallow — which presents as
  // a page that renders with no styling at all rather than as a 404.
  trailingSlash: true,

  // basePath is empty because this app owns the apex. `apps/web-v2` is the one
  // that carries '/v2'.
  basePath: '',

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Workspace packages ship TypeScript source, so Next compiles them itself
  transpilePackages: ['@portfolio/ui'],

  images: {
    // next/image's optimizer is a runtime service and does not exist on Pages.
    // With this set, <Image> emits the source file as-is, so anything rendered
    // through components/optimized-image.tsx must already be sized for its
    // largest display size.
    unoptimized: true,

    // Kept for `next dev`, where the optimizer does run: these are the hosts
    // components/optimized-image.tsx is allowed to load from. They have no
    // effect on the export.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Stripped from the export anyway; stated so the served HTML carries no
  // build fingerprint in dev either.
  poweredByHeader: false,

  // REMOVED, deliberately, by the move to Pages — every one of these is a
  // response-time concern and there is no response time here:
  //
  //   headers()        — the security and Cache-Control headers. Next does not
  //                     apply them to an export and would warn that it is
  //                     ignoring them. GitHub Pages sets its own caching and
  //                     offers no way to add headers, so X-Frame-Options and
  //                     friends must come from <meta> or from a CDN in front of
  //                     Pages. Leaving the block here would have read as though
  //                     the site still sent them.
  //   compress         — Pages negotiates its own gzip/brotli.
  //   generateEtags    — Pages generates its own validators.
  //   formats/deviceSizes/imageSizes/minimumCacheTTL — inputs to the optimizer
  //                     that `unoptimized: true` turns off.
  //
  // If this app ever moves back behind a server, they belong in the same commit
  // that removes `output: 'export'`.

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
