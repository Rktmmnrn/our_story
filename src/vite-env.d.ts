import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      // Optimisation pour React 18
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          // Support des composants avec annotations de chunk
          ['@babel/plugin-syntax-dynamic-import']
        ]
      }
    }),
    // Analyse du bundle (optionnel)
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: './dist/stats.html'
    })
  ],
  
  build: {
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    
    // Optimisation agressive du chunking
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk - Framework principal
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          
          // State management
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          
          // HTTP client
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
          
          // UI utilities
          if (id.includes('node_modules/react-hot-toast')) {
            return 'vendor-toast';
          }
          
          // Autres dépendances tierces
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
          
          // Pages (déjà géré par dynamic imports)
          if (id.includes('/pages/')) {
            if (id.includes('LandingPage')) {
              return 'page-landing';
            }
            if (id.includes('AppPage')) {
              return 'page-app';
            }
            if (id.includes('AdminPage')) {
              return 'page-admin';
            }
            if (id.includes('JoinPage')) {
              return 'page-join';
            }
          }
          
          // Composants partagés
          if (id.includes('/components/')) {
            return 'components';
          }
          
          // Store et state
          if (id.includes('/store/')) {
            return 'store';
          }
          
          // Services et API
          if (id.includes('/services/') || id.includes('/api/')) {
            return 'services';
          }
        },
        
        // Stratégie de nommage des chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Optimisation du chunk size
    chunkSizeWarningLimit: 100,
    
    // Compression Terser agressive
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      format: {
        comments: false
      }
    },
    
    // Génération de manifest pour préchargement
    manifest: true,
    
    // Optimisation des modules
    modulePreload: {
      polyfill: true
    }
  },
  
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      'react-hot-toast'
    ],
    exclude: []
  },
  
  // Configuration du serveur de dev
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  
  // Configuration de preview
  preview: {
    port: 4173,
    open: true
  }
});