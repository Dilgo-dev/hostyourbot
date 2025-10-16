import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
};
