import { defineConfig } from "vite"
import EnvironmentPlugin from "vite-plugin-environment"
import tsconfigPaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react-swc"

const building = process.env.NODE_ENV === "production"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // framer(),
    EnvironmentPlugin("all", { prefix: "PUBLIC" }),
    tsconfigPaths(),
  ],
})
