// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import preload from 'unplugin-inject-preload/vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';

export default defineConfig(() => {
  return {
    assetsInclude: ['**/*.md', '**/*.geojson', '**/*.json5'],
    base: './',
    plugins: [
      react(),
      eslintPlugin(),
      tsconfigPaths(),
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
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'redux', 'react-redux', '@reduxjs/toolkit', 'redux-persist'],
            amCharts: ['@amcharts/amcharts5'],
            mui: [
              '@emotion/react',
              '@emotion/styled',
              '@mui/icons-material',
              '@mui/lab',
              '@mui/material',
              '@mui/system',
              '@mui/x-date-pickers',
            ],
            i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
            markdown: ['react-markdown', 'rehype-katex', 'remark-math'],
            misc: [
              'dayjs',
              'react-lazyload',
              'react-joyride',
              'react-oauth2-code-pkce',
              'react-scroll-sync',
              'json5',
              'rooks',
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './test/setup.ts',
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
