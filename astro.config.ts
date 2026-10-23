import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Tailwind resolves `@reference "@styles/base.css"` with Vite's resolver,
      // which ignores tsconfig paths since Astro 7 (Vite 8 `tsconfigPaths`)
      alias: {
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
      },
    },
  },
  scopedStyleStrategy: "where",
  // Astro 7 defaults to "jsx", which drops whitespace between inline elements
  // (e.g. "Home » Career" in the breadcrumbs); keep the previous behavior
  compressHTML: true,
});
