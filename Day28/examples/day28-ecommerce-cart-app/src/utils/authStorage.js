// utils/authStorage.js：純 JavaScript 的登入資訊存取工具，對照 Day24 的
// auth/authStorage.js。
//
// 跟 Day24 不同的地方：Day24 的登入狀態要給 loader / action（執行在 React
// 元件樹外面）讀取，所以完全不能用 Context／Redux；今天的登入狀態改放在
// Redux store（userSlice），任何元件都能直接用 useSelector 讀到，理論上
// 不需要另外操作 localStorage 也能運作。但重新整理瀏覽器時，Redux store
// 會被整個重建、回到 initialState——為了不讓使用者「明明剛剛登入，一
// 重新整理就變成沒登入」，這裡仍然沿用 Day24 的做法，把 token／使用者
// 資料多存一份在 localStorage，讓 userSlice 的 initialState 可以在模組載入
// 當下就讀出來、還原登入狀態。
const STORAGE_KEY = 'day28-auth'

// 讀出目前的登入資訊：{ token, user } 或 null（未登入）。
export function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // localStorage 內容如果被手動改壞（不是合法 JSON），視同未登入，
    // 而不是讓整個 App 因為 JSON.parse 拋出例外而白畫面。
    return null
  }
}

// 登入成功時呼叫：把 token 與使用者資料寫進 localStorage。
export function saveAuth({ token, user }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
}

// 登出時呼叫：清掉本機保存的登入資訊。
export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
