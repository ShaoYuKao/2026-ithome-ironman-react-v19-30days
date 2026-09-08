const STORAGE_KEY = 'day08-todo-list'

// 從 localStorage 讀取待辦清單，當成 useState 的 Lazy Initializer 使用（Day04），
// 只會在 TodoApp 元件掛載的第一次渲染被呼叫一次。
export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('讀取 localStorage 失敗，改用空清單啟動：', error)
    return []
  }
}

// 把目前的待辦清單完整寫回 localStorage。
// Day07 是由每個 handleXxx 函式手動呼叫；Day08 改成只在 TodoApp.jsx 的
// useEffect(() => { saveTodos(todos) }, [todos]) 這一個地方呼叫，todos 改變就自動同步。
export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.error('寫入 localStorage 失敗：', error)
  }
}
