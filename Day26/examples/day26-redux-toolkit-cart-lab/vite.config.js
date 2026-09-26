import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// 今天的練習重點是 Redux Toolkit 本身（configureStore／createSlice／
// useSelector／useDispatch），商品資料直接寫死在 src/data/products.js，
// 不需要呼叫後端 API，所以不像 Day20～Day24 那樣設定 /api 代理。
export default defineConfig({
  plugins: [react()],
})
