import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite config: React plugin only. Nothing fancy needed for the slice.
export default defineConfig({
  plugins: [react()],
});
