import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day13 的做法保留 <StrictMode>：開發模式下會讓每個元件
// 多掛載一次（掛載 → 卸載 → 再掛載），有助於及早發現今天函式庫裡
// useEffect 忘記寫 cleanup 函式的問題。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
