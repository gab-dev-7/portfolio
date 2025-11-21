import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import path from "path";

const projectRoot = path.resolve(process.cwd());

export default defineConfig({
  site: "https://gawindlin.com/",
  base: "/",
  integrations: [tailwind(), icon()],
  output: "static",

  // --- CRITICAL VITE/ROLLUP FIX ---
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
