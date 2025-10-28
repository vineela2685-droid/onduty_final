import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Base must match the GitHub Pages path for the repo: /<repo>/
  // This ensures built assets reference the correct absolute path when served from GitHub Pages.
  base: '/onduty_final/', // repo name for GitHub Pages
  build: {
    outDir: 'build'
  }
});
