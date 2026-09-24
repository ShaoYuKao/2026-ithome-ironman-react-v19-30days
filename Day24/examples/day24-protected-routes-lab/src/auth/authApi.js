// authApi.js：把「呼叫後端登入相關 API」的細節，統一包成三個函式，
// 讓 loader / action /元件都可以直接呼叫，不用重複寫 fetch 邏輯。
export async function loginRequest(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body.message || '登入失敗，請確認帳號密碼')
  }

  return body // { token, user }
}

// fetchProfile：呼叫受保護的 API，帶上 Authorization: Bearer <token>。
// 這支 API 才是真正驗證登入狀態的地方——前端的路由守衛只能改善使用者
// 體驗（避免畫面一閃而過），真正的資料保護一定要靠後端驗證 token。
export async function fetchProfile(token) {
  const res = await fetch('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 401) {
    const error = new Error('登入已過期，請重新登入')
    error.status = 401
    throw error
  }

  if (!res.ok) {
    throw new Error(`API 回應錯誤（狀態碼 ${res.status}）`)
  }

  return res.json() // { user, stats }
}

// logoutRequest：通知後端把這個 token 作廢，讓「登出」不只是清掉前端的
// localStorage，伺服器端也真的不再承認這個 token。
export async function logoutRequest(token) {
  await fetch('/api/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}
