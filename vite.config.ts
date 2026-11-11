import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// Build partner artifacts independently. Shared chunks from a multi-page build
// are not an adequate confidentiality boundary for an externally hosted page.
const target = process.env.DNS_ANALYTICS_BUILD_TARGET ?? 'all';
if (!['all', 'partner', 'secure'].includes(target)) {
  throw new Error('INVALID_ANALYTICS_BUILD_TARGET');
}
const html = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Both builds are served from the same GitHub Pages project root.
  // Partner HTML lives at /analytics/partner/; its JS chunks live at /analytics/assets/.
  base: '/analytics/',
  build: {
    outDir: target === 'partner' ? 'dist-partner' : target === 'secure' ? 'dist-secure' : 'dist',
    rollupOptions: {
      input: target === 'partner'
        ? { partner: html('./partner/index.html') }
        : target === 'secure'
          ? { secure: html('./secure/index.html') }
          : { index: html('./index.html'), partner: html('./partner/index.html') },
    },
  },
});
