import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Ensure assets in the public directory are properly copied to the build output
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    // Optional: Add PWA headers for local development
    headers: {
      "Cache-Control": "no-store",
    },
  },
});
