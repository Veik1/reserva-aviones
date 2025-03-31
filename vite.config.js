import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';


export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // Configuración de Vuetify
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // URL del backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});