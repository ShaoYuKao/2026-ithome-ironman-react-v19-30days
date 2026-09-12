import { loadTodos } from '../utils/storage.js'

// FILTERS：跟 Day07 一樣，把「篩選條件」對應成純函式，搭配 Array.prototype.filter 使用。
export const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

// init：useReducer 的第三個參數（Lazy Initializer）。
// 跟 Day07 useState(loadTodos) 的用意完全相同——只在元件「掛載」時執行一次，
// 用來計算「比較貴」的初始值（這裡是讀取並解析 localStorage），
// 不會每次重新渲染都重新讀取一次。
//
// useReducer 的寫法會是：useReducer(todoReducer, undefined, initTodoState)
// 第二個參數 initialArg 傳 undefined，實際初始值改由 init(initialArg) 的回傳值決定。
export function initTodoState() {
  return {
    todos: loadTodos(),
    filter: 'all',
  }
}

// todoReducer：把 Day07 分散在 TodoApp.jsx 裡的 handleAdd / handleToggle / handleDelete /
// handleClearCompleted / setFilter 五個「修改 state 的邏輯」，全部集中改寫成這一個純函式。
//
// 好處：
// 1. 所有「todos 或 filter 可能發生的變化」都收斂在同一個地方，只要看這個檔案，
//    就能知道 state 一共有哪幾種合法的變化方式，不用再到處翻找每個 handleXxx 函式。
// 2. reducer 本身是一個普通的 JavaScript 函式，跟 React 沒有任何耦合，
//    可以直接用 todoReducer(state, action) 呼叫、寫單元測試，不需要渲染任何元件。
// 3. todos 與 filter 現在合併成同一份 state 物件管理──action 種類變多之後，
//    比起分別用兩個 useState，用 useReducer 更容易確保每種操作都回傳「結構一致」的完整 state。
export function todoReducer(state, action) {
  switch (action.type) {
    case 'todos/add': {
      const text = action.payload.text.trim()
      // 提早 return（Day06）：輸入內容是空白字串時，直接回傳原本的 state，不新增項目。
      if (text === '') {
        return state
      }
      const newTodo = {
        id: crypto.randomUUID(), // 穩定且唯一的 id，之後渲染列表時當作 key（Day06）
        text,
        completed: false,
      }
      return { ...state, todos: [...state.todos, newTodo] }
    }

    case 'todos/toggle': {
      const { id } = action.payload
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      }
    }

    case 'todos/delete': {
      const { id } = action.payload
      return { ...state, todos: state.todos.filter((todo) => todo.id !== id) }
    }

    case 'todos/clearCompleted':
      return { ...state, todos: state.todos.filter((todo) => !todo.completed) }

    case 'filter/change':
      return { ...state, filter: action.payload.filter }

    default:
      throw new Error(`todoReducer 收到未知的 action type：${action.type}`)
  }
}
