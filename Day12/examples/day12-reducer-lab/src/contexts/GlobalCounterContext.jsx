import { createContext, useContext, useReducer } from 'react'
import { counterReducer, initialCounterState } from '../reducers/counterReducer.js'

// 呼應 Day11 README 結尾提過的小預告：
// 「Context + 集中管理的更新邏輯」是很常見的輕量級全域狀態管理寫法。
// 這裡把同一份 counterReducer 拿來搭配 useContext，示範怎麼讓「任意深度的子孫元件」
// 都能讀取全域計數、或呼叫 dispatch 改變它，而不需要一層層手動傳遞 props。
//
// 特別把「狀態」跟「dispatch 函式」拆成兩個獨立的 Context，這是很實用的效能技巧：
// - CounterStateContext：只放目前的 count，count 改變時才會讓訂閱它的元件重新渲染。
// - CounterDispatchContext：只放 dispatch 函式本身。dispatch 是 useReducer 保證「參照永遠穩定」
//   的函式（不會因為重新渲染而改變），所以只讀取 dispatch、不讀取 count 的元件
//   （例如下面示範的按鈕列），完全不會因為 count 改變而被迫重新渲染。
const CounterStateContext = createContext(null)
const CounterDispatchContext = createContext(null)

function GlobalCounterProvider({ children }) {
  const [state, dispatch] = useReducer(counterReducer, initialCounterState)

  return (
    <CounterStateContext.Provider value={state}>
      <CounterDispatchContext.Provider value={dispatch}>{children}</CounterDispatchContext.Provider>
    </CounterStateContext.Provider>
  )
}

// 跟 Day11 的 useTheme() 一樣的防呆模式：包裝成自訂 Hook，
// 並在讀到預設值 null 時，直接丟出清楚的錯誤訊息，提醒忘記包 Provider。
function useCounterState() {
  const state = useContext(CounterStateContext)
  if (state === null) {
    throw new Error('useCounterState 必須在 <GlobalCounterProvider> 內使用')
  }
  return state
}

function useCounterDispatch() {
  const dispatch = useContext(CounterDispatchContext)
  if (dispatch === null) {
    throw new Error('useCounterDispatch 必須在 <GlobalCounterProvider> 內使用')
  }
  return dispatch
}

export { GlobalCounterProvider, useCounterState, useCounterDispatch } // eslint-disable-line react/only-export-components -- Provider 與其搭配的自訂 Hook 刻意放在同一檔案，方便對照學習
