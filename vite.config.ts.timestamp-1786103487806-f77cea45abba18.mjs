// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/SumanBiswas/Downloads/contentgen/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/SumanBiswas/Downloads/contentgen/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\SumanBiswas\\Downloads\\contentgen";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log("DEBUG: VITE_SERVER_URL =", env.VITE_SERVER_URL);
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            redux: ["@reduxjs/toolkit", "react-redux"],
            editors: ["@monaco-editor/react", "react-quill"]
          }
        }
      }
    },
    server: {
      port: 3e3,
      open: false
    },
    define: {
      global: "globalThis",
      "process.env.REACT_APP_SERVER_URL": JSON.stringify(env.VITE_SERVER_URL || "http://10.215.56.196:9000")
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxTdW1hbkJpc3dhc1xcXFxEb3dubG9hZHNcXFxcY29udGVudGdlblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcU3VtYW5CaXN3YXNcXFxcRG93bmxvYWRzXFxcXGNvbnRlbnRnZW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1N1bWFuQmlzd2FzL0Rvd25sb2Fkcy9jb250ZW50Z2VuL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG4gIGNvbnNvbGUubG9nKFwiREVCVUc6IFZJVEVfU0VSVkVSX1VSTCA9XCIsIGVudi5WSVRFX1NFUlZFUl9VUkwpO1xyXG4gIHJldHVybiB7XHJcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICAgcmVkdXg6IFsnQHJlZHV4anMvdG9vbGtpdCcsICdyZWFjdC1yZWR1eCddLFxyXG4gICAgICAgICAgICBlZGl0b3JzOiBbJ0Btb25hY28tZWRpdG9yL3JlYWN0JywgJ3JlYWN0LXF1aWxsJ10sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDMwMDAsXHJcbiAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcclxuICAgICAgJ3Byb2Nlc3MuZW52LlJFQUNUX0FQUF9TRVJWRVJfVVJMJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfU0VSVkVSX1VSTCB8fCAnaHR0cDovLzEwLjIxNS41Ni4xOTY6OTAwMCcpLFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1VCxTQUFTLGNBQWMsZUFBZTtBQUM3VixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxVQUFRLElBQUksNEJBQTRCLElBQUksZUFBZTtBQUMzRCxTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsUUFBUTtBQUFBLE1BQ1IsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxZQUNqRCxPQUFPLENBQUMsb0JBQW9CLGFBQWE7QUFBQSxZQUN6QyxTQUFTLENBQUMsd0JBQXdCLGFBQWE7QUFBQSxVQUNqRDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLG9DQUFvQyxLQUFLLFVBQVUsSUFBSSxtQkFBbUIsMkJBQTJCO0FBQUEsSUFDdkc7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
