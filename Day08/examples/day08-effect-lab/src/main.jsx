import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 這裡刻意保留 <StrictMode>：開發模式下，StrictMode 會讓每個元件「多掛載一次」
// （掛載 → 卸載 → 再掛載），藉此幫助我們及早發現「忘記寫 cleanup 函式」的 useEffect。
// 這也是今天範例執行時，畫面上的 log 會看起來「多一組」的原因，詳見 README 說明。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
