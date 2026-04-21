import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

import { staticRoutesPrerender } from "./scripts/vite-plugin-static-routes.mjs";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl = mode === "development" ? "/" : env.VITE_BASE_URL || "/";

  return {
    base: baseUrl,
    plugins: [
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      staticRoutesPrerender({
        routeTreePath: path.resolve(__dirname, "./src/routeTree.gen.ts"),
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
