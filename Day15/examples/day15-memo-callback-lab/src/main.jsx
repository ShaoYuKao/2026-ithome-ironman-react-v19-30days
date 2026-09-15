import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day12、Day13、Day14 的做法保留 <StrictMode>：開發模式下 React 會
// 刻意讓每個元件多執行一次渲染（及 useMemo／useCallback 的工廠函式），
// 用來幫你及早發現渲染過程中不小心夾帶的副作用。這也代表：開發模式下觀察
// 本章「已執行 N 次運算」時，數字可能會比你手動操作的次數多，這是 StrictMode
// 刻意造成的檢查機制，執行 `npm run build` 打包後的正式版本不會有這個現象。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
