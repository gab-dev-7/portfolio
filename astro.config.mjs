import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

// NOTE: This repository previously included Vercel/Netlify adapter code.
// We are ensuring it is clean for GitHub Pages static hosting.

// Fix the path for the @cv import to ensure TypeScript works
import path from "path";

// Function to resolve files from the root of the project
const projectRoot = path.resolve(process.cwd());

export default defineConfig({
  site: "https://gawindlin.com/", // Your custom domain
  base: "/",
  integrations: [tailwind(), icon()],
  output: "static", // Ensure static output for GitHub Pages

  // --- CRITICAL VITE/ROLLUP FIX ---
  vite: {
    resolve: {
      alias: {
        "@cv": path.resolve(projectRoot, "./cv.json"), // Alias the data file
      },
    },
    optimizeDeps: {
      // CRITICAL: Tells Vite to optimize the custom web component dependency
      include: ["ninja-keys"],
    },
  },
  // The previous theme included Vercel adapter; we should remove it entirely if it exists.
  // If you see 'adapter' config here, remove it.
});
