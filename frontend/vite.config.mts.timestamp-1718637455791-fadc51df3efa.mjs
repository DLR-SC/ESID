// vite.config.mts
import { defineConfig, splitVendorChunkPlugin } from "file:///C:/Users/viol_gi/projects/ESID/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/viol_gi/projects/ESID/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tsconfigPaths from "file:///C:/Users/viol_gi/projects/ESID/frontend/node_modules/vite-tsconfig-paths/dist/index.mjs";
import preload from "file:///C:/Users/viol_gi/projects/ESID/frontend/node_modules/unplugin-inject-preload/dist/vite.js";
import eslintPlugin from "file:///C:/Users/viol_gi/projects/ESID/frontend/node_modules/@nabla/vite-plugin-eslint/src/index.mjs";
var vite_config_default = defineConfig((configEnv) => {
  return {
    assetsInclude: ["**/*.md", "**/*.geojson", "**/*.json5"],
    base: "./",
    plugins: [
      react(),
      eslintPlugin(),
      tsconfigPaths(),
      splitVendorChunkPlugin(),
      preload({
        files: [
          {
            entryMatch: /(LOKI_compact)+.+(.svg)$/,
            attributes: { as: "image" }
          },
          {
            entryMatch: /(lk_germany_reduced)+.+(.geojson)$/,
            attributes: { as: "fetch", crossOrigin: "anonymous" }
          },
          {
            entryMatch: /(lk_germany_reduced_list)+.+(.json)$/,
            attributes: { as: "fetch", crossOrigin: "anonymous" }
          }
        ]
      })
    ],
    build: {
      assetsInlineLimit: 0
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/__tests__/setup.ts",
      coverage: {
        reporter: ["text", "clover"],
        reportsDirectory: "reports"
      },
      threads: false,
      server: {
        deps: {
          inline: ["vitest-canvas-mock"]
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdmlvbF9naVxcXFxwcm9qZWN0c1xcXFxFU0lEXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2aW9sX2dpXFxcXHByb2plY3RzXFxcXEVTSURcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy92aW9sX2dpL3Byb2plY3RzL0VTSUQvZnJvbnRlbmQvdml0ZS5jb25maWcubXRzXCI7Ly8gU1BEWC1GaWxlQ29weXJpZ2h0VGV4dDogMjAyNCBHZXJtYW4gQWVyb3NwYWNlIENlbnRlciAoRExSKVxyXG4vLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQ0MwLTEuMFxyXG5cclxuaW1wb3J0IHtkZWZpbmVDb25maWcsIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW59IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuaW1wb3J0IHByZWxvYWQgZnJvbSAndW5wbHVnaW4taW5qZWN0LXByZWxvYWQvdml0ZSc7XHJcbmltcG9ydCBlc2xpbnRQbHVnaW4gZnJvbSAnQG5hYmxhL3ZpdGUtcGx1Z2luLWVzbGludCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKGNvbmZpZ0VudikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBhc3NldHNJbmNsdWRlOiBbJyoqLyoubWQnLCAnKiovKi5nZW9qc29uJywgJyoqLyouanNvbjUnXSxcclxuICAgIGJhc2U6ICcuLycsXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIGVzbGludFBsdWdpbigpLFxyXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXHJcbiAgICAgIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4oKSxcclxuICAgICAgcHJlbG9hZCh7XHJcbiAgICAgICAgZmlsZXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZW50cnlNYXRjaDogLyhMT0tJX2NvbXBhY3QpKy4rKC5zdmcpJC8sXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHthczogJ2ltYWdlJ30sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBlbnRyeU1hdGNoOiAvKGxrX2dlcm1hbnlfcmVkdWNlZCkrLisoLmdlb2pzb24pJC8sXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHthczogJ2ZldGNoJywgY3Jvc3NPcmlnaW46ICdhbm9ueW1vdXMnfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGVudHJ5TWF0Y2g6IC8obGtfZ2VybWFueV9yZWR1Y2VkX2xpc3QpKy4rKC5qc29uKSQvLFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7YXM6ICdmZXRjaCcsIGNyb3NzT3JpZ2luOiAnYW5vbnltb3VzJ30sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0pLFxyXG4gICAgXSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIGFzc2V0c0lubGluZUxpbWl0OiAwLFxyXG4gICAgfSxcclxuICAgIHRlc3Q6IHtcclxuICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICAgIHNldHVwRmlsZXM6ICcuL3NyYy9fX3Rlc3RzX18vc2V0dXAudHMnLFxyXG4gICAgICBjb3ZlcmFnZToge1xyXG4gICAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnY2xvdmVyJ10sXHJcbiAgICAgICAgcmVwb3J0c0RpcmVjdG9yeTogJ3JlcG9ydHMnLFxyXG4gICAgICB9LFxyXG4gICAgICB0aHJlYWRzOiBmYWxzZSxcclxuICAgICAgc2VydmVyOiB7XHJcbiAgICAgICAgZGVwczoge1xyXG4gICAgICAgICAgaW5saW5lOiBbJ3ZpdGVzdC1jYW52YXMtbW9jayddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsU0FBUSxjQUFjLDhCQUE2QjtBQUNuRCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sa0JBQWtCO0FBRXpCLElBQU8sc0JBQVEsYUFBYSxDQUFDLGNBQWM7QUFDekMsU0FBTztBQUFBLElBQ0wsZUFBZSxDQUFDLFdBQVcsZ0JBQWdCLFlBQVk7QUFBQSxJQUN2RCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxNQUN2QixRQUFRO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osWUFBWSxFQUFDLElBQUksUUFBTztBQUFBLFVBQzFCO0FBQUEsVUFDQTtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osWUFBWSxFQUFDLElBQUksU0FBUyxhQUFhLFlBQVc7QUFBQSxVQUNwRDtBQUFBLFVBQ0E7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFlBQVksRUFBQyxJQUFJLFNBQVMsYUFBYSxZQUFXO0FBQUEsVUFDcEQ7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsbUJBQW1CO0FBQUEsSUFDckI7QUFBQSxJQUNBLE1BQU07QUFBQSxNQUNKLGFBQWE7QUFBQSxNQUNiLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQSxRQUNSLFVBQVUsQ0FBQyxRQUFRLFFBQVE7QUFBQSxRQUMzQixrQkFBa0I7QUFBQSxNQUNwQjtBQUFBLE1BQ0EsU0FBUztBQUFBLE1BQ1QsUUFBUTtBQUFBLFFBQ04sTUFBTTtBQUFBLFVBQ0osUUFBUSxDQUFDLG9CQUFvQjtBQUFBLFFBQy9CO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
