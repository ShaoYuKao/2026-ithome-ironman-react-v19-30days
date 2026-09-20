import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day12～Day19 的做法保留 <StrictMode>：開發模式下 React 會刻意
// 讓每個元件多渲染一次，effect 也會跟著「執行 → 清除 → 再執行一次」。
// 今天的 useFetch 剛好完整示範了這件事為什麼「無害」：第一次 effect 執行
// 送出的請求，會在清除階段被 AbortController 取消（可以在瀏覽器的
// Network 面板看到一筆狀態是 canceled 的請求），第二次 effect 執行送出的
// 請求才會真正完成、更新畫面。這正是本日 useFetch 認真處理 AbortController
// 之後才有的效果——如果只像 Day08 一樣用旗標「忽略」結果，
// 每次掛載都會讓瀏覽器多發送一次已經用不到的網路請求。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
