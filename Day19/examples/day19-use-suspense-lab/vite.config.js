import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// 開發伺服器（與 preview）都把 /api 開頭的請求轉發到 Express 後端
// （server/index.js，預設 http://localhost:4019），這樣前端程式碼裡
// 只需要呼叫相對路徑 fetch('/api/...')，不用處理跨來源（CORS）問題，
// 也不必把後端網址寫死在前端程式碼裡。
const apiProxy = {
  '/api': {
    target: 'http://localhost:4019',
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
