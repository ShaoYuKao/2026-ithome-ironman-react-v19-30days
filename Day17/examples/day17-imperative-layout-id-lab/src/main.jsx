import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day12～Day16 的做法保留 <StrictMode>：開發模式下 React 會
// 刻意讓每個元件多執行一次渲染、多呼叫一次 Effect（掛載 → 卸載 → 再掛載），
// 用來幫你及早發現渲染過程或 Effect 裡不小心夾帶的副作用。今天第 2 個範例
// （useLayoutEffect vs useEffect 聊天室捲動）不受影響：StrictMode 只會多執行
// 「掛載」當下的 Effect，而兩邊要比較的「新訊息抵達後捲動到底部」行為，
// 都是掛載完成之後才由按鈕觸發的狀態更新，不會被多呼叫一次。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
