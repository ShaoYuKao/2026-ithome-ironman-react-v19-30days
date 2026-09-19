// 集中管理「使用者資料 Promise」的快取。
//
// use(promise) 官方文件明確要求：同一份資料，重新渲染時一定要拿到「同一個」
// Promise 實例，否則每一次 render 都會被當成一次全新的非同步請求，Suspense
// 的 fallback 會不斷重新出現，畫面永遠停在 loading、進不去（詳見 README
// 第二節第 3 小節）。這裡用最簡單的 module-level Map 當快取——真實專案通常
// 會交給 Suspense-enabled 的框架或資料請求函式庫（例如 React Query）處理，
// 但底層原理都是「用同一把 key，快取同一個 Promise」。
const userPromiseCache = new Map()

async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `取得使用者資料失敗（HTTP ${response.status}）`)
  }
  return response.json()
}

/**
 * 取得（或建立）某個使用者 ID 對應的 Promise。
 * 同一個 id 重複呼叫，只要快取沒被清掉，一律回傳同一個 Promise 實例；
 * use() 才能在「已經 resolve 過」的情況下直接同步讀出結果，不再觸發 Suspense。
 */
export function getUserPromise(id) {
  if (!userPromiseCache.has(id)) {
    userPromiseCache.set(id, fetchUser(id))
  }
  return userPromiseCache.get(id)
}

/** 清掉某個使用者 ID 的快取，下一次 getUserPromise 會重新發出請求。 */
export function invalidateUser(id) {
  userPromiseCache.delete(id)
}
