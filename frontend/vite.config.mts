// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import {defineConfig, splitVendorChunkPlugin} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import preload from 'unplugin-inject-preload/vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';

export default defineConfig((configEnv) => {
  return {
    assetsInclude: ['**/*.md', '**/*.geojson', '**/*.json5'],
    plugins: [
      react(),
      eslintPlugin(),
      tsconfigPaths(),
      splitVendorChunkPlugin(),
      preload({
        files: [
          {
            entryMatch: /(LOKI_compact)+.+(.svg)$/,
            attributes: {as: 'image'},
          },
          {
            entryMatch: /(lk_germany_reduced)+.+(.geojson)$/,
            attributes: {as: 'fetch', crossOrigin: 'anonymous'},
          },
          {
            entryMatch: /(lk_germany_reduced_list)+.+(.json)$/,
            attributes: {as: 'fetch', crossOrigin: 'anonymous'},
          },
        ],
      }),
    ],
    build: {
      assetsInlineLimit: 0,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/__tests__/setup.ts',
      coverage: {
        reporter: ['text', 'clover'],
        reportsDirectory: 'reports',
      },
      threads: false,
      server: {
        deps: {
          inline: ['vitest-canvas-mock'],
        },
      },
    },
  };
});
