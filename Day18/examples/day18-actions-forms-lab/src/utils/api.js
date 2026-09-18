// 集中管理今天會用到的兩支 API 呼叫：會員註冊、留言板。
// 都是呼叫相對路徑 /api/...，實際會被 vite.config.js 的 proxy 設定轉發到
// server/index.js（Express，預設 http://localhost:4018）。
const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * 呼叫 POST /api/register。
 * 刻意不在這裡 catch 網路層級的例外（例如後端沒開），讓呼叫端
 * （RegistrationForm.jsx 的 registerAction）自己決定要怎麼處理——
 * 那裡也正好是示範「action 函式一定要自己 try/catch，否則例外會變成
 * Error Boundary 錯誤」的地方。
 */
export async function registerUser(values) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(values),
  })
  // 422（驗證失敗）跟 201（成功）都會回傳 JSON，所以不論 response.ok 與否
  // 都先嘗試解析 body，讓呼叫端可以直接讀 result.success / result.errors。
  return response.json()
}

export async function fetchComments() {
  const response = await fetch('/api/comments')
  if (!response.ok) {
    throw new Error(`無法取得留言清單（HTTP ${response.status}）`)
  }
  return response.json()
}

export async function postComment(payload) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.success) {
    throw new Error(data.message || `留言送出失敗（HTTP ${response.status}）`)
  }
  return data
}
