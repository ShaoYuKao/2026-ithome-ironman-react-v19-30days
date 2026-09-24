// authStorage.js：純 JavaScript 的登入資訊存取工具，刻意不 import 任何
// React 的東西（沒有 useState、沒有 Context）。
//
// 為什麼不像 Day11 一樣改用 Context 管理登入狀態？
// 因為 React Router 的 loader / action 函式執行在 React 元件樹「外面」
// （呼叫它們的時機，是使用者導覽網址的當下，不是元件渲染的當下），沒辦法
// 呼叫 useContext、useState 這些 Hook。所以這裡把「讀寫登入資訊」抽成一組
// 單純的函式，元件（透過 useRouteLoaderData 讀 loader 資料）與 loader /
// action（直接 import 呼叫）都可以共用同一份邏輯，不必各寫一套。
const STORAGE_KEY = 'day24-auth'

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

export function getToken() {
  return getAuth()?.token ?? null
}

// 登入成功時呼叫：把 token 與使用者資料寫進 localStorage。
export function saveAuth({ token, user }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
}

// 登出、或 token 被後端判定失效時呼叫：清掉本機保存的登入資訊。
export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
