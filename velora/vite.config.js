import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Sandbox-only host allowance. Shared configuration keeps its default
// behaviour whenever BASE44_PREVIEW_MODE is not "1".
const allowedHosts = [];
if (process.env.BASE44_PREVIEW_MODE === '1') {
  if (process.env.BASE44_SANDBOX_HOST_DOMAIN) {
    allowedHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`);
  }
  if (process.env.BASE44_PUBLIC_HOST_SUFFIX) {
    allowedHosts.push(`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`);
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: allowedHosts.length ? allowedHosts : undefined,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://api:4000',
        changeOrigin: false,
      },
    },
  },
});
