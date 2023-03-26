import { defineConfig } from "vite";
import path from "path";
import { createVuePlugin as vue } from "vite-plugin-vue2";

export default defineConfig({
  plugins: [vue()],
  build: {
    format: "es",
    assetsInlineLimit: 0,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
        assetFileNames: "extension.[ext]",
      }
    },
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "Roam Portal",
      fileName: () => `extension.js`,
      formats: ["es"]
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
