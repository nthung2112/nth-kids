import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          // Local TTS fallback assets are huge and should only be fetched on demand
          // when the user opts in (Settings -> Download local voice). Precaching
          // them would bloat the PWA install by tens of MB for everyone.
          globIgnores: [
            "**/ort-wasm*.wasm",
            "**/ort-wasm*.js",
            "**/kokoro-*.js",
          ],
          maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
