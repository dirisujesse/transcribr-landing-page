import { defineConfig } from "astro/config";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react(), sitemap()],
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
