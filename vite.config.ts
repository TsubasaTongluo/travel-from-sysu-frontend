import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4523/m1/5038601-4699037-default',  // 后端服务的地址
        changeOrigin: true,               // 更改源头，解决跨域问题
        rewrite: (path) => path.replace(/^\/api/, ''), // 可选，移除 /api 前缀
      },
    },
  },
});