import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest 會自動讀取這裡的 `test` 設定：用 jsdom 模擬瀏覽器環境（讓元件裡的
  // document / window 可以正常運作），並在每個測試檔案執行前先載入 setupFiles，
  // 掛上 @testing-library/jest-dom 的自訂 matcher（toBeInTheDocument 等）。
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
