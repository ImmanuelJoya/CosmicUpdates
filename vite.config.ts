import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: [
      'pinia',
      'pinia-plugin-persistedstate',
      'vue-router'
    ]
  }
});