import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/The-Long-Game/',
  plugins: [svelte()],
  test: {
    environment: 'node',
  },
});
