import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/** 后端地址: 开发时把 /hgapi 代理过去, 避免和前端路由(/rank、/explore)撞路径 */
const BACKEND = process.env.HG_BACKEND_URL ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // 生产构建挂在后端的 /ui 下(后端只接管了 /ui 这一个入口), 开发时走根路径
  base: command === 'build' ? '/ui/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 默认只绑 localhost, 手机/平板连不上; 绑到所有网卡才能走局域网
    host: true,
    proxy: {
      '/hgapi': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hgapi/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}))
