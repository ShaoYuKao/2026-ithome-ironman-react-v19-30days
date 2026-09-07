const STORAGE_KEY = 'day07-todo-list'

// 從 localStorage 讀取待辦清單。
// 這個函式會被當成 useState 的 Lazy Initializer 使用（見 TodoApp.jsx），
// 只會在元件「掛載」時被呼叫一次，不會每次重新渲染都重新讀取、解析一次。
export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // localStorage 只能存字串，取出來的 JSON 字串要先 parse 回陣列；
    // 如果是第一次使用（raw 是 null），就回傳空陣列當作初始狀態。
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    // 使用者可能手動改過 localStorage 內容導致 JSON 格式錯誤，
    // 或瀏覽器處於無痕模式 / 停用 localStorage 導致讀取失敗，
    // 這種情況不應該讓整個 App 直接白屏崩潰，改用空清單當作保底。
    console.error('讀取 localStorage 失敗，改用空清單啟動：', error)
    return []
  }
}

// 把目前的待辦清單完整寫回 localStorage。
// 呼叫時機：每次 todos 這個 state 改變「之後」，由呼叫端主動呼叫（見 TodoApp.jsx 的 updateTodos）。
export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    // 例如無痕模式下部分瀏覽器會讓 setItem 拋出例外、或儲存空間已滿，
    // 這裡選擇只記錄錯誤、不中斷畫面操作，讓使用者至少還能繼續使用（只是這筆不會被存起來）。
    console.error('寫入 localStorage 失敗：', error)
  }
}
