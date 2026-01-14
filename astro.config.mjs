import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import path from "path";
import sitemap from "@astrojs/sitemap";

const projectRoot = path.resolve(process.cwd());

export default defineConfig({
  site: "https://gawindlin.com/",
  base: "/",
  integrations: [tailwind(), icon(), sitemap()],
  output: "static",

  markdown: {
    shikiConfig: {
      theme: "catppuccin-mocha",
      wrap: true,
    },
  },

  vite: {
    resolve: {
      alias: {
        "@cv": path.resolve(projectRoot, "./cv.json"),
      },
    },
    optimizeDeps: {
      include: ["ninja-keys"],
    },
    build: {
      rollupOptions: {
        external: ["ninja-keys"],
      },
    },
  },
});
