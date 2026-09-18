import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 沿用 Day08、Day12～Day17 的做法保留 <StrictMode>：開發模式下 React 會刻意
// 讓每個元件多渲染一次、多呼叫一次 Effect（掛載 → 卸載 → 再掛載），幫你及早
// 發現副作用寫得不乾淨的地方。今天的兩個 Demo 都不受影響：
// - RegistrationForm／CommentBoard 的送出邏輯（Action）是由「使用者按下送出
//   按鈕」這個真實的 submit 事件觸發，不是在渲染或 Effect 裡呼叫，
//   StrictMode 不會讓它多執行一次。
// - CommentBoard 掛載時用 useEffect 讀取留言清單，StrictMode 下會依照
//   Day08 教過的「掛載 → 清除 → 再掛載」流程多打一次 API，但透過 cleanup
//   裡的 ignore 旗標會忽略掉第一次（被丟棄的）結果，只套用第二次的結果。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
