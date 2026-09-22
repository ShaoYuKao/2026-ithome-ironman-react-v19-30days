import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// 沿用 Day20、Day21 的做法：把 /api 開頭的請求轉發到 Express 後端
// （server/index.js，預設 http://localhost:4022），前端程式碼只需要呼叫
// 相對路徑 fetch('/api/...')，不需要處理跨來源（CORS）問題。
const apiProxy = {
  '/api': {
    target: 'http://localhost:4022',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
})
