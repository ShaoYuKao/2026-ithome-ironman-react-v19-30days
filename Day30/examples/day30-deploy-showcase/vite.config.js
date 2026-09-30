import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// 這裡改用「函式形式」的 defineConfig（其他天大多是物件形式），因為要讀取
// .env 系列檔案裡的 VITE_BASE_PATH，決定部署時的 base 路徑。vite.config.js
// 本身執行在 Node.js 建置階段，不會經過 Vite 的用戶端轉譯，所以不能像
// 元件程式碼那樣直接寫 import.meta.env.VITE_BASE_PATH，必須改用 Vite
// 官方提供的 loadEnv() 手動載入同一批 .env 檔案。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // base：打包後所有資源（.js／.css／圖片）的路徑前綴。
    // - 部署到 GitHub Pages「專案頁」（https://帳號.github.io/repo名稱/）時，
    //   必須設成 '/repo名稱/'，否則畫面會整個空白，開發者工具的 Network
    //   分頁會看到所有資源都 404（詳見 README 第五節）。
    // - 部署到 Vercel／Netlify，或 GitHub Pages 使用者頁時，維持 '/' 即可。
    base: env.VITE_BASE_PATH || '/',
  }
})
