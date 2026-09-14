// storage.js：延續 Day07、Day12 的做法——localStorage 只能存字串，
// 讀取、寫入都要搭配 JSON.parse / JSON.stringify，並用 try/catch 接住例外狀況
// （無痕模式、儲存空間已滿、資料被手動改壞等），避免整個 App 白屏崩潰。
const STORAGE_KEY = 'day14-dashboard-data'

// DEFAULT_STATE：第一次打開 App、或 localStorage 讀取失敗時使用的預設資料，
// 讓畫面一開始就有內容可以看，不會是完全空白的三個分頁。
const DEFAULT_STATE = {
  tasks: [
    { id: 'task-1', title: '複習 Day08～Day13 的 Hook 筆記', priority: 'high', completed: false },
    { id: 'task-2', title: '把 Day07 待辦清單改用 useReducer 重構', priority: 'medium', completed: true },
    { id: 'task-3', title: '練習自訂 Hook：useLocalStorage / useWindowSize', priority: 'low', completed: false },
  ],
  contacts: [
    { id: 'contact-1', name: '王小明', email: 'ming@example.com', phone: '0912-345-678' },
    { id: 'contact-2', name: '林小華', email: 'hua@example.com', phone: '0922-333-444' },
  ],
  notes: [
    {
      id: 'note-1',
      title: '本週學習心得',
      content: 'Context 解決了 Props Drilling，useReducer 讓多個相關的狀態變化集中管理。',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
}

export function loadDashboardState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_STATE
  } catch (error) {
    console.error('讀取 localStorage 失敗，改用預設資料啟動：', error)
    return DEFAULT_STATE
  }
}

export function saveDashboardState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('寫入 localStorage 失敗：', error)
  }
}
