import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day12、Day13 的做法保留 <StrictMode>：開發模式下會讓每個元件
// 多掛載一次（掛載 → 卸載 → 再掛載），有助於及早發現 useEffect／自訂 Hook
// 忘記寫 cleanup 函式，或 Context/Reducer 初始化邏輯有副作用的問題。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
