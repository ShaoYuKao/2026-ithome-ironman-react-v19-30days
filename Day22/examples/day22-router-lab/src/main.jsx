import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day13、Day21 的做法保留 <StrictMode>：開發模式下會讓每個
// 元件多掛載一次，有助於及早發現 useEffect 忘記寫 cleanup 函式的問題。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
