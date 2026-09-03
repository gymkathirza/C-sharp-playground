import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/C-sharp-playground/",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        sandbox: "sandbox.html",
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
