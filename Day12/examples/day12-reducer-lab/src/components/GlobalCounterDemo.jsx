import { memo, useRef } from 'react'
import {
  GlobalCounterProvider,
  useCounterDispatch,
  useCounterState,
} from '../contexts/GlobalCounterContext.jsx'

// CounterReadout：只呼叫 useCounterState()，只關心「顯示目前的 count」，
// 完全不需要知道 dispatch 這個函式的存在。
function CounterReadout() {
  const state = useCounterState()
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  return (
    <div className="render-count-box">
      <p className="render-count-label">CounterReadout（只讀 count）</p>
      <p className="render-count-value">{state.count}</p>
      <p className="form-hint">被渲染次數：{renderCountRef.current}</p>
    </div>
  )
}

// CounterButtons：只呼叫 useCounterDispatch()，完全不需要讀取目前的 count 是多少。
// 因為 useReducer 回傳的 dispatch 函式參照永遠穩定（不會因為 count 改變而變成新的函式），
// 加上這裡讀取的是獨立的 CounterDispatchContext，所以 count 改變時，
// 這個元件（用 React.memo 包裝）完全不會被迫重新渲染——可以對照下面的渲染次數觀察。
function CounterButtonsInner() {
  const dispatch = useCounterDispatch()
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  return (
    <div className="render-count-box">
      <p className="render-count-label">CounterButtons（只讀 dispatch，React.memo 包裝）</p>
      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={() => dispatch({ type: 'counter/decrement' })}>
          -1
        </button>
        <button type="button" className="secondary-btn" onClick={() => dispatch({ type: 'counter/increment' })}>
          +1
        </button>
      </div>
      <p className="form-hint">被渲染次數：{renderCountRef.current}</p>
    </div>
  )
}
const CounterButtons = memo(CounterButtonsInner)

// DeepCounterWidget：中繼層元件，跟 Day11 的 DeepSidebar 一樣，
// 完全沒有 import 任何跟計數器有關的 Hook，純粹只是把兩個孫元件組合在一起，
// 藉此強調 Context 讓「不相關的中繼層」不需要知道底下元件在用什麼資料。
function DeepCounterWidget() {
  return (
    <div className="render-count-grid">
      <CounterReadout />
      <CounterButtons />
    </div>
  )
}

// GlobalCounterDemo：呼應 Day11 README 結尾提過的小預告——
// 把 useReducer 集中管理的更新邏輯，跟 useContext 結合成「輕量級全域狀態管理」，
// 不需要任何一層中繼元件手動轉傳 count 或 dispatch，這正是第四週要學的 Redux
// （store + dispatch + reducer）的簡化雛形。
function GlobalCounterDemo() {
  return (
    <section className="card">
      <h2>4️⃣ useReducer + useContext：輕量級全域狀態管理（銜接 Day11、預告 Redux）</h2>
      <p className="card-desc">
        呼應 Day11 學過的 Context：這裡把 <code>counterReducer</code> 透過
        <code>useReducer</code> 集中管理，再用兩個獨立的 Context 分別提供「狀態」與
        「dispatch 函式」，讓任意深度的子孫元件都能各自讀取 count、或呼叫 dispatch，
        不需要中繼層（<code>DeepCounterWidget</code>）幫忙轉傳任何 props。點擊 +1 / -1
        按鈕，觀察 <code>CounterReadout</code> 的渲染次數會跟著增加，而
        <code>CounterButtons</code>（只讀取 dispatch，且用 <code>React.memo</code> 包裝）
        的渲染次數則完全不受影響——這就是「state 與 dispatch 拆成兩個 Context」的效能好處。
        這個「store 集中管理狀態、透過 dispatch 送出 action、reducer 決定如何更新」的
        組合，正是第四週要學的 Redux 核心概念的簡化版本。
      </p>
      <GlobalCounterProvider>
        <DeepCounterWidget />
      </GlobalCounterProvider>
    </section>
  )
}

export default GlobalCounterDemo
