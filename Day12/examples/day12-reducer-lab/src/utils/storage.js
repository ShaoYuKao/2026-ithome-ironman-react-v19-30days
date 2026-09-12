const STORAGE_KEY = 'day12-todo-list'

// 沿用 Day07 utils/storage.js 的做法：localStorage 只能存字串，
// 讀取、寫入都要搭配 JSON.parse / JSON.stringify，並用 try/catch 接住例外狀況
// （例如無痕模式讀寫失敗、或使用者手動改壞了內容），避免整個 App 白屏崩潰。
export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('讀取 localStorage 失敗，改用空清單啟動：', error)
    return []
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.error('寫入 localStorage 失敗：', error)
  }
}
