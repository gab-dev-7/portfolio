import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import path from "path";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const projectRoot = path.resolve(process.cwd());

export default defineConfig({
  site: "https://gawindlin.com/",
  base: "/",
  integrations: [tailwind(), icon(), sitemap()],
  output: "static",

  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
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
