import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import path from 'path'  // ← Add this import

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tsconfigPaths()  // ← This handles your tsconfig paths
  ],
  resolve: {  // ← Move this outside of plugins array
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})