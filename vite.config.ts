import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'layouts': path.resolve(__dirname, './src/layouts'),
      'assets': path.resolve(__dirname, './src/assets'),
      'context': path.resolve(__dirname, './src/context'),
      'examples': path.resolve(__dirname, './src/examples'),
      'variables': path.resolve(__dirname, './src/variables'),
      'services': path.resolve(__dirname, './src/services')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      
      
    },
    
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx,js,jsx}',
      ],
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
})
