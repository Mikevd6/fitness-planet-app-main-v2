import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  plugins: [
    {
      name: 'load-js-files-as-jsx',
      async transform(code, id) {
        if (!/src[\\/].*\.js$/.test(id)) {
          return null;
        }

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic'
        });
      }
    },
    react({
      include: /\.[jt]sx?$/
    })
  ]
});
