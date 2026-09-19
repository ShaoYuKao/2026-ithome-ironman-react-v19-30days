import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day12～Day18 的做法保留 <StrictMode>：開發模式下 React 會刻意
// 讓每個元件多渲染一次，幫你及早發現「渲染期間不該有的副作用」。
// 今天的兩個 Demo 都刻意設計成不受影響：
// - UserCard 讀取的 Promise 來自 utils/api.js 的 module-level 快取
//   （getUserPromise）：同一個 id 重複呼叫一定拿到「同一個」Promise 實例，
//   StrictMode 多渲染一次不會造成重複發送網路請求。
// - PriceFormattingLab／ProductPriceRow 呼叫 use(CurrencyContext) 只是單純
//   讀取資料、不含任何副作用，多渲染一次不會有任何影響。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
