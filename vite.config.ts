import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // host: true → listen on all interfaces (default is localhost-only), so the
  // dev server is reachable from other devices (e.g. phone at http://tower:PORT).
  // allowedHosts → let Vite accept the "tower" Host header.
  server: { host: true, allowedHosts: ['tower'] },
  plugins: [react(), tailwindcss()],
});
