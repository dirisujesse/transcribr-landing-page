import { defineConfig } from "astro/config";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";

/**
 * The Keystatic editor is a development-only route.
 *
 * It needs server rendering, and this site is static with no adapter — adding
 * one to host an admin panel would change how the whole site deploys, and put
 * an authenticated surface on the public internet to save two people from
 * running a dev server. In development Astro renders on demand, so the editor
 * works with no adapter at all and never reaches the build.
 *
 *   pnpm dev  →  http://localhost:4321/keystatic
 */
const isDev = process.argv.includes("dev");

export default defineConfig({
  integrations: [
    react(),
    sitemap({
      filter: (page) => page !== "https://transcribr.org/",
    }),
    ...(isDev ? [keystatic()] : []),
  ],
  output: "static",
  site: "https://transcribr.org",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "nl", "de", "es", "hr", "it", "fr"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        emitTsDeclarations: false,
        strategy: ["url", "globalVariable", "baseLocale"],
        urlPatterns: [
          // The blog is the same URL in every locale, because it is English
          // only and lives at /blog rather than under a prefix. Declared before
          // the catch-all below, which would otherwise rewrite /blog to
          // /en/blog — that route does not exist, so the page 404s in dev while
          // building fine statically, since the built file is served directly
          // with no rewriting in front of it.
          {
            pattern: "/blog/:path(.*)?",
            localized: [
              ["en", "/blog/:path(.*)?"],
              ["nl", "/blog/:path(.*)?"],
              ["de", "/blog/:path(.*)?"],
              ["es", "/blog/:path(.*)?"],
              ["hr", "/blog/:path(.*)?"],
              ["it", "/blog/:path(.*)?"],
              ["fr", "/blog/:path(.*)?"],
            ],
          },
          {
            pattern: "/:path(.*)?",
            localized: [
              ["en", "/en/:path(.*)?"],
              ["nl", "/nl/:path(.*)?"],
              ["de", "/de/:path(.*)?"],
              ["es", "/es/:path(.*)?"],
              ["hr", "/hr/:path(.*)?"],
              ["it", "/it/:path(.*)?"],
              ["fr", "/fr/:path(.*)?"],
            ],
          },
        ],
      }),
    ],
  },
});
