// counterReducer：本檔案示範「最小可行」的 reducer，用來跟 useState 版本的計數器對照。
//
// reducer 函式的核心規則只有兩條：
// 1. 一定是「純函式」：輸入同樣的 (state, action)，永遠要算出同樣的結果，
//    函式內部不能有 fetch、console.log 以外的副作用、不能直接修改傳進來的 state。
// 2. 一定要「回傳一份新的 state」：即使只改一個欄位，也要用展開運算符（...）
//    產生新物件 / 新陣列，不能用 state.count++ 這種直接修改原本物件的寫法。
//
// action 是一個普通物件，慣例上至少要有一個 type 欄位，用來描述「發生了什麼事」；
// 如果還需要額外資料，通常會放在 payload 欄位裡（這個命名慣例來自 Flux / Redux）。
export const initialCounterState = { count: 0 }

export function counterReducer(state, action) {
  switch (action.type) {
    case 'counter/increment':
      return { count: state.count + 1 }
    case 'counter/decrement':
      return { count: state.count - 1 }
    case 'counter/incrementByAmount':
      return { count: state.count + action.payload.amount }
    case 'counter/reset':
      return { count: 0 }
    default:
      // 保留 default 分支並主動 throw，是刻意的設計：
      // 如果 dispatch 時打錯了 action.type（例如少打一個字），
      // 應該讓程式立刻噴出清楚的錯誤，而不是讓 reducer 靜靜地回傳原本的 state，
      // 讓「畫面明明按了按鈕卻毫無反應」這種難以追查的 bug 提早現形。
      throw new Error(`counterReducer 收到未知的 action type：${action.type}`)
  }
}
